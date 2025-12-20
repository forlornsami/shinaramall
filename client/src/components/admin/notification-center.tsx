import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings2, 
  ShoppingBag, 
  CreditCard, 
  Package, 
  UserPlus, 
  Star, 
  Truck,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Check,
  X
} from "lucide-react";

interface NotificationType {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string;
  channels: string[] | null;
  isEnabled: boolean | null;
  isEmailEnabled: boolean | null;
  isInAppEnabled: boolean | null;
  icon: string | null;
  priority: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface NotificationTemplate {
  id: string;
  typeKey: string;
  channel: string;
  subject: string | null;
  title: string;
  body: string;
  variables: string[] | null;
  isActive: boolean | null;
  version: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const iconMap: Record<string, any> = {
  ShoppingBag,
  Truck,
  CreditCard,
  AlertCircle,
  Package,
  UserPlus,
  Star,
  MessageSquare,
  Bell,
  Mail,
};

const categoryColors: Record<string, string> = {
  orders: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  payments: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inventory: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  customers: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  communication: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  system: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function NotificationCenter() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    typeKey: "",
    channel: "email",
    subject: "",
    title: "",
    body: "",
    variables: "",
  });

  const { data: notificationTypes = [], isLoading: typesLoading, refetch: refetchTypes } = useQuery<NotificationType[]>({
    queryKey: ['/api/admin/notification-types'],
  });

  const { data: templates = [], isLoading: templatesLoading, refetch: refetchTemplates } = useQuery<NotificationTemplate[]>({
    queryKey: ['/api/admin/notification-templates'],
  });

  const toggleTypeMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      return apiRequest('PATCH', `/api/admin/notification-types/${id}/toggle`, { field, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-types'] });
      toast({ title: "Success", description: "Notification setting updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update setting", variant: "destructive" });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/notification-templates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-templates'] });
      setIsTemplateDialogOpen(false);
      resetTemplateForm();
      toast({ title: "Success", description: "Template created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create template", variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PATCH', `/api/admin/notification-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-templates'] });
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
      toast({ title: "Success", description: "Template updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update template", variant: "destructive" });
    },
  });

  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/notification-templates/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-templates'] });
      toast({ title: "Success", description: "Template status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update template", variant: "destructive" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/notification-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-templates'] });
      toast({ title: "Success", description: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    },
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      typeKey: "",
      channel: "email",
      subject: "",
      title: "",
      body: "",
      variables: "",
    });
  };

  const openEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      typeKey: template.typeKey,
      channel: template.channel,
      subject: template.subject || "",
      title: template.title,
      body: template.body,
      variables: template.variables?.join(", ") || "",
    });
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    const data = {
      ...templateForm,
      variables: templateForm.variables.split(",").map(v => v.trim()).filter(Boolean),
    };

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Bell;
    return iconMap[iconName] || Bell;
  };

  const groupedTypes = notificationTypes.reduce((acc, type) => {
    const category = type.category || 'system';
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, NotificationType[]>);

  if (typesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-notification-center-title">
            <Bell className="w-7 h-7" />
            Notification Center
          </h1>
          <p className="text-muted-foreground">Manage notification types, channels, and templates</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => { refetchTypes(); refetchTemplates(); }}
          data-testid="button-refresh-notifications"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types" data-testid="tab-notification-types">
            <Settings2 className="w-4 h-4 mr-2" />
            Notification Types
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-notification-templates">
            <Mail className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-6">
          {Object.entries(groupedTypes).map(([category, types]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Badge className={categoryColors[category]}>{category}</Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({types.length} notification{types.length !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {types.map((type) => {
                  const IconComponent = getIconComponent(type.icon);
                  return (
                    <div 
                      key={type.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      data-testid={`notification-type-${type.key}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{type.label}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">Master</Label>
                          <Switch
                            checked={type.isEnabled ?? true}
                            onCheckedChange={(value) => 
                              toggleTypeMutation.mutate({ id: type.id, field: 'isEnabled', value })
                            }
                            data-testid={`toggle-master-${type.key}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <Switch
                            checked={type.isEmailEnabled ?? true}
                            onCheckedChange={(value) => 
                              toggleTypeMutation.mutate({ id: type.id, field: 'isEmailEnabled', value })
                            }
                            disabled={!type.isEnabled}
                            data-testid={`toggle-email-${type.key}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <Switch
                            checked={type.isInAppEnabled ?? true}
                            onCheckedChange={(value) => 
                              toggleTypeMutation.mutate({ id: type.id, field: 'isInAppEnabled', value })
                            }
                            disabled={!type.isEnabled}
                            data-testid={`toggle-inapp-${type.key}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Create and manage notification templates for email and in-app messages
            </p>
            <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => {
              setIsTemplateDialogOpen(open);
              if (!open) {
                setEditingTemplate(null);
                resetTemplateForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-template">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
                  <DialogDescription>
                    Define the content for notifications. Use {"{{variable}}"} syntax for dynamic values.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Notification Type</Label>
                      <Select
                        value={templateForm.typeKey}
                        onValueChange={(value) => setTemplateForm({ ...templateForm, typeKey: value })}
                      >
                        <SelectTrigger data-testid="select-template-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {notificationTypes.map((type) => (
                            <SelectItem key={type.key} value={type.key}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Select
                        value={templateForm.channel}
                        onValueChange={(value) => setTemplateForm({ ...templateForm, channel: value })}
                      >
                        <SelectTrigger data-testid="select-template-channel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="in_app">In-App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {templateForm.channel === 'email' && (
                    <div className="space-y-2">
                      <Label>Email Subject</Label>
                      <Input
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                        placeholder="e.g., Your order #{{orderNumber}} has been placed"
                        data-testid="input-template-subject"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={templateForm.title}
                      onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                      placeholder="e.g., Order Placed Successfully"
                      data-testid="input-template-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                      placeholder="e.g., Thank you {{customerName}}! Your order #{{orderNumber}} has been placed and will be processed shortly."
                      rows={4}
                      data-testid="input-template-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variables (comma-separated)</Label>
                    <Input
                      value={templateForm.variables}
                      onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                      placeholder="e.g., customerName, orderNumber, orderTotal"
                      data-testid="input-template-variables"
                    />
                    <p className="text-xs text-muted-foreground">
                      These variables can be used in the template with {"{{variableName}}"} syntax
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTemplateDialogOpen(false)}
                    data-testid="button-cancel-template"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate}
                    disabled={!templateForm.typeKey || !templateForm.title || !templateForm.body}
                    data-testid="button-save-template"
                  >
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {templatesLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No templates yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Create your first notification template to customize how messages appear to users.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => {
                const type = notificationTypes.find(t => t.key === template.typeKey);
                return (
                  <Card key={template.id} data-testid={`template-${template.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {template.channel === 'email' ? 'Email' : 'In-App'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              v{template.version || 1}
                            </Badge>
                            {template.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <X className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          {template.subject && (
                            <p className="text-sm text-muted-foreground">
                              Subject: {template.subject}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.body}
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="outline" className="text-xs">
                              {type?.label || template.typeKey}
                            </Badge>
                            {template.variables && template.variables.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Variables: {template.variables.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.isActive ?? true}
                            onCheckedChange={(value) => 
                              toggleTemplateMutation.mutate({ id: template.id, isActive: value })
                            }
                            data-testid={`toggle-template-${template.id}`}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditTemplate(template)}
                            data-testid={`button-edit-template-${template.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                            data-testid={`button-delete-template-${template.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
