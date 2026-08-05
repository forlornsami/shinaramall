import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { getWsUrl } from '@/lib/api-base';
import { format } from 'date-fns';
import type { ChatMessage, ChatConversationWithDetails } from '@shared/schema';

interface ChatSupportProps {
  adminToken: string;
  adminId: string;
}

export default function ChatSupport({ adminToken, adminId }: ChatSupportProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wsConnected, setWsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery<ChatConversationWithDetails[]>({
    queryKey: ['/api/admin/chat/conversations', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/admin/chat/conversations${params}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: currentConversation, refetch: refetchCurrentConversation } = useQuery<ChatConversationWithDetails>({
    queryKey: ['/api/admin/chat/conversations', selectedConversation],
    queryFn: async () => {
      const response = await fetch(`/api/admin/chat/conversations/${selectedConversation}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch conversation');
      return response.json();
    },
    enabled: !!selectedConversation,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/admin/chat/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/chat/conversations/${selectedConversation}/messages`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: wsConnected ? false : 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/admin/chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
      setMessage('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: string }) => {
      const response = await fetch(`/api/admin/chat/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      refetchConversations();
      refetchCurrentConversation();
    },
  });

  const assignAgentMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/admin/chat/conversations/${conversationId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to assign agent');
      return response.json();
    },
    onSuccess: () => {
      refetchConversations();
      refetchCurrentConversation();
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!selectedConversation || !adminToken) return;

    const ws = new WebSocket(getWsUrl('/ws/chat'));
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'auth',
        userType: 'agent',
        token: adminToken,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'auth_success':
          setWsConnected(true);
          ws.send(JSON.stringify({
            type: 'join_conversation',
            conversationId: selectedConversation,
          }));
          break;

        case 'new_message':
          refetchMessages();
          refetchConversations();
          break;

        case 'typing':
          if (data.userType === 'customer') {
            setIsTyping(true);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
          }
          break;

        case 'user_joined':
        case 'user_left':
          refetchCurrentConversation();
          break;
      }
    };

    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      ws.close();
    };
  }, [selectedConversation, adminToken]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        content: message.trim(),
      }));
      setMessage('');
      setTimeout(() => refetchMessages(), 100);
    } else {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      open: { variant: 'destructive', icon: AlertCircle },
      in_progress: { variant: 'default', icon: Clock },
      resolved: { variant: 'secondary', icon: CheckCircle },
      closed: { variant: 'outline', icon: CheckCircle },
    };
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4" data-testid="chat-support-container">
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => refetchConversations()}
              data-testid="button-refresh-conversations"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conversations</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                    data-testid={`conversation-item-${conv.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conv.customer?.firstName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {conv.customer?.firstName || 'Customer'} {conv.customer?.lastName || ''}
                          </p>
                          {(conv.unreadCount ?? 0) > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.customer?.email}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          {getStatusBadge(conv.status)}
                          <span className="text-xs text-muted-foreground">
                            {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'MMM d, h:mm a') : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        {selectedConversation && currentConversation ? (
          <>
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {currentConversation.customer?.firstName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {currentConversation.customer?.firstName || 'Customer'} {currentConversation.customer?.lastName || ''}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.customer?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wsConnected ? 'default' : 'secondary'}>
                    {wsConnected ? 'Live' : 'Polling'}
                  </Badge>
                  {getStatusBadge(currentConversation.status)}
                  
                  {!currentConversation.assignedAgentId && (
                    <Button
                      size="sm"
                      onClick={() => assignAgentMutation.mutate(currentConversation.id)}
                      disabled={assignAgentMutation.isPending}
                      data-testid="button-assign-to-me"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Assign to Me
                    </Button>
                  )}
                  
                  <Select
                    value={currentConversation.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ 
                      conversationId: currentConversation.id, 
                      status 
                    })}
                  >
                    <SelectTrigger className="w-32" data-testid="select-conversation-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`admin-chat-message-${msg.id}`}
                  >
                    {msg.senderType === 'customer' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {currentConversation.customer?.firstName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.senderType === 'agent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.senderType === 'agent' ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                      </p>
                    </div>
                    {msg.senderType === 'agent' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          A
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {currentConversation.customer?.firstName?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-admin-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  data-testid="button-admin-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Select a Conversation</h3>
              <p className="text-sm">Choose a conversation from the list to start responding</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
