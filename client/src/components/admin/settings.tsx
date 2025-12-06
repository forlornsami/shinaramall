import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  Store, 
  Bell, 
  Shield, 
  Mail, 
  Globe, 
  Palette,
  Save,
  RefreshCw,
  Loader2,
  Key,
  Monitor,
  Smartphone,
  LogOut,
  Clock,
  MapPin,
  Eye,
  EyeOff
} from "lucide-react";
import type { StoreSettings } from "@shared/schema";

export default function SettingsSection() {
  const { toast } = useToast();
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "PKR",
  });

  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    stockAlerts: true,
    customerRegistrations: true,
    paymentUpdates: true,
    marketingEmails: false,
  });

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [manageSessionsOpen, setManageSessionsOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  useEffect(() => {
    if (settings) {
      setStoreSettings({
        storeName: settings.storeName || "",
        storeEmail: settings.storeEmail || "",
        storePhone: settings.storePhone || "",
        storeAddress: settings.storeAddress || "",
        currency: settings.currency || "PKR",
      });
      setNotifications({
        orderNotifications: settings.orderNotifications ?? true,
        stockAlerts: settings.stockAlerts ?? true,
        customerRegistrations: settings.customerRegistrations ?? true,
        paymentUpdates: settings.paymentUpdates ?? true,
        marketingEmails: settings.marketingEmails ?? false,
      });
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/store-settings'] });
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async () => {
    saveSettingsMutation.mutate({
      ...storeSettings,
      ...notifications,
    });
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setChangePasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const getCurrentSession = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      try {
        return JSON.parse(adminUser);
      } catch {
        return null;
      }
    }
    return null;
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="section-settings">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h2>
          <p className="text-muted-foreground">Manage your store preferences and configurations</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={saveSettingsMutation.isPending}
          data-testid="button-save-settings"
        >
          {saveSettingsMutation.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList data-testid="tabs-settings">
          <TabsTrigger value="store" data-testid="tab-store">
            <Store className="w-4 h-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your store (displayed on the website)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    data-testid="input-store-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                    data-testid="input-store-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                    data-testid="input-store-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    disabled
                    data-testid="input-currency"
                  />
                  <p className="text-xs text-muted-foreground">Pakistani Rupee (PKR) is the default currency</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  data-testid="input-store-address"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Time Zone</p>
                  <p className="text-sm text-muted-foreground">Pakistan Standard Time (PKT)</p>
                </div>
                <Badge>UTC+5</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">English (Default)</p>
                </div>
                <Badge variant="outline">English</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Order Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                </div>
                <Switch
                  checked={notifications.orderNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, orderNotifications: checked })}
                  data-testid="switch-order-notifications"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Get alerted when products are low in stock</p>
                </div>
                <Switch
                  checked={notifications.stockAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, stockAlerts: checked })}
                  data-testid="switch-stock-alerts"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Customer Registrations</p>
                  <p className="text-sm text-muted-foreground">Get notified when new customers register</p>
                </div>
                <Switch
                  checked={notifications.customerRegistrations}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, customerRegistrations: checked })}
                  data-testid="switch-customer-registrations"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Payment Updates</p>
                  <p className="text-sm text-muted-foreground">Receive updates about payment transactions</p>
                </div>
                <Switch
                  checked={notifications.paymentUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, paymentUpdates: checked })}
                  data-testid="switch-payment-updates"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive tips and updates about the platform</p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                  data-testid="switch-marketing-emails"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your admin password</p>
                </div>
                <Button 
                  variant="outline" 
                  data-testid="button-change-password"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">View and manage active sessions</p>
                </div>
                <Button 
                  variant="outline" 
                  data-testid="button-manage-sessions"
                  onClick={() => setManageSessionsOpen(true)}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Manage Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  data-testid="input-current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  data-testid="input-confirm-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              data-testid="button-submit-password"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Sessions Dialog */}
      <Dialog open={manageSessionsOpen} onOpenChange={setManageSessionsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Active Sessions
            </DialogTitle>
            <DialogDescription>
              View and manage your active login sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(() => {
              const session = getCurrentSession();
              return (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Current Session</p>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {session?.username || 'Admin User'} • {session?.role || 'Admin'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Current session
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            This device
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            <p className="text-sm text-muted-foreground text-center py-2">
              Only your current session is shown. To log out from all devices, use the logout button.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageSessionsOpen(false)}>
              Close
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = '/admin/login';
              }}
              data-testid="button-logout-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
