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
    noServer: true
  });

  // Handle upgrade requests manually for better proxy compatibility
  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
    if (pathname === '/ws/chat') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (ws, req) => {
    console.log('[Chat WebSocket] New connection established');
    let client: ChatClient | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('[Chat WebSocket] Received message:', message.type);

        switch (message.type) {
          case 'auth':
            console.log('[Chat WebSocket] Auth attempt for userType:', message.userType);
            client = await handleAuth(ws, message);
            if (client) {
              clients.set(client.userId, client);
              console.log('[Chat WebSocket] Auth success for userId:', client.userId);
              ws.send(JSON.stringify({ type: 'auth_success', userId: client.userId }));
            } else {
              console.log('[Chat WebSocket] Auth failed');
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

          case 'add_reaction':
            if (client && message.messageId && message.emoji) {
              await handleAddReaction(client, message.messageId, message.emoji);
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

    ws.on('close', (code, reason) => {
      console.log('[Chat WebSocket] Connection closed, code:', code, 'reason:', reason?.toString());
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
      console.error('[Chat WebSocket] Error:', error);
    });
  });

  return wss;
}

async function handleAuth(ws: WebSocket, message: any): Promise<ChatClient | null> {
  try {
    if (message.userType === 'customer') {
      const token = message.token;
      if (!token) return null;
      
      // Verify customer JWT token
      const JWT_SECRET = process.env.SESSION_SECRET || "shinara-mall-secret-key-change-in-production";
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = await storage.getUser(decoded.userId);
      if (!user || !user.isActive) return null;

      return { ws, userId: user.id, userType: 'customer' };
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

async function handleAddReaction(client: ChatClient, messageId: string, emoji: string) {
  const msg = await storage.getChatMessage(messageId);
  if (!msg || msg.conversationId !== client.conversationId) return;

  const reactions: Record<string, string[]> = (msg.reactions as any) || {};
  const users = reactions[emoji] || [];
  const idx = users.indexOf(client.userId);
  if (idx === -1) {
    reactions[emoji] = [...users, client.userId];
  } else {
    reactions[emoji] = users.filter((u) => u !== client.userId);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  }

  const updated = await storage.updateChatMessageReactions(messageId, reactions);
  broadcastToConversation(msg.conversationId, {
    type: 'reaction_updated',
    message: updated,
  });
}

async function handleSendMessage(client: ChatClient, content: string, attachments?: any) {
  if (!client.conversationId || (!content.trim() && (!attachments || attachments.length === 0))) return;

  const message = await storage.createChatMessage({
    conversationId: client.conversationId,
    senderId: client.userId,
    senderType: client.userType,
    message: content.trim() || ' ',
    attachments: attachments || [],
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
