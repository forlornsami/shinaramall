import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import type { ChatMessage } from '@shared/schema';

interface ChatClient {
  ws: WebSocket;
  userId: string;
  userType: 'customer' | 'agent';
  conversationId?: string;
}

const clients = new Map<string, ChatClient>();

export function setupChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws/chat'
  });

  wss.on('connection', async (ws, req) => {
    let client: ChatClient | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            client = await handleAuth(ws, message);
            if (client) {
              clients.set(client.userId, client);
              ws.send(JSON.stringify({ type: 'auth_success', userId: client.userId }));
            } else {
              ws.send(JSON.stringify({ type: 'auth_error', error: 'Authentication failed' }));
              ws.close();
            }
            break;

          case 'join_conversation':
            if (client) {
              client.conversationId = message.conversationId;
              await handleJoinConversation(client, message.conversationId);
            }
            break;

          case 'send_message':
            if (client && client.conversationId) {
              await handleSendMessage(client, message.content, message.attachments);
            }
            break;

          case 'typing':
            if (client && client.conversationId) {
              broadcastToConversation(client.conversationId, {
                type: 'typing',
                userId: client.userId,
                userType: client.userType,
              }, client.userId);
            }
            break;

          case 'mark_read':
            if (client && message.conversationId) {
              const senderType = client.userType === 'agent' ? 'customer' : 'agent';
              await storage.markMessagesAsRead(message.conversationId, senderType);
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (client) {
        clients.delete(client.userId);
        if (client.conversationId) {
          broadcastToConversation(client.conversationId, {
            type: 'user_left',
            userId: client.userId,
            userType: client.userType,
          }, client.userId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

async function handleAuth(ws: WebSocket, message: any): Promise<ChatClient | null> {
  try {
    if (message.userType === 'customer') {
      const userId = message.userId;
      if (!userId) return null;
      
      const user = await storage.getUser(userId);
      if (!user) return null;

      return { ws, userId, userType: 'customer' };
    } else if (message.userType === 'agent') {
      const token = message.token;
      if (!token) return null;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret') as any;
      const admin = await storage.getAdminUser(decoded.adminId);
      if (!admin) return null;

      return { ws, userId: admin.id, userType: 'agent' };
    }
  } catch (error) {
    console.error('Auth error:', error);
  }
  return null;
}

async function handleJoinConversation(client: ChatClient, conversationId: string) {
  const conversation = await storage.getChatConversation(conversationId);
  
  if (!conversation) {
    client.ws.send(JSON.stringify({ type: 'error', error: 'Conversation not found' }));
    return;
  }

  if (client.userType === 'customer' && conversation.customerId !== client.userId) {
    client.ws.send(JSON.stringify({ type: 'error', error: 'Unauthorized' }));
    return;
  }

  const senderType = client.userType === 'agent' ? 'customer' : 'agent';
  await storage.markMessagesAsRead(conversationId, senderType);

  client.ws.send(JSON.stringify({
    type: 'conversation_joined',
    conversation,
    messages: conversation.messages || [],
  }));

  broadcastToConversation(conversationId, {
    type: 'user_joined',
    userId: client.userId,
    userType: client.userType,
  }, client.userId);
}

async function handleSendMessage(client: ChatClient, content: string, attachments?: any) {
  if (!client.conversationId || !content.trim()) return;

  const message = await storage.createChatMessage({
    conversationId: client.conversationId,
    senderId: client.userId,
    senderType: client.userType,
    message: content.trim(),
  });

  broadcastToConversation(client.conversationId, {
    type: 'new_message',
    message,
  });

  if (client.userType === 'customer') {
    await createAgentNotification(client.conversationId, message);
  } else {
    await createCustomerNotification(client.conversationId, message);
  }
}

function broadcastToConversation(conversationId: string, message: any, excludeUserId?: string) {
  clients.forEach((client) => {
    if (client.conversationId === conversationId && client.userId !== excludeUserId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}

async function createAgentNotification(conversationId: string, message: ChatMessage) {
  const conversation = await storage.getChatConversation(conversationId);
  if (!conversation) return;

  if (conversation.assignedAgentId) {
    const agentClient = clients.get(conversation.assignedAgentId);
    if (!agentClient || agentClient.conversationId !== conversationId) {
      await storage.createNotification({
        recipientType: 'admin',
        recipientId: conversation.assignedAgentId,
        type: 'chat_message',
        title: 'New Chat Message',
        message: `Customer ${conversation.customer?.firstName || 'Customer'} sent a message`,
        data: { conversationId, messageId: message.id },
      });
    }
  }
}

async function createCustomerNotification(conversationId: string, message: ChatMessage) {
  const conversation = await storage.getChatConversation(conversationId);
  if (!conversation) return;

  const customerClient = clients.get(conversation.customerId);
  if (!customerClient || customerClient.conversationId !== conversationId) {
    await storage.createNotification({
      recipientType: 'customer',
      recipientId: conversation.customerId,
      type: 'chat_message',
      title: 'New Chat Message',
      message: 'Support agent responded to your inquiry',
      data: { conversationId, messageId: message.id },
    });
  }
}

export function getOnlineAgents(): string[] {
  const agentIds: string[] = [];
  clients.forEach((client) => {
    if (client.userType === 'agent') {
      agentIds.push(client.userId);
    }
  });
  return agentIds;
}

export function isUserOnline(userId: string): boolean {
  return clients.has(userId);
}
