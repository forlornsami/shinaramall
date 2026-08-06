import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Save,
  Shield,
  Bell,
  CreditCard,
  Camera,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import AddressBook from "@/components/storefront/AddressBook";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountView() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Only sync form values on initial mount when user data loads
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (user && !initialSyncDone.current) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
      initialSyncDone.current = true;
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest('PATCH', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return apiRequest('POST', '/api/profile/picture', { imageData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Picture Updated",
        description: "Your profile picture has been updated",
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

  const deletePictureMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/profile/picture');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setShowDeleteDialog(false);
      toast({
        title: "Picture Removed",
        description: "Your profile picture has been removed",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      uploadPictureMutation.mutate(base64);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Account</h2>
            <p className="text-sm text-muted-foreground">Sign in to view your account</p>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Sign in required</h3>
          <p className="text-muted-foreground mb-6">
            Please sign in to manage your account
          </p>
          <Button
            className="btn-modern rounded-xl"
            onClick={() => window.location.href = '/auth'}
            data-testid="button-signin-account"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-account-title">
            My Account
          </h2>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="rounded-xl"
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="rounded-xl"
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="flex items-center gap-2 mt-1.5 p-3 bg-muted rounded-xl">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm" data-testid="text-email">{user?.email}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {isEditing ? (
                      <>
                        <Button
                          type="submit"
                          className="btn-modern rounded-xl"
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setIsEditing(false);
                            form.reset({
                              firstName: user?.firstName || "",
                              lastName: user?.lastName || "",
                            });
                          }}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        data-testid="button-edit-profile"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || "Profile"}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-lg"
                      data-testid="img-profile-picture"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-background shadow-lg">
                      <span className="text-white font-bold text-3xl">
                        {(user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {uploadPictureMutation.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-profile-picture"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadPictureMutation.isPending}
                    data-testid="button-upload-picture"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {user?.profileImageUrl ? 'Change' : 'Upload'}
                  </Button>
                  {user?.profileImageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-destructive hover:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={deletePictureMutation.isPending}
                      data-testid="button-delete-picture"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Max size: 2MB. Supported: JPG, PNG, GIF
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl h-11"
                data-testid="link-security"
              >
                <Shield className="w-4 h-4 mr-3 text-primary" />
                Security Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl h-11"
                data-testid="link-notifications"
              >
                <Bell className="w-4 h-4 mr-3 text-primary" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl h-11"
                data-testid="link-payment-methods"
              >
                <CreditCard className="w-4 h-4 mr-3 text-primary" />
                Payment Methods
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Book */}
      <div className="border-0 shadow-sm bg-card rounded-2xl p-6">
        <AddressBook />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile picture? You can upload a new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePictureMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deletePictureMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deletePictureMutation.isPending ? (
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
    </div>
  );
}
