import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { X, Lock, ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Smartphone, Wallet, Banknote, Copy, Upload, ImageIcon, Loader2, WalletMinimal, Ticket, UserCircle, LogIn } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getProductThumbnail } from "@/lib/utils";
import type { CartItem, Product, PaymentAccount, Wallet as WalletType, StoreSettings } from "@shared/schema";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

type PaymentMethod = "easypaisa" | "jazzcash" | "hbl" | "cod";

const paymentMethods = [
  {
    id: "easypaisa" as PaymentMethod,
    name: "EasyPaisa",
    description: "Pay with your EasyPaisa account",
    icon: Smartphone,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-500",
    requiresProof: true,
  },
  {
    id: "jazzcash" as PaymentMethod,
    name: "JazzCash",
    description: "Pay with your JazzCash account",
    icon: Wallet,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-500",
    requiresProof: true,
  },
  {
    id: "hbl" as PaymentMethod,
    name: "HBL Bank",
    description: "Pay with your HBL bank account",
    icon: CreditCard,
    color: "from-blue-600 to-indigo-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-600",
    requiresProof: true,
  },
  {
    id: "cod" as PaymentMethod,
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-500",
    requiresProof: false,
  },
];

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items: cartItems, total: cartContextTotal, clearCart } = useCart() as {
    items: CartItemWithProduct[] | undefined;
    total: number;
    clearCart: () => void;
  };
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  // "choosing" = the auth/guest choice screen; "guest" = proceeding as guest; "auth" = normal authenticated flow
  const [checkoutMode, setCheckoutMode] = useState<"choosing" | "guest" | "auth">("choosing");
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("easypaisa");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmountToUse, setWalletAmountToUse] = useState("0");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [guestToken, setGuestToken] = useState<string | null>(null);

  // Fetch store settings to check guest checkout
  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const guestCheckoutEnabled = storeSettings?.guestCheckoutEnabled ?? false;
  // If authenticated, always go to auth flow; skip choice screen
  const effectiveMode = isAuthenticated ? "auth" : checkoutMode;

  // Fetch wallet balance
  const { data: wallet, refetch: refetchWallet } = useQuery<WalletType>({
    queryKey: ["/api/wallet"],
    enabled: isAuthenticated,
  });
  
  const walletBalance = parseFloat(wallet?.balance || "0");

  // Fetch payment accounts for selected method
  const { data: paymentAccounts } = useQuery<PaymentAccount[]>({
    queryKey: ['/api/payment-accounts/method', paymentMethod],
    queryFn: async () => {
      if (paymentMethod === 'cod') return [];
      const response = await fetch(`/api/payment-accounts/method/${paymentMethod}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: paymentMethod !== 'cod',
  });

  const subtotal = cartItems && cartItems.length > 0
    ? cartItems.reduce((sum: number, item: CartItemWithProduct) => 
        sum + (parseFloat((item.product as any)?.price || "0") * item.quantity), 0
      ) || cartContextTotal
    : cartContextTotal;
  
  const shippingFee = parseFloat(storeSettings?.shippingFee as string ?? "300") || 300;
  const freeShippingThreshold = parseFloat(storeSettings?.freeShippingThreshold as string ?? "5000");
  const shippingCost = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : shippingFee;
  
  // Calculate coupon discount
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  
  // Subtotal with shipping minus coupon discount
  const subtotalWithShipping = subtotal + shippingCost;
  const subtotalAfterCoupon = Math.max(0, subtotalWithShipping - couponDiscount);
  
  // Calculate wallet amount to use (can't exceed balance or total after coupon)
  const effectiveWalletAmount = useWallet 
    ? Math.min(parseFloat(walletAmountToUse) || 0, walletBalance, subtotalAfterCoupon) 
    : 0;
  const remainingAmount = subtotalAfterCoupon - effectiveWalletAmount;
  const total = remainingAmount;
  
  // If wallet covers full amount, no other payment needed
  const walletCoversFullAmount = effectiveWalletAmount >= subtotalAfterCoupon;

  const selectedPaymentConfig = paymentMethods.find(m => m.id === paymentMethod);
  const requiresPaymentProof = selectedPaymentConfig?.requiresProof || false;

  // Coupon validation mutation
  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      // Build cart items with product and category info for validation
      const cartData = cartItems?.map(item => ({
        productId: item.product.id,
        categoryId: item.product.categoryId,
        price: parseFloat(item.product.price),
        quantity: item.quantity,
      })) || [];
      
      const response = await apiRequest('POST', '/api/coupons/validate', {
        code,
        cartItems: cartData,
        subtotal,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon({
          id: data.couponId,
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
        });
        setCouponError(null);
        setCouponCode("");
        toast({
          title: "Coupon Applied!",
          description: `You saved Rs. ${data.discountAmount.toLocaleString()}`,
        });
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    },
    onError: (error: Error) => {
      setCouponError(error.message || "Failed to validate coupon");
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponError(null);
    validateCouponMutation.mutate(couponCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  // Guest order mutation
  const createGuestOrderMutation = useMutation({
    mutationFn: async () => {
      const guestOrderData = {
        guestName: guestInfo.name,
        guestEmail: guestInfo.email || undefined,
        guestPhone: guestInfo.phone,
        shippingAddress: shippingInfo,
        paymentMethod,
        items: cartItems?.map((item: CartItemWithProduct) => ({
          productId: item.productId,
          quantity: item.quantity,
        })) || [],
        // subtotal, shippingCost, and total are computed server-side for security
      };
      const response = await apiRequest('POST', '/api/orders/guest', guestOrderData);
      return await response.json();
    },
    onSuccess: async (order) => {
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      // Store the capability token returned by the server for proof upload
      if (order.guestToken) setGuestToken(order.guestToken);
      const isRequiresProof = selectedPaymentConfig?.requiresProof || false;
      if (isRequiresProof) {
        setStep(3);
      } else {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.orderNumber} has been placed. Pay on delivery.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        clearCart();
        onClose();
        resetCheckoutState();
      }
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        paymentMethod: walletCoversFullAmount ? 'wallet' : paymentMethod,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        total: subtotalAfterCoupon.toString(),
        shippingAddress: shippingInfo,
        walletAmountUsed: effectiveWalletAmount.toString(),
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: appliedCoupon?.discountAmount?.toString() || "0",
      };
      
      const response = await apiRequest('POST', '/api/orders', orderData);
      return await response.json();
    },
    onSuccess: async (order) => {
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      
      // Invalidate wallet data if wallet was used
      if (effectiveWalletAmount > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      }
      
      // If wallet covers full amount or COD, complete immediately
      if (walletCoversFullAmount) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.orderNumber} has been placed. Rs. ${effectiveWalletAmount.toLocaleString()} paid from wallet.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        clearCart();
        onClose();
        resetCheckoutState();
      } else if (requiresPaymentProof && remainingAmount > 0) {
        // Go to payment proof step - don't clear cart yet, wait for proof submission
        setStep(3);
      } else {
        // COD - just show success and clear cart
        const walletNote = effectiveWalletAmount > 0 
          ? ` Rs. ${effectiveWalletAmount.toLocaleString()} paid from wallet.` 
          : '';
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.orderNumber} has been placed.${walletNote} Pay remaining on delivery.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        clearCart();
        onClose();
        resetCheckoutState();
      }
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload payment proof mutation
  const uploadPaymentProofMutation = useMutation({
    mutationFn: async () => {
      if (!orderId || !paymentScreenshot) {
        throw new Error("Order ID and screenshot are required");
      }
      const endpoint = effectiveMode === "guest"
        ? `/api/orders/guest/${orderId}/payment-proof`
        : `/api/orders/${orderId}/payment-proof`;
      const body: any = {
        screenshot: paymentScreenshot,
        transactionId: transactionId || null,
      };
      if (effectiveMode === "guest" && guestToken) {
        body.guestToken = guestToken;
      }
      const response = await apiRequest('POST', endpoint, body);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Proof Submitted!",
        description: "Your payment is being verified. We'll notify you once confirmed.",
      });
      // Now clear the cart and close the modal
      queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      clearCart();
      onClose();
      resetCheckoutState();
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload payment proof. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle screenshot upload
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setPaymentScreenshot(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const handlePlaceOrder = () => {
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping information fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (effectiveMode === "guest") {
      createGuestOrderMutation.mutate();
    } else {
      createOrderMutation.mutate();
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate guest info if in guest mode
      if (effectiveMode === "guest") {
        if (!guestInfo.name || !guestInfo.phone) {
          toast({
            title: "Missing Information",
            description: "Please fill in your name and phone number.",
            variant: "destructive",
          });
          return;
        }
      }
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || 
          !shippingInfo.city || !shippingInfo.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required shipping fields.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step +  1);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };

  const resetCheckoutState = () => {
    setStep(1);
    setCheckoutMode("choosing");
    setPaymentScreenshot(null);
    setTransactionId("");
    setOrderId(null);
    setOrderNumber(null);
    setUseWallet(false);
    setWalletAmountToUse("0");
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    setGuestInfo({ name: "", phone: "", email: "" });
    setGuestToken(null);
    setShippingInfo({ firstName: "", lastName: "", address: "", city: "", postalCode: "", phone: "" });
  };
  
  const handleApplyWallet = () => {
    if (walletBalance > 0) {
      setUseWallet(true);
      // Apply the maximum possible (min of balance and total)
      setWalletAmountToUse(Math.min(walletBalance, subtotalWithShipping).toString());
    }
  };
  
  const handleRemoveWallet = () => {
    setUseWallet(false);
    setWalletAmountToUse("0");
  };

  if (!isOpen) return null;

  const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);

  // Show choice screen for unauthenticated users when guest checkout is enabled
  if (!isAuthenticated && guestCheckoutEnabled && effectiveMode === "choosing") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <Card className="relative w-full max-w-md rounded-3xl shadow-2xl border-0 animate-slide-up">
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground" data-testid="text-checkout-title">Checkout</h2>
            </div>
            <Button type="button" variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={onClose} data-testid="button-close-checkout">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <CardContent className="p-6 space-y-4">
            <p className="text-center text-muted-foreground mb-2">How would you like to continue?</p>
            <button
              onClick={() => setCheckoutMode("auth")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all text-left"
              data-testid="button-signin-checkout"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Sign In / Register</div>
                <div className="text-sm text-muted-foreground">Access wallet, order history & more</div>
              </div>
            </button>
            <button
              onClick={() => setCheckoutMode("guest")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-muted hover:border-primary/30 hover:bg-muted/30 transition-all text-left"
              data-testid="button-guest-checkout"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Continue as Guest</div>
                <div className="text-sm text-muted-foreground">No account needed, quick checkout</div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border-0 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground" data-testid="text-checkout-title">
                  {effectiveMode === "guest" ? "Guest Checkout" : "Secure Checkout"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {step === 3 ? 'Complete Payment' : `Step ${step} of 2`}
                </p>
              </div>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive"
              onClick={onClose}
              data-testid="button-close-checkout"
            >
              <X className="h-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            {step === 3 && (
              <div className="flex-1 h-2 rounded-full transition-colors bg-primary" />
            )}
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Guest info fields - only show in guest mode */}
                {effectiveMode === "guest" && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-primary" />
                      Your Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="guestName" className="text-sm font-medium">Full Name *</Label>
                        <Input
                          id="guestName"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                          className="mt-2 h-12 rounded-xl border-2"
                          placeholder="Ahmad Khan"
                          data-testid="input-guest-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guestPhone" className="text-sm font-medium">Phone Number *</Label>
                        <Input
                          id="guestPhone"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                          className="mt-2 h-12 rounded-xl border-2"
                          placeholder="03XX-XXXXXXX"
                          data-testid="input-guest-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guestEmail" className="text-sm font-medium">Email (Optional)</Label>
                        <Input
                          id="guestEmail"
                          type="email"
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                          className="mt-2 h-12 rounded-xl border-2"
                          placeholder="your@email.com (for order confirmation)"
                          data-testid="input-guest-email"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Shipping Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-2"
                        placeholder="Ahmad"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-2"
                        placeholder="Khan"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="address" className="text-sm font-medium">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="mt-2 h-12 rounded-xl border-2"
                      placeholder="House 123, Street 45, Block A"
                      data-testid="input-address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-2"
                        placeholder="Lahore"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-2"
                        placeholder="54000"
                        data-testid="input-postal-code"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="mt-2 h-12 rounded-xl border-2"
                      placeholder="03XX-XXXXXXX"
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Coupon Section - hidden for guests */}
                {effectiveMode !== "guest" && <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Apply Coupon Code
                  </h3>
                  {appliedCoupon ? (
                    <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-green-700 dark:text-green-400" data-testid="text-applied-coupon">
                                {appliedCoupon.code}
                              </span>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {appliedCoupon.discountType === 'percentage' 
                                ? `${appliedCoupon.discountValue}% off` 
                                : `Rs. ${parseFloat(appliedCoupon.discountValue).toLocaleString()} off`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-green-600" data-testid="text-coupon-savings">
                              -Rs. {appliedCoupon.discountAmount.toLocaleString()}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveCoupon}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              data-testid="button-remove-coupon"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        placeholder="Enter coupon code"
                        className={`flex-1 h-12 rounded-xl border-2 font-mono uppercase ${couponError ? 'border-red-500' : ''}`}
                        data-testid="input-coupon-code"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={validateCouponMutation.isPending || !couponCode.trim()}
                        className="h-12 px-6 rounded-xl"
                        data-testid="button-apply-coupon"
                      >
                        {validateCouponMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-red-500 mt-2" data-testid="text-coupon-error">{couponError}</p>
                  )}
                </div>}

                {/* Wallet Section */}
                {isAuthenticated && walletBalance > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <WalletMinimal className="w-5 h-5 text-primary" />
                      Use Wallet Balance
                    </h3>
                    <Card className={`border-2 transition-all ${useWallet ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-muted'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Wallet Balance</p>
                            <p className="text-2xl font-bold text-green-600" data-testid="text-checkout-wallet-balance">
                              Rs. {walletBalance.toLocaleString()}
                            </p>
                          </div>
                          {useWallet ? (
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Applied</p>
                                <p className="font-semibold text-green-600">
                                  -Rs. {effectiveWalletAmount.toLocaleString()}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRemoveWallet}
                                className="text-red-600 border-red-300"
                                data-testid="button-remove-wallet"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={handleApplyWallet} 
                              className="bg-green-600 hover:bg-green-700"
                              data-testid="button-apply-wallet"
                            >
                              Apply Wallet
                            </Button>
                          )}
                        </div>
                        {useWallet && effectiveWalletAmount >= subtotalWithShipping && (
                          <p className="mt-2 text-sm text-green-600 font-medium">
                            Your wallet balance covers the full amount!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Payment method selection - only show if wallet doesn't cover full amount */}
                {!walletCoversFullAmount && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {effectiveWalletAmount > 0 ? `Pay Remaining Rs. ${remainingAmount.toLocaleString()}` : 'Payment Method'}
                  </h3>
                  
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={handlePaymentMethodChange}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method.id 
                            ? `${method.bgColor} ${method.borderColor}` 
                            : 'border-muted hover:border-primary/30 hover:bg-muted/30'
                        }`}
                        onClick={() => handlePaymentMethodChange(method.id)}
                        data-testid={`payment-method-${method.id}`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-lg`}>
                          <method.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                )}
                
                <Separator />
                
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    {cartItems?.map((item: CartItemWithProduct) => (
                      <div key={(item as any).productId || item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                        <img 
                          src={getProductThumbnail((item as any).product)} 
                          alt={(item as any).product?.name || "Product"}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{(item as any).product?.name || "Product"}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          Rs. {(parseFloat((item as any).product?.price || "0") * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-medium' : 'text-foreground'}>
                        {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost.toLocaleString()}`}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Ticket className="w-4 h-4" /> Coupon ({appliedCoupon?.code})
                        </span>
                        <span className="text-green-600 font-medium" data-testid="text-summary-coupon-discount">
                          -Rs. {couponDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {effectiveWalletAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <WalletMinimal className="w-4 h-4" /> Wallet
                        </span>
                        <span className="text-green-600 font-medium">
                          -Rs. {effectiveWalletAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">{effectiveWalletAmount > 0 ? 'Amount to Pay' : 'Total'}</span>
                      <span className="text-primary" data-testid="text-checkout-total">
                        Rs. {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Complete Your Payment
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Order #{orderNumber} created. Send payment and upload proof.
                  </p>
                </div>

                {/* Payment Account Details */}
                {paymentAccounts && paymentAccounts.length > 0 && (
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="p-6 space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                        <p className="text-3xl font-bold text-primary" data-testid="text-payment-amount">
                          Rs. {total.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Send payment to:</Label>
                        {paymentAccounts.map((account) => (
                          <div key={account.id} className="bg-background rounded-lg p-4 border space-y-2">
                            {account.bankName && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Bank/Provider</span>
                                <span className="font-medium">{account.bankName}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Account Number</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{account.accountNumber}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => copyToClipboard(account.accountNumber)}
                                  data-testid="button-copy-account"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Account Name</span>
                              <span className="font-medium">{account.accountHolderName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Instructions */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <h4 className="font-medium text-foreground">Instructions:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Send Rs. {total.toLocaleString()} to the account above</li>
                    <li>Take a screenshot of your payment confirmation</li>
                    <li>Upload the screenshot below</li>
                    <li>Enter the transaction ID (optional but recommended)</li>
                  </ol>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Upload Payment Screenshot *</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleScreenshotUpload}
                    accept="image/*"
                    className="hidden"
                    data-testid="input-screenshot-file"
                  />
                  
                  {paymentScreenshot ? (
                    <div className="relative">
                      <img 
                        src={paymentScreenshot} 
                        alt="Payment screenshot" 
                        className="w-full max-h-48 object-contain rounded-lg border"
                        data-testid="img-payment-screenshot"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setPaymentScreenshot(null)}
                        data-testid="button-remove-screenshot"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      data-testid="button-upload-screenshot"
                    >
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground">Click to upload screenshot</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG (max 2MB)</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="transactionId" className="text-sm font-medium">Transaction ID (Optional)</Label>
                    <Input
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g., TXN123456789"
                      className="h-12 rounded-xl"
                      data-testid="input-transaction-id"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border p-6">
            {step === 3 ? (
              <div className="flex flex-col gap-3">
                <Button 
                  type="button"
                  onClick={() => uploadPaymentProofMutation.mutate()}
                  disabled={!paymentScreenshot || uploadPaymentProofMutation.isPending}
                  className="w-full btn-modern rounded-xl py-6"
                  data-testid="button-submit-proof"
                >
                  {uploadPaymentProofMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Submit Payment Proof
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Your payment will be verified within 24 hours
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  {step > 1 && (
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setStep(step - 1)}
                      className="rounded-xl"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  {step < 2 ? (
                    <Button 
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 btn-modern rounded-xl py-6"
                      data-testid="button-continue"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={createOrderMutation.isPending || createGuestOrderMutation.isPending}
                      className="flex-1 btn-modern rounded-xl py-6"
                      data-testid="button-place-order"
                    >
                      {(createOrderMutation.isPending || createGuestOrderMutation.isPending) ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 mr-2" />
                          {effectiveMode === "guest"
                            ? `Place Order - Rs. ${total.toLocaleString()}`
                            : walletCoversFullAmount
                              ? "Place Order – Paid from Wallet"
                              : `Pay Rs. ${total.toLocaleString()} with ${selectedPaymentMethod?.name}`}
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  Secured by 256-bit SSL encryption
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
