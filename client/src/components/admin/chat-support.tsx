import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageCircle,
  Send,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { getWsUrl } from '@/lib/api-base';
import { format } from 'date-fns';
import type { ChatMessage, ChatConversationWithDetails } from '@shared/schema';

interface ChatSupportProps {
  adminToken: string;
  adminId: string;
}

/** A message added instantly to the UI before the server confirms it. */
interface OptimisticMsg {
  tempId: string;
  text: string;
  createdAt: Date;
}

export default function ChatSupport({ adminToken, adminId }: ChatSupportProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wsConnected, setWsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── Optimistic messages ──────────────────────────────────────────────────
  const [optimisticMsgs, setOptimisticMsgs] = useState<OptimisticMsg[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } =
    useQuery<ChatConversationWithDetails[]>({
      queryKey: ['/api/admin/chat/conversations', statusFilter],
      queryFn: async () => {
        const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
        const res = await fetch(`/api/admin/chat/conversations${params}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return res.json();
      },
      refetchInterval: 10000,
    });

  const { data: currentConversation, refetch: refetchCurrentConversation } =
    useQuery<ChatConversationWithDetails>({
      queryKey: ['/api/admin/chat/conversations', selectedConversation],
      queryFn: async () => {
        const res = await fetch(`/api/admin/chat/conversations/${selectedConversation}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch conversation');
        return res.json();
      },
      enabled: !!selectedConversation,
    });

  const { data: serverMessages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/admin/chat/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/chat/conversations/${selectedConversation}/messages`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: wsConnected ? false : 5000,
  });

  // ── Drop optimistic messages once the server version appears ─────────────
  useEffect(() => {
    if (optimisticMsgs.length === 0 || serverMessages.length === 0) return;
    setOptimisticMsgs((prev) =>
      prev.filter(
        (opt) =>
          !serverMessages.some(
            (m) =>
              m.senderType === 'agent' &&
              m.message?.trim() === opt.text.trim() &&
              Math.abs(new Date(m.createdAt!).getTime() - opt.createdAt.getTime()) < 30_000,
          ),
      ),
    );
  }, [serverMessages]);

  // ── REST fallback mutation (used when WS is not open) ───────────────────
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/admin/chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
    },
    onError: (_err, content) => {
      // Remove the matching optimistic message so the admin knows it failed
      setOptimisticMsgs((prev) => prev.filter((o) => o.text !== content));
    },
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: string }) => {
      const res = await fetch(`/api/admin/chat/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      refetchConversations();
      refetchCurrentConversation();
    },
  });

  const assignAgentMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await fetch(`/api/admin/chat/conversations/${conversationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to assign agent');
      return res.json();
    },
    onSuccess: () => {
      refetchConversations();
      refetchCurrentConversation();
    },
  });

  // ── Scroll ───────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [serverMessages, optimisticMsgs, isTyping, scrollToBottom]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConversation || !adminToken) return;

    // Reset optimistic messages when switching conversations
    setOptimisticMsgs([]);

    const ws = new WebSocket(getWsUrl('/ws/chat'));
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userType: 'agent', token: adminToken }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'auth_success':
          setWsConnected(true);
          ws.send(JSON.stringify({ type: 'join_conversation', conversationId: selectedConversation }));
          break;
        case 'new_message':
          queryClient.invalidateQueries({
            queryKey: ['/api/admin/chat/conversations', selectedConversation, 'messages'],
          });
          refetchConversations();
          break;
        case 'typing':
          if (data.userType === 'customer') {
            setIsTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
    ws.onclose  = () => setWsConnected(false);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      ws.close();
      setWsConnected(false);
    };
  }, [selectedConversation, adminToken]);

  // ── Send (optimistic) ────────────────────────────────────────────────────
  const handleSendMessage = useCallback(() => {
    const text = message.trim();
    if (!text || !selectedConversation) return;

    // 1. Show message instantly
    const optimistic: OptimisticMsg = { tempId: `opt-${Date.now()}`, text, createdAt: new Date() };
    setOptimisticMsgs((prev) => [...prev, optimistic]);

    // 2. Clear input immediately and refocus
    setMessage('');
    setTimeout(() => inputRef.current?.focus(), 0);

    // 3. Deliver in background
    if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'send_message', content: text }));
      // WS broadcasts new_message back → cache invalidates → useEffect drops the optimistic entry
    } else {
      sendMessageMutation.mutate(text);
    }
  }, [message, selectedConversation, wsConnected, sendMessageMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Status badge ─────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const cfg: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      open:        { variant: 'destructive', icon: AlertCircle },
      in_progress: { variant: 'default',     icon: Clock },
      resolved:    { variant: 'secondary',   icon: CheckCircle },
      closed:      { variant: 'outline',     icon: CheckCircle },
    };
    const { variant, icon: Icon } = cfg[status] || cfg.open;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const customerInitial =
    currentConversation?.customer?.firstName?.charAt(0) ||
    (currentConversation as any)?.guestDisplayName?.charAt(0) ||
    'C';

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-120px)] gap-4" data-testid="chat-support-container">
      {/* ── Conversation list ───────────────────────────────────────────── */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => refetchConversations()}
              data-testid="button-refresh-conversations">
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
                  <button key={conv.id} onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                    data-testid={`conversation-item-${conv.id}`}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conv.customer?.firstName?.charAt(0) ||
                            (conv as any).guestDisplayName?.charAt(0) || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {conv.customer
                              ? `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() || 'Customer'
                              : ((conv as any).guestDisplayName || 'Guest')}
                          </p>
                          {(conv.unreadCount ?? 0) > 0 && (
                            <Badge variant="destructive" className="ml-2 shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.customer?.email || 'Guest visitor'}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          {getStatusBadge(conv.status)}
                          <span className="text-xs text-muted-foreground">
                            {conv.lastMessageAt
                              ? format(new Date(conv.lastMessageAt), 'MMM d, h:mm a')
                              : ''}
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

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      <Card className="flex-1 flex flex-col min-w-0">
        {selectedConversation && currentConversation ? (
          <>
            {/* Header */}
            <CardHeader className="pb-2 border-b shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {currentConversation.customer?.firstName?.charAt(0) ||
                        (currentConversation as any).guestDisplayName?.charAt(0) || 'G'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {currentConversation.customer
                        ? `${currentConversation.customer.firstName || ''} ${currentConversation.customer.lastName || ''}`.trim() || 'Customer'
                        : ((currentConversation as any).guestDisplayName || 'Guest')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.customer?.email || 'Guest visitor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={wsConnected ? 'default' : 'secondary'}>
                    {wsConnected ? 'Live' : 'Polling'}
                  </Badge>
                  {getStatusBadge(currentConversation.status)}
                  {!currentConversation.assignedAgentId && (
                    <Button size="sm"
                      onClick={() => assignAgentMutation.mutate(currentConversation.id)}
                      disabled={assignAgentMutation.isPending}
                      data-testid="button-assign-to-me">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Assign to Me
                    </Button>
                  )}
                  <Select
                    value={currentConversation.status}
                    onValueChange={(status) =>
                      updateStatusMutation.mutate({ conversationId: currentConversation.id, status })
                    }>
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

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {serverMessages.length === 0 && optimisticMsgs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                )}

                {/* Server-confirmed messages */}
                {serverMessages.map((msg) => (
                  <div key={msg.id}
                    className={`flex gap-2 ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`admin-chat-message-${msg.id}`}>
                    {msg.senderType !== 'agent' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {customerInitial}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.senderType === 'agent'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {/* Attachments */}
                      {(msg.attachments as any[])?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {(msg.attachments as any[]).map((att: any, i: number) => {
                            const isImg = att.type?.startsWith('image/');
                            return isImg ? (
                              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                                <img src={att.url} alt={att.name}
                                  className="h-24 w-24 rounded-lg object-cover border border-white/20 hover:opacity-90 transition-opacity cursor-pointer" />
                              </a>
                            ) : (
                              <a key={i} href={att.url} download={att.name}
                                className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/20 text-xs hover:bg-white/10 transition-colors">
                                📎 {att.name}
                              </a>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.senderType === 'agent' ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                      </p>
                    </div>
                    {msg.senderType === 'agent' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">A</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Optimistic (pending) messages */}
                {optimisticMsgs.map((opt) => (
                  <div key={opt.tempId} className="flex gap-2 justify-end opacity-75">
                    <div className="max-w-[70%] flex flex-col items-end gap-0.5">
                      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2">
                        <p className="text-sm whitespace-pre-wrap break-words">{opt.text}</p>
                        <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                          {format(opt.createdAt, 'h:mm a')}
                          <Clock className="h-3 w-3" />
                        </p>
                      </div>
                    </div>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">A</AvatarFallback>
                    </Avatar>
                  </div>
                ))}

                {/* Customer typing indicator */}
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {customerInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay}
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  data-testid="input-admin-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  data-testid="button-admin-send-message">
                  <Send className="h-4 w-4" />
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
