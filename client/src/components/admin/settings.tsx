import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Store, 
  Bell, 
  Shield, 
  Mail, 
  Globe, 
  Palette,
  Save,
  RefreshCw
} from "lucide-react";

export default function SettingsSection() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Eshaal Store",
    storeEmail: "contact@eshaalstore.pk",
    storePhone: "+92 300 1234567",
    storeAddress: "Lahore, Pakistan",
    currency: "PKR",
  });

  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    stockAlerts: true,
    customerRegistrations: true,
    paymentUpdates: true,
    marketingEmails: false,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

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
          disabled={isLoading}
          data-testid="button-save-settings"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
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
                Basic information about your store
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
                <Button variant="outline" data-testid="button-change-password">
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
                <Button variant="outline" data-testid="button-manage-sessions">
                  Manage Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
