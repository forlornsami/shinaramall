import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Users, 
  Plus,
  MoreVertical,
  UserPlus,
  Settings,
  LogOut,
  Trash2,
  Search
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { format, isToday, isYesterday } from 'date-fns';
import type { TeamChatConversationWithDetails, TeamChatMessageWithSender, AdminUser } from '@shared/schema';

interface TeamChatProps {
  adminToken: string;
  adminId: string;
}

export default function TeamChat({ adminToken, adminId }: TeamChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [showGroupSettingsDialog, setShowGroupSettingsDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery<TeamChatConversationWithDetails[]>({
    queryKey: ['/api/admin/team-chat/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/team-chat/conversations', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/team-chat/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/team-chat/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: currentConversation, refetch: refetchCurrentConversation } = useQuery<TeamChatConversationWithDetails>({
    queryKey: ['/api/admin/team-chat/conversations', selectedConversation],
    queryFn: async () => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch conversation');
      return response.json();
    },
    enabled: !!selectedConversation,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<TeamChatMessageWithSender[]>({
    queryKey: ['/api/admin/team-chat/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}/messages`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ message: content }),
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

  const createDirectChatMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const response = await fetch('/api/admin/team-chat/conversations/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (data) => {
      refetchConversations();
      setSelectedConversation(data.id);
      setShowNewChatDialog(false);
    },
  });

  const createGroupChatMutation = useMutation({
    mutationFn: async ({ title, description, memberIds }: { title: string; description: string; memberIds: string[] }) => {
      const response = await fetch('/api/admin/team-chat/conversations/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title, description, memberIds }),
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },
    onSuccess: (data) => {
      refetchConversations();
      setSelectedConversation(data.id);
      setShowNewGroupDialog(false);
      setNewGroupTitle('');
      setNewGroupDescription('');
      setSelectedMembers([]);
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) throw new Error('Failed to update group');
      return response.json();
    },
    onSuccess: () => {
      refetchConversations();
      refetchCurrentConversation();
      setShowGroupSettingsDialog(false);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to add member');
      return response.json();
    },
    onSuccess: () => {
      refetchCurrentConversation();
      setShowAddMemberDialog(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to remove member');
      return response.json();
    },
    onSuccess: () => {
      refetchCurrentConversation();
    },
  });

  const leaveConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/team-chat/conversations/${selectedConversation}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to leave conversation');
      return response.json();
    },
    onSuccess: () => {
      refetchConversations();
      setSelectedConversation(null);
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== adminId) {
        fetch(`/api/admin/team-chat/conversations/${selectedConversation}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ lastMessageId: lastMessage.id }),
        });
      }
    }
  }, [messages, adminId, adminToken, selectedConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedConversation) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const getConversationName = (conv: TeamChatConversationWithDetails) => {
    if (conv.type === 'group') {
      return conv.title || 'Unnamed Group';
    }
    const otherParticipant = conv.participants.find(p => p.adminUserId !== adminId);
    return otherParticipant?.adminUser?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: TeamChatConversationWithDetails) => {
    if (conv.type === 'group') {
      return null;
    }
    const otherParticipant = conv.participants.find(p => p.adminUserId !== adminId);
    return otherParticipant?.adminUser?.profilePicture || null;
  };

  const formatMessageTime = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, 'HH:mm');
    } else if (isYesterday(d)) {
      return 'Yesterday';
    }
    return format(d, 'MMM d');
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const availableUsersForGroup = adminUsers.filter(u => !selectedMembers.includes(u.id));
  const currentParticipantIds = currentConversation?.participants.map(p => p.adminUserId) || [];
  const availableUsersToAdd = adminUsers.filter(u => !currentParticipantIds.includes(u.id));

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] gap-4">
      <Card className="w-80 flex-shrink-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Team Chat</CardTitle>
            <div className="flex gap-1">
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="btn-new-direct-chat">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Direct Message</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select a team member to start a conversation</p>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {adminUsers.map(user => (
                          <Button
                            key={user.id}
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => createDirectChatMutation.mutate(user.id)}
                            disabled={createDirectChatMutation.isPending}
                            data-testid={`btn-select-user-${user.id}`}
                          >
                            <Avatar className="h-8 w-8">
                              {user.profilePicture && <AvatarImage src={user.profilePicture} />}
                              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <div className="font-medium">{user.username}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </Button>
                        ))}
                        {adminUsers.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No other team members found</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="btn-new-group-chat">
                    <Users className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-title">Group Name</Label>
                      <Input
                        id="group-title"
                        value={newGroupTitle}
                        onChange={(e) => setNewGroupTitle(e.target.value)}
                        placeholder="e.g., Customer Support Team"
                        data-testid="input-group-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group-description">Description (optional)</Label>
                      <Textarea
                        id="group-description"
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                        placeholder="What's this group for?"
                        data-testid="input-group-description"
                      />
                    </div>
                    <div>
                      <Label>Add Members</Label>
                      <ScrollArea className="h-[200px] border rounded-md p-2 mt-2">
                        <div className="space-y-2">
                          {adminUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-3">
                              <Checkbox
                                id={`member-${user.id}`}
                                checked={selectedMembers.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMembers([...selectedMembers, user.id]);
                                  } else {
                                    setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                                  }
                                }}
                                data-testid={`checkbox-member-${user.id}`}
                              />
                              <label htmlFor={`member-${user.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Avatar className="h-6 w-6">
                                  {user.profilePicture && <AvatarImage src={user.profilePicture} />}
                                  <AvatarFallback className="text-xs">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.username}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <p className="text-xs text-muted-foreground mt-1">{selectedMembers.length} members selected</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createGroupChatMutation.mutate({
                        title: newGroupTitle,
                        description: newGroupDescription,
                        memberIds: selectedMembers,
                      })}
                      disabled={!newGroupTitle.trim() || selectedMembers.length === 0 || createGroupChatMutation.isPending}
                      data-testid="btn-create-group"
                    >
                      {createGroupChatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Group'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              data-testid="input-search-conversations"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-120px)]">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start a new chat with a team member</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-muted' : ''
                    }`}
                    data-testid={`btn-conversation-${conv.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        {conv.type === 'direct' ? (
                          <>
                            {getConversationAvatar(conv) && <AvatarImage src={getConversationAvatar(conv)!} />}
                            <AvatarFallback>{getConversationName(conv).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{getConversationName(conv)}</span>
                          <span className="text-xs text-muted-foreground">{formatMessageTime(conv.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage?.message || 'No messages yet'}
                          </span>
                          {(conv.unreadCount || 0) > 0 && (
                            <Badge variant="default" className="ml-2 h-5 min-w-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.type === 'group' && (
                          <span className="text-xs text-muted-foreground">{conv.participants.length} members</span>
                        )}
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
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {currentConversation.type === 'direct' ? (
                      <>
                        {getConversationAvatar(currentConversation) && <AvatarImage src={getConversationAvatar(currentConversation)!} />}
                        <AvatarFallback>{getConversationName(currentConversation).substring(0, 2).toUpperCase()}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getConversationName(currentConversation)}</h3>
                    {currentConversation.type === 'group' && (
                      <p className="text-xs text-muted-foreground">
                        {currentConversation.participants.map(p => p.adminUser?.username).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="btn-conversation-menu">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {currentConversation.type === 'group' && (
                      <>
                        <Dialog open={showGroupSettingsDialog} onOpenChange={setShowGroupSettingsDialog}>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Settings className="h-4 w-4 mr-2" />
                              Group Settings
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Group Settings</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-group-title">Group Name</Label>
                                <Input
                                  id="edit-group-title"
                                  defaultValue={currentConversation.title || ''}
                                  onChange={(e) => setNewGroupTitle(e.target.value)}
                                  data-testid="input-edit-group-title"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-group-description">Description</Label>
                                <Textarea
                                  id="edit-group-description"
                                  defaultValue={currentConversation.description || ''}
                                  onChange={(e) => setNewGroupDescription(e.target.value)}
                                  data-testid="input-edit-group-description"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => updateGroupMutation.mutate({ 
                                  title: newGroupTitle || currentConversation.title || '', 
                                  description: newGroupDescription || currentConversation.description || '' 
                                })}
                                disabled={updateGroupMutation.isPending}
                                data-testid="btn-save-group-settings"
                              >
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add Member
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Member</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-2">
                                {availableUsersToAdd.map(user => (
                                  <Button
                                    key={user.id}
                                    variant="ghost"
                                    className="w-full justify-start gap-3"
                                    onClick={() => addMemberMutation.mutate(user.id)}
                                    disabled={addMemberMutation.isPending}
                                    data-testid={`btn-add-member-${user.id}`}
                                  >
                                    <Avatar className="h-8 w-8">
                                      {user.profilePicture && <AvatarImage src={user.profilePicture} />}
                                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.username}</span>
                                  </Button>
                                ))}
                                {availableUsersToAdd.length === 0 && (
                                  <p className="text-center text-muted-foreground py-4">All team members are already in this group</p>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => leaveConversationMutation.mutate()}
                      data-testid="btn-leave-conversation"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {currentConversation.type === 'group' ? 'Leave Group' : 'Delete Chat'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isMe = msg.senderId === adminId;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
                    
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && showAvatar && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              {msg.sender?.profilePicture && <AvatarImage src={msg.sender.profilePicture} />}
                              <AvatarFallback className="text-xs">
                                {msg.sender?.username?.substring(0, 2).toUpperCase() || '??'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isMe && !showAvatar && <div className="w-8" />}
                          <div>
                            {!isMe && showAvatar && (
                              <p className="text-xs text-muted-foreground mb-1">{msg.sender?.username}</p>
                            )}
                            <div className={`rounded-lg px-3 py-2 ${
                              isMe 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : ''}`}>
                              {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                              {msg.isEdited && ' (edited)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  data-testid="btn-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a conversation from the list or start a new one
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowNewChatDialog(true)} data-testid="btn-start-direct-chat">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
                <Button variant="outline" onClick={() => setShowNewGroupDialog(true)} data-testid="btn-start-group-chat">
                  <Users className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
