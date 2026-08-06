import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircle, X, Send, Loader2, Paperclip, Smile,
  FileText, CheckCheck, Wifi, WifiOff, Clock,
} from 'lucide-react';
import { queryClient, getToken } from '@/lib/queryClient';
import { getWsUrl } from '@/lib/api-base';
import { format, isToday, isYesterday } from 'date-fns';
import type { ChatMessage, ChatConversationWithDetails } from '@shared/schema';

// ── Emoji palette ─────────────────────────────────────────────────────────────
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// ── Guest session helpers ─────────────────────────────────────────────────────
const GUEST_ID_KEY   = 'shinara_guest_id';
const GUEST_NAME_KEY = 'shinara_guest_name';
const GUEST_TOKEN_KEY = 'shinara_guest_token';

function getOrCreateGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(GUEST_ID_KEY, id); }
  return id;
}

async function fetchGuestToken(guestId: string, guestName: string): Promise<string> {
  const res = await fetch('/api/chat/guest-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId, guestName }),
  });
  if (!res.ok) throw new Error('Failed to get guest token');
  const { token } = await res.json();
  localStorage.setItem(GUEST_TOKEN_KEY, token);
  return token;
}

function getChatToken(): string | null {
  return getToken() || localStorage.getItem(GUEST_TOKEN_KEY);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendingAttachment {
  name: string; type: string; size: number; dataUrl: string;
}

/** An attachment inside an optimistic message — tracks upload state. */
interface OptimisticAttachment {
  name: string; type: string; size: number;
  dataUrl: string;   // local preview (always available immediately)
  url?: string;      // filled in once the server returns the real URL
  uploading: boolean;
}

/** A message added to the chat immediately on send, before server confirms. */
interface OptimisticMsg {
  tempId: string;
  text: string;
  createdAt: Date;
  attachments: OptimisticAttachment[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Reaction picker ───────────────────────────────────────────────────────────
function ReactionPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="absolute -top-9 left-0 flex items-center gap-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-1 shadow-lg z-20 animate-in fade-in slide-in-from-bottom-1 duration-150">
      {REACTIONS.map((emoji) => (
        <button key={emoji} onClick={(e) => { e.stopPropagation(); onPick(emoji); }}
          className="text-base hover:scale-125 transition-transform leading-none px-0.5" title={emoji}>
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ── Server message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg, isOwn, userName, wsRef, wsConnected, conversationId }: {
  msg: ChatMessage & { reactions?: Record<string, string[]>; attachments?: { name: string; url: string; type: string; size: number }[] };
  isOwn: boolean; userName: string;
  wsRef: React.RefObject<WebSocket | null>;
  wsConnected: boolean; conversationId: string;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji: string) => {
    setShowPicker(false);
    if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'add_reaction', messageId: msg.id, emoji }));
    } else {
      const token = getChatToken();
      fetch(`/api/chat/conversation/${conversationId}/messages/${msg.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ emoji }),
      }).then(() => queryClient.invalidateQueries({ queryKey: ['/api/chat/conversation', conversationId, 'messages'] }));
    }
  };

  const reactions = (msg.reactions as Record<string, string[]> | null) || {};
  const attachments = msg.attachments || [];

  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <Avatar className="h-7 w-7 mt-1 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">S</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {attachments.map((att, i) => {
              const isImage = att.type?.startsWith('image/');
              return isImage ? (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                  <img src={att.url} alt={att.name}
                    className="h-32 w-32 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity" />
                </a>
              ) : (
                <a key={i} href={att.url} download={att.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  {att.size && <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(att.size)}</span>}
                </a>
              );
            })}
          </div>
        )}

        {/* Text bubble */}
        {msg.message && msg.message.trim() && (
          <div
            className={`group relative px-3.5 py-2 rounded-2xl text-sm shadow-sm max-w-full ${
              isOwn ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-tl-sm'
            }`}
            onClick={() => setShowPicker((v) => !v)}
          >
            <span className="whitespace-pre-wrap break-words">{msg.message}</span>
            <button onClick={(e) => { e.stopPropagation(); setShowPicker((v) => !v); }}
              className="absolute -bottom-2 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-[13px] leading-none" title="React">
              <Smile className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
            {showPicker && <ReactionPicker onPick={handleReact} />}
          </div>
        )}

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {Object.entries(reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <button key={emoji} onClick={() => handleReact(emoji)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                  {emoji} {users.length > 1 ? users.length : ''}
                </button>
              ) : null
            )}
          </div>
        )}

        <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1">
          {formatMessageTime(msg.createdAt)}
          {isOwn && msg.isRead && <CheckCheck className="h-3 w-3 text-primary" />}
        </span>
      </div>

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

// ── Optimistic message bubble (instant, before server confirms) ───────────────
function OptimisticBubble({ opt, userName }: { opt: OptimisticMsg; userName: string }) {
  const stillUploading = opt.attachments.some((a) => a.uploading);

  return (
    <div className="flex gap-2 justify-end">
      <div className="max-w-[75%] flex flex-col gap-1 items-end opacity-80">
        {/* Attachments with per-file upload state */}
        {opt.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {opt.attachments.map((att, i) => {
              const isImage = att.type?.startsWith('image/');
              return (
                <div key={i} className="relative">
                  {isImage ? (
                    <>
                      {/* Always show the local preview */}
                      <img src={att.dataUrl} alt={att.name}
                        className="h-32 w-32 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700" />
                      {/* Spinner overlay while uploading */}
                      {att.uploading && (
                        <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm">
                      {att.uploading ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate max-w-[120px]">{att.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(att.size)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Text bubble */}
        {opt.text && opt.text.trim() && (
          <div className="relative px-3.5 py-2 rounded-2xl rounded-tr-sm text-sm shadow-sm bg-primary text-primary-foreground max-w-full">
            <span className="whitespace-pre-wrap break-words">{opt.text}</span>
          </div>
        )}

        {/* Sending indicator */}
        <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1">
          {formatMessageTime(opt.createdAt)}
          {stillUploading
            ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            : <Clock className="h-3 w-3 text-muted-foreground" />}
        </span>
      </div>

      <Avatar className="h-7 w-7 mt-1 shrink-0">
        <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-foreground text-[10px] font-bold">
          {userName?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

// ── Guest name prompt ─────────────────────────────────────────────────────────
function GuestNamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h4 className="font-semibold text-sm mb-1">Start a conversation</h4>
        <p className="text-xs text-muted-foreground">
          What's your name? We'll use it so our team can greet you properly.
        </p>
      </div>
      <div className="w-full space-y-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()); }} />
        <Button className="w-full" disabled={!name.trim()} onClick={() => onSubmit(name.trim())}>
          Start chatting
        </Button>
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export function ChatWidget() {
  const { itemCount } = useCart();
  // On desktop (lg+), shift left of the cart sidebar (w-72 = 18rem, gap = 1.5rem → 19.5rem)
  const cartOpen = itemCount > 0;
  const [isOpen, setIsOpen] = useState(false);

  // External open trigger (mobile header button)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('shinara:openChat', handler);
    return () => window.removeEventListener('shinara:openChat', handler);
  }, []);

  const [message, setMessage] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  // ── Optimistic messages ────────────────────────────────────────────────────
  const [optimisticMsgs, setOptimisticMsgs] = useState<OptimisticMsg[]>([]);

  // ── Guest state ────────────────────────────────────────────────────────────
  const [guestName, setGuestName] = useState<string | null>(() => localStorage.getItem(GUEST_NAME_KEY));
  const [guestToken, setGuestToken] = useState<string | null>(() => localStorage.getItem(GUEST_TOKEN_KEY));
  const [guestTokenLoading, setGuestTokenLoading] = useState(false);

  const isLoggedIn = Boolean(getToken());
  const needsGuestSetup = !isLoggedIn && (!guestName || !guestToken);
  const chatToken = isLoggedIn ? getToken() : guestToken;

  const handleGuestNameSubmit = useCallback(async (name: string) => {
    setGuestTokenLoading(true);
    try {
      const guestId = getOrCreateGuestId();
      localStorage.setItem(GUEST_NAME_KEY, name);
      const token = await fetchGuestToken(guestId, name);
      setGuestName(name);
      setGuestToken(token);
    } catch (e) {
      console.error('Failed to init guest session', e);
    } finally {
      setGuestTokenLoading(false);
    }
  }, []);

  const displayName = isLoggedIn
    ? (localStorage.getItem('shinara_display_name') || 'You')
    : (guestName || 'Guest');

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const chatEnabled = isOpen && !needsGuestSetup && !!chatToken;

  const { data: conversation, isLoading: conversationLoading } = useQuery<ChatConversationWithDetails>({
    queryKey: ['/api/chat/conversation', isLoggedIn ? 'user' : guestToken],
    queryFn: async () => {
      const res = await fetch('/api/chat/conversation', {
        headers: chatToken ? { Authorization: `Bearer ${chatToken}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load conversation');
      return res.json();
    },
    enabled: chatEnabled,
  });

  const { data: serverMessages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/conversation', conversation?.id, 'messages'],
    queryFn: async () => {
      if (!conversation?.id) return [];
      const res = await fetch(`/api/chat/conversation/${conversation.id}/messages`, {
        headers: chatToken ? { Authorization: `Bearer ${chatToken}` } : {},
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: chatEnabled && !!conversation?.id,
    refetchInterval: 8000,
  });

  // When real messages arrive, drop confirmed optimistic messages.
  // An optimistic message is confirmed once its text appears in the server list
  // as a recent customer message (within 30 s) and it has no still-uploading attachments.
  useEffect(() => {
    if (optimisticMsgs.length === 0 || serverMessages.length === 0) return;
    setOptimisticMsgs((prev) =>
      prev.filter((opt) => {
        // Keep while any attachment is still uploading
        if (opt.attachments.some((a) => a.uploading)) return true;
        // Drop once we find a matching server message
        return !serverMessages.some(
          (m) =>
            m.senderType === 'customer' &&
            m.message?.trim() === opt.text.trim() &&
            Math.abs(new Date(m.createdAt!).getTime() - opt.createdAt.getTime()) < 30_000
        );
      })
    );
  }, [serverMessages]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [serverMessages, optimisticMsgs, isAgentTyping, scrollToBottom]);

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [message]);

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatEnabled || !conversation?.id) return;

    const ws = new WebSocket(getWsUrl('/ws/chat'));
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userType: 'customer', token: chatToken }));
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
            queryClient.invalidateQueries({ queryKey: ['/api/chat/conversation', isLoggedIn ? 'user' : guestToken] });
          }
          break;
      }
    };

    ws.onerror = () => setWsConnected(false);
    ws.onclose  = () => setWsConnected(false);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      ws.close();
    };
  }, [chatEnabled, conversation?.id, chatToken]);

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
  }, [wsConnected]);

  // ── File picker ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { alert(`${file.name} is too large (max 10 MB)`); return; }
      const reader = new FileReader();
      reader.onload = () => setPendingAttachments((prev) => [
        ...prev,
        { name: file.name, type: file.type, size: file.size, dataUrl: reader.result as string },
      ]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingAttachment = (idx: number) =>
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));

  // ── Send message (optimistic) ──────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = message.trim();
    if (!text && pendingAttachments.length === 0) return;
    if (!conversation?.id) return;

    const tempId = `opt-${Date.now()}`;

    // Build optimistic message — all attachments start as uploading
    const optimistic: OptimisticMsg = {
      tempId,
      text: text || ' ',
      createdAt: new Date(),
      attachments: pendingAttachments.map((a) => ({
        name: a.name, type: a.type, size: a.size,
        dataUrl: a.dataUrl,
        uploading: true,
      })),
    };

    // Show it instantly and clear the input
    setOptimisticMsgs((prev) => [...prev, optimistic]);
    setMessage('');
    setPendingAttachments([]);

    try {
      // Upload each attachment, marking it done as the server responds
      const uploadedAttachments: { name: string; url: string; type: string; size: number }[] = [];

      for (let i = 0; i < optimistic.attachments.length; i++) {
        const att = optimistic.attachments[i];
        try {
          const r = await fetch('/api/chat/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(chatToken ? { Authorization: `Bearer ${chatToken}` } : {}),
            },
            body: JSON.stringify({ data: att.dataUrl, name: att.name, type: att.type }),
          });
          if (r.ok) {
            const { url } = await r.json();
            uploadedAttachments.push({ name: att.name, url, type: att.type, size: att.size });
            // Mark this specific attachment as done — spinner disappears on that file
            setOptimisticMsgs((prev) => prev.map((o) =>
              o.tempId !== tempId ? o : {
                ...o,
                attachments: o.attachments.map((a, j) =>
                  j === i ? { ...a, uploading: false, url } : a
                ),
              }
            ));
          }
        } catch {
          // Mark attachment upload as failed (no longer uploading)
          setOptimisticMsgs((prev) => prev.map((o) =>
            o.tempId !== tempId ? o : {
              ...o,
              attachments: o.attachments.map((a, j) =>
                j === i ? { ...a, uploading: false } : a
              ),
            }
          ));
        }
      }

      // Send via WebSocket or REST
      if (wsConnected && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          content: text || ' ',
          attachments: uploadedAttachments,
        }));
        // WS broadcasts new_message back → cache invalidates → useEffect drops the optimistic entry
      } else {
        await fetch(`/api/chat/conversation/${conversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(chatToken ? { Authorization: `Bearer ${chatToken}` } : {}),
          },
          body: JSON.stringify({ content: text || ' ', attachments: uploadedAttachments }),
        });
        setTimeout(() => refetchMessages(), 150);
      }
    } catch {
      // Network failure — remove optimistic message so user knows it wasn't sent
      setOptimisticMsgs((prev) => prev.filter((o) => o.tempId !== tempId));
    }
  }, [message, pendingAttachments, conversation?.id, wsConnected, refetchMessages, chatToken]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Closed FAB ─────────────────────────────────────────────────────────────
  if (!isOpen) {
    const unread = serverMessages.filter((m: any) => m.senderType === 'agent' && !m.isRead).length;
    return (
      <button onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-5 sm:bottom-6 h-14 w-14 rounded-full shadow-xl z-50 bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all ${cartOpen ? "sm:right-6 lg:right-[19.5rem]" : "sm:right-6"}`}
        data-testid="button-chat-open" aria-label="Open support chat">
        <MessageCircle className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    );
  }

  // ── Open widget ─────────────────────────────────────────────────────────────
  return (
    <div className={`fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:w-[380px] h-[88vh] sm:h-[580px] bg-background border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden ${cartOpen ? "sm:right-6 lg:right-[19.5rem]" : "sm:right-6"}`}
      data-testid="chat-widget-container">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-primary-foreground/30">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-bold text-sm">S</AvatarFallback>
            </Avatar>
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-primary ${wsConnected ? 'bg-green-400' : 'bg-zinc-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Support Chat</h3>
            <p className="text-[11px] opacity-75 leading-tight flex items-center gap-1">
              {wsConnected
                ? <><Wifi className="h-2.5 w-2.5" /> Online · typically replies in minutes</>
                : <><WifiOff className="h-2.5 w-2.5" /> Connecting…</>}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
          onClick={() => setIsOpen(false)} data-testid="button-chat-close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Guest name prompt */}
      {needsGuestSetup ? (
        guestTokenLoading
          ? <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          : <GuestNamePrompt onSubmit={handleGuestNameSubmit} />
      ) : conversationLoading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Message list */}
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {/* Empty state */}
              {serverMessages.length === 0 && optimisticMsgs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-sm">Start a conversation</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Our support team typically responds within a few minutes.
                  </p>
                  {!isLoggedIn && guestName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Chatting as <span className="font-medium text-foreground">{guestName}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Server messages */}
              {serverMessages.map((msg: any, idx) => {
                const isOwn = msg.senderType === 'customer';
                const prevMsg: any = serverMessages[idx - 1];
                const showDateSep = !prevMsg ||
                  new Date(msg.createdAt!).toDateString() !== new Date(prevMsg.createdAt!).toDateString();
                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {isToday(new Date(msg.createdAt!)) ? 'Today'
                            : isYesterday(new Date(msg.createdAt!)) ? 'Yesterday'
                            : format(new Date(msg.createdAt!), 'MMM d, yyyy')}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <MessageBubble msg={msg} isOwn={isOwn} userName={displayName}
                      wsRef={wsRef} wsConnected={wsConnected} conversationId={conversation?.id || ''} />
                  </div>
                );
              })}

              {/* Optimistic messages (shown immediately while server processes) */}
              {optimisticMsgs.map((opt) => (
                <OptimisticBubble key={opt.tempId} opt={opt} userName={displayName} />
              ))}

              {/* Agent typing indicator */}
              {isAgentTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="h-7 w-7 mt-1 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">S</AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 150, 300].map((delay) => (
                        <span key={delay} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t bg-background shrink-0 px-3 pb-3 pt-2 space-y-2">
            {/* Pending attachment preview (before sending) */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pendingAttachments.map((att, i) => {
                  const isImage = att.type.startsWith('image/');
                  return (
                    <div key={i} className="relative group">
                      {isImage ? (
                        <img src={att.dataUrl} alt={att.name}
                          className="h-16 w-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" />
                      ) : (
                        <div className="h-16 w-16 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center gap-1 p-1">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground text-center leading-tight truncate w-full px-1">{att.name}</span>
                        </div>
                      )}
                      <button onClick={() => removePendingAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Textarea + buttons */}
            <div className="flex items-end gap-2">
              <input ref={fileInputRef} type="file" multiple
                accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Attach file" type="button">
                <Paperclip className="h-4 w-4" />
              </button>

              <div className="flex-1 relative">
                <Textarea ref={textareaRef} value={message}
                  onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="resize-none min-h-[36px] max-h-[120px] py-2 pr-2 text-sm rounded-2xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-primary"
                  data-testid="input-chat-message" />
              </div>

              <Button onClick={handleSend}
                disabled={!message.trim() && pendingAttachments.length === 0}
                size="icon" className="shrink-0 h-9 w-9 rounded-full"
                data-testid="button-send-message">
                <Send className="h-4 w-4" />
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
