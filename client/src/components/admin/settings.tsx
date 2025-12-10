import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  EyeOff,
  Upload,
  ImagePlus,
  X,
  User,
  Camera,
  Trash2
} from "lucide-react";
import type { StoreSettings } from "@shared/schema";

interface AdminProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string | null;
}

export default function SettingsSection() {
  const { toast } = useToast();
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeLogo: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "PKR",
    defaultProductImage: "",
    defaultCategoryImage: "",
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
  const [showDeletePictureDialog, setShowDeletePictureDialog] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  useEffect(() => {
    if (settings) {
      setStoreSettings({
        storeName: settings.storeName || "",
        storeLogo: settings.storeLogo || "",
        storeEmail: settings.storeEmail || "",
        storePhone: settings.storePhone || "",
        storeAddress: settings.storeAddress || "",
        currency: settings.currency || "PKR",
        defaultProductImage: settings.defaultProductImage || "",
        defaultCategoryImage: settings.defaultCategoryImage || "",
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

  const { data: adminProfile, isLoading: profileLoading } = useQuery<AdminProfile>({
    queryKey: ['/api/admin/profile'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No token');
      const response = await fetch('/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  // Track if initial profile sync has been done
  const profileSyncDone = useRef(false);
  
  useEffect(() => {
    // Only sync on initial load, not after every save
    if (adminProfile && !profileSyncDone.current) {
      setProfileForm({
        username: adminProfile.username || "",
        email: adminProfile.email || "",
      });
      profileSyncDone.current = true;
    }
  }, [adminProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    if (!profileForm.username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    if (!profileForm.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(profileForm);
  };

  const handleCancelEditProfile = () => {
    setProfileForm({
      username: adminProfile?.username || "",
      email: adminProfile?.email || "",
    });
    setIsEditingProfile(false);
  };

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/profile/picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageData }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload picture');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
      toast({
        title: "Picture Updated",
        description: "Your profile picture has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload picture",
        variant: "destructive",
      });
    },
  });

  const deleteProfilePictureMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/profile/picture', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete picture');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
      setShowDeletePictureDialog(false);
      toast({
        title: "Picture Removed",
        description: "Your profile picture has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove picture",
        variant: "destructive",
      });
    },
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      uploadProfilePictureMutation.mutate(base64);
    };
    reader.readAsDataURL(file);

    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = '';
    }
  };

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
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Profile
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
              {/* Store Logo Upload */}
              <div className="space-y-3">
                <Label>Store Logo</Label>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {storeSettings.storeLogo ? (
                      <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border overflow-hidden group">
                        <img 
                          src={storeSettings.storeLogo} 
                          alt="Store Logo" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setStoreSettings({ ...storeSettings, storeLogo: "" })}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="button-remove-logo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label 
                        htmlFor="logo-upload" 
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </label>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Logo must be less than 2MB",
                              variant: "destructive",
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setStoreSettings({ ...storeSettings, storeLogo: result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      data-testid="input-logo-upload"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your store logo. Recommended size: 200x200 pixels.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PNG, JPG, GIF. Max size: 2MB.
                    </p>
                    {!storeSettings.storeLogo && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        data-testid="button-upload-logo"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Default Product Image Upload */}
              <div className="space-y-3">
                <Label>Default Product Image</Label>
                <p className="text-xs text-muted-foreground -mt-2">
                  Shown when products don't have their own images
                </p>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {storeSettings.defaultProductImage ? (
                      <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border overflow-hidden group">
                        <img 
                          src={storeSettings.defaultProductImage} 
                          alt="Default Product" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setStoreSettings({ ...storeSettings, defaultProductImage: "" })}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="button-remove-default-product-image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label 
                        htmlFor="default-product-upload" 
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </label>
                    )}
                    <input
                      id="default-product-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Image must be less than 2MB",
                              variant: "destructive",
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setStoreSettings({ ...storeSettings, defaultProductImage: result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      data-testid="input-default-product-upload"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      This image will be displayed for products without images.
                    </p>
                    {!storeSettings.defaultProductImage && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => document.getElementById('default-product-upload')?.click()}
                        data-testid="button-upload-default-product"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Default Category Image Upload */}
              <div className="space-y-3">
                <Label>Default Category Image</Label>
                <p className="text-xs text-muted-foreground -mt-2">
                  Shown when categories don't have their own images
                </p>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {storeSettings.defaultCategoryImage ? (
                      <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border overflow-hidden group">
                        <img 
                          src={storeSettings.defaultCategoryImage} 
                          alt="Default Category" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setStoreSettings({ ...storeSettings, defaultCategoryImage: "" })}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="button-remove-default-category-image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label 
                        htmlFor="default-category-upload" 
                        className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </label>
                    )}
                    <input
                      id="default-category-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Image must be less than 2MB",
                              variant: "destructive",
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setStoreSettings({ ...storeSettings, defaultCategoryImage: result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      data-testid="input-default-category-upload"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      This image will be displayed for categories without images.
                    </p>
                    {!storeSettings.defaultCategoryImage && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => document.getElementById('default-category-upload')?.click()}
                        data-testid="button-upload-default-category"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    )}
                  </div>
                </div>
              </div>

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

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Update your profile picture. This will be displayed in the sidebar and throughout the admin panel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  {adminProfile?.profilePicture ? (
                    <img
                      src={adminProfile.profilePicture}
                      alt={adminProfile.username || "Profile"}
                      className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-lg"
                      data-testid="img-admin-profile-picture"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-background shadow-lg">
                      <span className="text-white font-bold text-4xl">
                        {(adminProfile?.username?.charAt(0) || 'A').toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {uploadProfilePictureMutation.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 text-center sm:text-left">
                  <div>
                    <h3 className="text-lg font-semibold">{adminProfile?.username || 'Admin'}</h3>
                    <p className="text-sm text-muted-foreground">{adminProfile?.email}</p>
                    <Badge variant="secondary" className="mt-2 capitalize">{adminProfile?.role || 'Admin'}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <input
                      ref={profilePictureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                      data-testid="input-admin-profile-picture"
                    />
                    <Button
                      variant="outline"
                      onClick={() => profilePictureInputRef.current?.click()}
                      disabled={uploadProfilePictureMutation.isPending}
                      data-testid="button-upload-admin-picture"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {adminProfile?.profilePicture ? 'Change Picture' : 'Upload Picture'}
                    </Button>
                    {adminProfile?.profilePicture && (
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDeletePictureDialog(true)}
                        disabled={deleteProfilePictureMutation.isPending}
                        data-testid="button-delete-admin-picture"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 200x200 pixels. Max size: 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </div>
              {!isEditingProfile ? (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditingProfile(true);
                  }}
                  className="w-full sm:w-auto"
                  data-testid="button-edit-admin-profile"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEditProfile}
                    className="flex-1 sm:flex-none"
                    data-testid="button-cancel-edit-admin-profile"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 sm:flex-none"
                    data-testid="button-save-admin-profile"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  {isEditingProfile ? (
                    <Input
                      id="admin-username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="Enter username"
                      data-testid="input-admin-username"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{adminProfile?.username || '-'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  {isEditingProfile ? (
                    <Input
                      id="admin-email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Enter email"
                      data-testid="input-admin-email"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{adminProfile?.email || '-'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{adminProfile?.role || '-'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Role can only be changed by a super admin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Profile Picture Dialog */}
      <AlertDialog open={showDeletePictureDialog} onOpenChange={setShowDeletePictureDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? You can upload a new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-admin-picture">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProfilePictureMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteProfilePictureMutation.isPending}
              data-testid="button-confirm-delete-admin-picture"
            >
              {deleteProfilePictureMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-auto sm:max-w-md">
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
        <DialogContent className="w-[calc(100%-1rem)] sm:w-auto sm:max-w-lg">
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
