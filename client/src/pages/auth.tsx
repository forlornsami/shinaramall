import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShoppingBag, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import type { StoreSettings } from "@shared/schema";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  mobile: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Email-not-verified state for login form
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Standalone "didn't get the email?" panel
  const [showResendPanel, setShowResendPanel] = useState(false);
  const [resendPanelEmail, setResendPanelEmail] = useState("");
  const [resendPanelSubmitting, setResendPanelSubmitting] = useState(false);
  const [resendPanelSuccess, setResendPanelSuccess] = useState(false);

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      mobile: "",
    },
  });

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const startResendCooldown = () => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Email sent!", description: "Check your inbox for the verification link." });
        startResendCooldown();
      } else {
        toast({ title: "Failed to resend", description: data.message || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to resend", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  const handleResendPanelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendPanelEmail || resendPanelSubmitting) return;
    setResendPanelSubmitting(true);
    try {
      await fetch("/api/auth/resend-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendPanelEmail }),
      });
      // Always show success regardless of outcome (don't leak whether email exists)
      setResendPanelSuccess(true);
    } catch {
      // Still show success to avoid leaking info
      setResendPanelSuccess(true);
    } finally {
      setResendPanelSubmitting(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsLoggingIn(true);
    setEmailNotVerified(false);
    try {
      await login(data);
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      setLocation("/");
    } catch (error: any) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setUnverifiedEmail(data.email);
      } else {
        const message = error.status === 401
          ? "Invalid email or password"
          : "Login failed. Please try again.";
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsRegistering(true);
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
      });
    } catch (error: any) {
      if (error.code === "REGISTRATION_SUCCESS") {
        setLocation("/check-inbox");
        return;
      }
      if (error.code === "VERIFICATION_RESENT") {
        toast({
          title: "Verification email resent",
          description: "We resent a verification link to your inbox.",
        });
        setLocation("/check-inbox");
        return;
      }
      // Real errors
      const message = error.message?.includes("already exists")
        ? "An account with this email already exists."
        : error.message || "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
          {storeSettings?.storeLogo ? (
            <img 
              src={storeSettings.storeLogo} 
              alt={storeSettings?.storeName || "Store"}
              className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold gradient-text">{storeSettings?.storeName || "Shinara Mall"}</h1>
          <p className="text-muted-foreground mt-1">Shop Authentic Products</p>
        </div>

        <Card className="border-0 shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Create Account</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <CardTitle className="text-lg mb-1">Welcome back</CardTitle>
                <CardDescription className="mb-4">
                  Enter your email and password to sign in
                </CardDescription>

                {emailNotVerified && (
                  <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                    <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                      <p className="font-medium mb-2">Please verify your email first.</p>
                      <p className="text-sm mb-3">Check your inbox for the verification link we sent you.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        onClick={handleResendVerification}
                        disabled={isResending || resendCooldown > 0}
                        data-testid="button-resend-verification"
                      >
                        {isResending ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending...</>
                        ) : resendCooldown > 0 ? (
                          `Resend in ${resendCooldown}s`
                        ) : (
                          "Resend Verification Email"
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              {...field} 
                              data-testid="input-login-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              data-testid="input-login-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full btn-modern" 
                      disabled={isLoggingIn}
                      data-testid="button-login"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Standalone resend-verification panel */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                    onClick={() => {
                      setShowResendPanel(p => !p);
                      setResendPanelSuccess(false);
                      setResendPanelEmail("");
                    }}
                    data-testid="link-resend-verification-panel"
                  >
                    Didn&apos;t get the verification email?
                  </button>
                </div>

                {showResendPanel && (
                  <div className="mt-3 rounded-lg border border-muted bg-muted/30 p-4" data-testid="resend-verification-panel">
                    {resendPanelSuccess ? (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground" data-testid="resend-verification-success">
                        <Mail className="h-4 w-4 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                        <p>
                          If an unverified account exists for that email, we&apos;ve sent a new verification link. Check your inbox (and spam folder).
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleResendPanelSubmit} className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Enter your email address and we&apos;ll send a fresh verification link.
                        </p>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={resendPanelEmail}
                          onChange={e => setResendPanelEmail(e.target.value)}
                          required
                          data-testid="input-resend-verification-email"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={resendPanelSubmitting || !resendPanelEmail}
                          data-testid="button-resend-verification-panel"
                        >
                          {resendPanelSubmitting ? (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending...</>
                          ) : (
                            "Send Verification Email"
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <CardTitle className="text-lg mb-1">Create an account</CardTitle>
                <CardDescription className="mb-4">
                  Enter your details to get started
                </CardDescription>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                {...field} 
                                data-testid="input-register-firstname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                {...field} 
                                data-testid="input-register-lastname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              {...field} 
                              data-testid="input-register-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="03001234567" 
                              {...field} 
                              data-testid="input-register-mobile"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              data-testid="input-register-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                              data-testid="input-register-confirm-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full btn-modern" 
                      disabled={isRegistering}
                      data-testid="button-register"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
