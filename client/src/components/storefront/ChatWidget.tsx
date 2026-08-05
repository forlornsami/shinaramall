import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle, X, Send, Loader2, Paperclip, Smile,
  ImageIcon, FileText, CheckCheck, Wifi, WifiOff,
} from 'lucide-react';
import { queryClient, getToken } from '@/lib/queryClient';
import { format, isToday, isYesterday } from 'date-fns';
import type { ChatMessage, ChatConversationWithDetails } from '@shared/schema';

// ── Emoji palette for reactions ──────────────────────────────────────────────
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface PendingAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;  // base64 data URI for preview + upload
}

interface ChatWidgetProps {
  userId: string;
  userName: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function formatMessageTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Reaction picker (shown on hover) ─────────────────────────────────────────
function ReactionPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="absolute -top-9 left-0 flex items-center gap-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-1 shadow-lg z-20 animate-in fade-in slide-in-from-bottom-1 duration-150">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => { e.stopPropagation(); onPick(emoji); }}
          className="text-base hover:scale-125 transition-transform leading-none px-0.5"
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({
  msg,
  isOwn,
  userName,
  wsRef,
  wsConnected,
  conversationId,
}: {
  msg: ChatMessage & { reactions?: Record<string, string[]>; attachments?: { name: string; url: string; type: string; size: number }[] };
  isOwn: boolean;
  userName: string;
  wsRef: React.RefObject<WebSocket | null>;
  wsConnected: boolean;
  conversationId: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const reactions = (msg.reactions as Record<string, string[]>) || {};
  const hasReactions = Object.keys(reactions).length > 0;

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => setShowPicker(true), 400);
  };
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowPicker(false);
  };

  const handleReact = useCallback((emoji: string) => {
    setShowPicker(false);
    if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'add_reaction', messageId: msg.id, emoji }));
    } else {
      // REST fallback
      const token = getToken();
      fetch(`/api/chat/conversation/${conversationId}/messages/${msg.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ emoji }),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversation', conversationId, 'messages'] });
      });
    }
  }, [wsConnected, wsRef, conversationId, msg.id]);

  const attachments = (msg.attachments as any[]) || [];

  return (
    <div
      className={`flex gap-2 group ${isOwn ? 'justify-end' : 'justify-start'}`}
      data-testid={`chat-message-${msg.id}`}
    >
      {/* Agent avatar */}
      {!isOwn && (
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
            S
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[72%]`}>
        {/* Bubble */}
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {/* Reaction picker on hover */}
          {showPicker && (
            <div className={isOwn ? 'right-0 absolute -top-9' : 'left-0 absolute -top-9'}>
              <ReactionPicker onPick={handleReact} />
            </div>
          )}

          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-tl-sm'
            }`}
          >
            {/* Attachments */}
            {attachments.map((att, i) => {
              const isImage = att.type?.startsWith('image/');
              return isImage ? (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block mb-1.5">
                  <img
                    src={att.url}
                    alt={att.name}
                    className="max-w-full rounded-lg max-h-48 object-cover"
                  />
                </a>
              ) : (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-lg p-2 mb-1.5 text-xs ${
                    isOwn ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{att.name}</span>
                  <span className="opacity-60 shrink-0">{formatFileSize(att.size)}</span>
                </a>
              );
            })}

            {/* Text */}
            {msg.message.trim() && msg.message.trim() !== ' ' && (
              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
            )}
          </div>

          {/* Timestamp + read receipt */}
          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-muted-foreground">{formatMessageTime(msg.createdAt)}</span>
            {isOwn && (
              <CheckCheck className={`h-3 w-3 ${msg.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
          </div>
        </div>

        {/* Reactions row */}
        {hasReactions && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-1.5 py-0.5 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-muted-foreground">{users.length}</span>
                </button>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Customer avatar */}
      {isOwn && (
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-foreground text-[10px] font-bold">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

// ── Main widget ──────────────────────────────────────────────────────────────
export function ChatWidget({ userId, userName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: conversation, isLoading: conversationLoading } = useQuery<ChatConversationWithDetails>({
    queryKey: ['/api/chat/conversation'],
    enabled: isOpen,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversation', conversation?.id, 'messages'],
    queryFn: async () => {
      if (!conversation?.id) return [];
      const token = getToken();
      const res = await fetch(`/api/chat/conversation/${conversation.id}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: isOpen && !!conversation?.id,
    refetchInterval: 8000,
  });

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping, scrollToBottom]);

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [message]);

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !conversation?.id || !userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      const token = getToken();
      ws.send(JSON.stringify({ type: 'auth', userType: 'customer', token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'auth_success':
          setWsConnected(true);
          ws.send(JSON.stringify({ type: 'join_conversation', conversationId: conversation.id }));
          break;

        case 'auth_error':
          setWsConnected(false);
          break;

        case 'new_message':
        case 'reaction_updated':
          queryClient.invalidateQueries({ queryKey: ['/api/chat/conversation', conversation.id, 'messages'] });
          break;

        case 'typing':
          if (data.userType === 'agent') {
            setIsAgentTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsAgentTyping(false), 2500);
          }
          break;

        case 'user_joined':
          if (data.userType === 'agent') {
            queryClient.invalidateQueries({ queryKey: ['/api/chat/conversation'] });
          }
          break;
      }
    };

    ws.onerror = () => setWsConnected(false);
    ws.onclose = () => setWsConnected(false);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      ws.close();
    };
  }, [isOpen, conversation?.id, userId]);

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
  }, [wsConnected]);

  // ── File picker ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large (max 10 MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPendingAttachments((prev) => [
          ...prev,
          { name: file.name, type: file.type, size: file.size, dataUrl: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
    // reset input so same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingAttachment = (idx: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = message.trim();
    if (!text && pendingAttachments.length === 0) return;
    if (!conversation?.id) return;

    setIsUploading(true);
    const token = getToken();

    try {
      // Upload attachments first
      const uploadedAttachments: { name: string; url: string; type: string; size: number }[] = [];
      for (const att of pendingAttachments) {
        const r = await fetch('/api/chat/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ data: att.dataUrl, name: att.name, type: att.type }),
        });
        if (r.ok) {
          const { url } = await r.json();
          uploadedAttachments.push({ name: att.name, url, type: att.type, size: att.size });
        }
      }

      if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          content: text || ' ',
          attachments: uploadedAttachments,
        }));
      } else {
        await fetch(`/api/chat/conversation/${conversation.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ content: text || ' ', attachments: uploadedAttachments }),
        });
      }

      setMessage('');
      setPendingAttachments([]);
      setTimeout(() => refetchMessages(), 150);
    } finally {
      setIsUploading(false);
    }
  }, [message, pendingAttachments, conversation?.id, wsConnected, refetchMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Closed FAB ─────────────────────────────────────────────────────────────
  if (!isOpen) {
    const unread = messages.filter((m: any) => m.senderType === 'agent' && !m.isRead).length;
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-xl z-50 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
        data-testid="button-chat-open"
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    );
  }

  // ── Open widget ────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px] h-[88vh] sm:h-[580px] bg-background border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
      data-testid="chat-widget-container"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-primary-foreground/30">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-bold text-sm">
                S
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-primary ${
                wsConnected ? 'bg-green-400' : 'bg-zinc-400'
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Support Chat</h3>
            <p className="text-[11px] opacity-75 leading-tight flex items-center gap-1">
              {wsConnected ? (
                <>
                  <Wifi className="h-2.5 w-2.5" /> Online · typically replies in minutes
                </>
              ) : (
                <>
                  <WifiOff className="h-2.5 w-2.5" /> Connecting…
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
          onClick={() => setIsOpen(false)}
          data-testid="button-chat-close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {conversationLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {/* Empty state */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-sm">Start a conversation</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Our support team typically responds within a few minutes.
                  </p>
                </div>
              )}

              {/* Date separator helper */}
              {messages.map((msg: any, idx) => {
                const isOwn = msg.senderType === 'customer';
                const prevMsg: any = messages[idx - 1];
                const showDateSep =
                  !prevMsg ||
                  new Date(msg.createdAt!).toDateString() !== new Date(prevMsg.createdAt!).toDateString();

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {isToday(new Date(msg.createdAt!))
                            ? 'Today'
                            : isYesterday(new Date(msg.createdAt!))
                            ? 'Yesterday'
                            : format(new Date(msg.createdAt!), 'MMM d, yyyy')}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <MessageBubble
                      msg={msg}
                      isOwn={isOwn}
                      userName={userName}
                      wsRef={wsRef}
                      wsConnected={wsConnected}
                      conversationId={conversation?.id || ''}
                    />
                  </div>
                );
              })}

              {/* Agent typing indicator */}
              {isAgentTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-7 w-7 mt-1 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                      S
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* ── Input area ────────────────────────────────────────────────── */}
          <div className="border-t bg-background shrink-0 px-3 pb-3 pt-2 space-y-2">
            {/* Pending attachments preview */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pendingAttachments.map((att, i) => {
                  const isImage = att.type.startsWith('image/');
                  return (
                    <div key={i} className="relative group">
                      {isImage ? (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="h-16 w-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center gap-1 p-1">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full px-1">
                            {att.name}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removePendingAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Textarea + buttons */}
            <div className="flex items-end gap-2">
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Attach file"
                type="button"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Textarea */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="resize-none min-h-[36px] max-h-[120px] py-2 pr-2 text-sm rounded-2xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                  disabled={isUploading}
                  data-testid="input-chat-message"
                />
              </div>

              {/* Send */}
              <Button
                onClick={handleSend}
                disabled={(!message.trim() && pendingAttachments.length === 0) || isUploading}
                size="icon"
                className="shrink-0 h-9 w-9 rounded-full"
                data-testid="button-send-message"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Shift+Enter for new line · Hover a message to react
            </p>
          </div>
        </>
      )}
    </div>
  );
}
