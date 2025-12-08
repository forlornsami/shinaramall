import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { X, Lock, ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Smartphone, Wallet, Banknote, Copy, Upload, ImageIcon, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product, PaymentAccount } from "@shared/schema";

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
  const { cartItems, clearCart } = useCart() as {
    cartItems: CartItemWithProduct[] | undefined;
    clearCart: () => void;
  };
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("easypaisa");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

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

  const subtotal = cartItems?.reduce((sum: number, item: CartItemWithProduct) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;
  
  const shippingCost = subtotal > 5000 ? 0 : 300;
  const total = subtotal + shippingCost;

  const selectedPaymentConfig = paymentMethods.find(m => m.id === paymentMethod);
  const requiresPaymentProof = selectedPaymentConfig?.requiresProof || false;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        paymentMethod,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        total: total.toString(),
        shippingAddress: shippingInfo,
      };
      
      const response = await apiRequest('POST', '/api/orders', orderData);
      return await response.json();
    },
    onSuccess: async (order) => {
      setOrderId(order.id);
      setOrderNumber(order.orderNumber);
      
      if (requiresPaymentProof) {
        // Go to payment proof step - don't clear cart yet, wait for proof submission
        setStep(3);
      } else {
        // COD - just show success and clear cart
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.orderNumber} has been placed. Pay on delivery.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        clearCart();
        onClose();
        setStep(1);
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
      const response = await apiRequest('POST', `/api/orders/${orderId}/payment-proof`, {
        screenshot: paymentScreenshot,
        transactionId: transactionId || null,
      });
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
      setStep(1);
      setPaymentScreenshot(null);
      setTransactionId("");
      setOrderId(null);
      setOrderNumber(null);
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
    
    createOrderMutation.mutate();
  };

  const handleNextStep = () => {
    if (step === 1) {
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
    setStep(step + 1);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };

  if (!isOpen) return null;

  const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);

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
                  Secure Checkout
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
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
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
                
                <Separator />
                
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    {cartItems?.map((item: CartItemWithProduct) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                        <img 
                          src={item.product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43"} 
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          Rs. {(parseFloat(item.product.price) * item.quantity).toLocaleString()}
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
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-foreground">Total</span>
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
                      disabled={createOrderMutation.isPending}
                      className="flex-1 btn-modern rounded-xl py-6"
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 mr-2" />
                          {`Pay Rs. ${total.toLocaleString()} with ${selectedPaymentMethod?.name}`}
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
