import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

interface TeamChatClient {
  ws: WebSocket;
  adminId: string;
  adminName: string;
  conversationIds: Set<string>;
}

const clients = new Map<string, TeamChatClient>();

export function setupTeamChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    noServer: true
  });

  // Handle upgrade requests manually for better proxy compatibility
  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
    if (pathname === '/ws/team-chat') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (ws, req) => {
    let client: TeamChatClient | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'auth':
            client = await handleAuth(ws, message);
            if (client) {
              clients.set(client.adminId, client);
              ws.send(JSON.stringify({ type: 'auth_success', adminId: client.adminId }));
              broadcastPresence(client.adminId, 'online');
            } else {
              ws.send(JSON.stringify({ type: 'auth_error', error: 'Authentication failed' }));
              ws.close();
            }
            break;

          case 'join_conversation':
            if (client) {
              await handleJoinConversation(client, message.conversationId);
            }
            break;

          case 'leave_conversation':
            if (client && message.conversationId) {
              client.conversationIds.delete(message.conversationId);
            }
            break;

          case 'send_message':
            if (client && message.conversationId) {
              await handleSendMessage(client, message.conversationId, message.content, message.replyToId);
            }
            break;

          case 'typing':
            if (client && message.conversationId) {
              broadcastToConversation(message.conversationId, {
                type: 'typing',
                adminId: client.adminId,
                adminName: client.adminName,
              }, client.adminId);
            }
            break;

          case 'stop_typing':
            if (client && message.conversationId) {
              broadcastToConversation(message.conversationId, {
                type: 'stop_typing',
                adminId: client.adminId,
              }, client.adminId);
            }
            break;

          case 'mark_read':
            if (client && message.conversationId && message.lastMessageId) {
              await storage.markTeamChatMessagesRead(message.conversationId, client.adminId, message.lastMessageId);
            }
            break;

          case 'get_presence':
            if (client) {
              const onlineAdmins = getOnlineAdmins();
              ws.send(JSON.stringify({ type: 'presence_list', admins: onlineAdmins }));
            }
            break;
        }
      } catch (error) {
        console.error('Team Chat WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (client) {
        clients.delete(client.adminId);
        broadcastPresence(client.adminId, 'offline');
      }
    });

    ws.on('error', (error) => {
      console.error('Team Chat WebSocket error:', error);
    });
  });

  return wss;
}

async function handleAuth(ws: WebSocket, message: any): Promise<TeamChatClient | null> {
  try {
    const token = message.token;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret') as any;
    const admin = await storage.getAdminUser(decoded.adminId);
    if (!admin) return null;

    const conversations = await storage.getTeamChatConversations(admin.id);
    const conversationIds = new Set<string>(conversations.map((c: any) => c.id));

    return { 
      ws, 
      adminId: admin.id, 
      adminName: admin.username,
      conversationIds 
    };
  } catch (error) {
    console.error('Team Chat auth error:', error);
  }
  return null;
}

async function handleJoinConversation(client: TeamChatClient, conversationId: string) {
  const isParticipant = await storage.isTeamChatParticipant(conversationId, client.adminId);
  
  if (!isParticipant) {
    client.ws.send(JSON.stringify({ type: 'error', error: 'Not a participant of this conversation' }));
    return;
  }

  client.conversationIds.add(conversationId);
  
  const messages = await storage.getTeamChatMessages(conversationId, 50);
  
  if (messages.length > 0) {
    await storage.markTeamChatMessagesRead(conversationId, client.adminId, messages[0].id);
  }

  client.ws.send(JSON.stringify({
    type: 'conversation_joined',
    conversationId,
    messages,
  }));

  broadcastToConversation(conversationId, {
    type: 'user_joined',
    adminId: client.adminId,
    adminName: client.adminName,
  }, client.adminId);
}

async function handleSendMessage(client: TeamChatClient, conversationId: string, content: string, replyToId?: string) {
  if (!content.trim()) return;

  const isParticipant = await storage.isTeamChatParticipant(conversationId, client.adminId);
  if (!isParticipant) {
    client.ws.send(JSON.stringify({ type: 'error', error: 'Not a participant' }));
    return;
  }

  const messageRecord = await storage.createTeamChatMessage({
    conversationId,
    senderId: client.adminId,
    message: content.trim(),
    replyToMessageId: replyToId || null,
  });

  const enrichedMessage = {
    ...messageRecord,
    sender: {
      id: client.adminId,
      username: client.adminName,
    }
  };

  broadcastToConversation(conversationId, {
    type: 'new_message',
    message: enrichedMessage,
  });

  await createMessageNotifications(conversationId, enrichedMessage, client.adminId);
}

function broadcastToConversation(conversationId: string, message: any, excludeAdminId?: string) {
  clients.forEach((client) => {
    if (client.conversationIds.has(conversationId) && client.adminId !== excludeAdminId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}

function broadcastPresence(adminId: string, status: 'online' | 'offline') {
  const message = { type: 'presence_update', adminId, status };
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

async function createMessageNotifications(conversationId: string, msg: any, senderId: string) {
  const participants = await storage.getTeamChatParticipants(conversationId);
  
  for (const participant of participants) {
    if (participant.adminUserId === senderId) continue;
    
    const participantClient = clients.get(participant.adminUserId);
    if (!participantClient || !participantClient.conversationIds.has(conversationId)) {
      const msgContent = msg.message || '';
      await storage.createNotification({
        recipientType: 'admin',
        recipientId: participant.adminUserId,
        type: 'chat_message' as const,
        title: 'New Team Message',
        message: `${msg.sender?.username || 'Team member'}: ${msgContent.substring(0, 50)}${msgContent.length > 50 ? '...' : ''}`,
        data: { conversationId, messageId: msg.id },
      });
    }
  }
}

export function getOnlineAdmins(): string[] {
  return Array.from(clients.keys());
}

export function isAdminOnline(adminId: string): boolean {
  return clients.has(adminId);
}
