import { useState } from "react";
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
  User,
  Mail,
  Save,
  LogIn,
  Shield,
  Bell,
  CreditCard,
} from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountView() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

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
            onClick={() => window.location.href = '/api/login'}
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Email is managed by your Replit account
                    </p>
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
                        onClick={() => setIsEditing(true)}
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
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.firstName || "Profile"}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {(user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
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
    </div>
  );
}
