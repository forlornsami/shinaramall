import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { X, Lock, ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Smartphone, Wallet, Banknote, Bitcoin, Copy, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product } from "@shared/schema";
import { SiBinance } from "react-icons/si";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

type PaymentMethod = "easypaisa" | "jazzcash" | "hbl" | "cod" | "tron_usdt" | "binance_pay";

const paymentMethods = [
  {
    id: "easypaisa" as PaymentMethod,
    name: "EasyPaisa",
    description: "Pay with your EasyPaisa account",
    icon: Smartphone,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-500",
    isCrypto: false,
  },
  {
    id: "jazzcash" as PaymentMethod,
    name: "JazzCash",
    description: "Pay with your JazzCash account",
    icon: Wallet,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-500",
    isCrypto: false,
  },
  {
    id: "hbl" as PaymentMethod,
    name: "HBL Bank",
    description: "Pay with your HBL bank account",
    icon: CreditCard,
    color: "from-blue-600 to-indigo-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-600",
    isCrypto: false,
  },
  {
    id: "cod" as PaymentMethod,
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-500",
    isCrypto: false,
  },
  {
    id: "tron_usdt" as PaymentMethod,
    name: "Tron USDT (TRC-20)",
    description: "Pay with USDT on Tron network",
    icon: Bitcoin,
    color: "from-red-600 to-red-700",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-600",
    isCrypto: true,
  },
  {
    id: "binance_pay" as PaymentMethod,
    name: "Binance Pay",
    description: "Pay with crypto via Binance",
    icon: SiBinance,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-500",
    isCrypto: true,
  },
];

interface CryptoPaymentInfo {
  id: string;
  orderId: string;
  gatewayName: string;
  walletAddress?: string;
  cryptoAmount: string;
  cryptoCurrency: string;
  network: string;
  paymentUrl?: string;
  qrCode?: string;
  externalOrderId: string;
  status: string;
  expiresAt: string;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, clearCart } = useCart() as {
    cartItems: CartItemWithProduct[] | undefined;
    clearCart: () => void;
  };
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("easypaisa");
  const [cryptoPaymentInfo, setCryptoPaymentInfo] = useState<CryptoPaymentInfo | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const subtotal = cartItems?.reduce((sum: number, item: CartItemWithProduct) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;
  
  const shippingCost = subtotal > 5000 ? 0 : 300;
  const total = subtotal + shippingCost;

  const selectedPaymentConfig = paymentMethods.find(m => m.id === paymentMethod);
  const isCryptoPayment = selectedPaymentConfig?.isCrypto || false;

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
      
      if (isCryptoPayment) {
        try {
          const cryptoResponse = await apiRequest('POST', '/api/crypto-payments/create', {
            orderId: order.id,
            gatewayName: paymentMethod,
            cryptoCurrency: 'USDT',
          });
          const cryptoPayment = await cryptoResponse.json();
          setCryptoPaymentInfo(cryptoPayment);
          setStep(3);
          queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          clearCart();
        } catch (error) {
          toast({
            title: "Payment Setup Failed",
            description: "Failed to create crypto payment. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        const paymentEndpoint = `/api/payment/${paymentMethod}`;
        const paymentData = {
          orderId: order.id,
          amount: total,
          ...(paymentMethod === 'hbl' ? 
            { accountNumber: shippingInfo.phone } : 
            { phoneNumber: shippingInfo.phone }
          ),
        };
        
        try {
          const paymentResponse = await apiRequest('POST', paymentEndpoint, paymentData);
          const paymentResult = await paymentResponse.json();
          
          if (paymentResult.success) {
            toast({
              title: "Order Placed Successfully!",
              description: `Your order #${order.orderNumber} has been placed.`,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
            clearCart();
            onClose();
            setStep(1);
          } else {
            throw new Error(paymentResult.message || 'Payment failed');
          }
        } catch (error) {
          toast({
            title: "Payment Failed",
            description: "Your order was created but payment failed. Please contact support.",
            variant: "destructive",
          });
        }
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

            {step === 3 && cryptoPaymentInfo && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Bitcoin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Complete Your Payment
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send exactly the amount below to complete your order
                  </p>
                </div>

                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                      <p className="text-3xl font-bold text-primary" data-testid="text-crypto-amount">
                        {cryptoPaymentInfo.cryptoAmount} {cryptoPaymentInfo.cryptoCurrency}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ Rs. {total.toLocaleString()}
                      </p>
                    </div>

                    {cryptoPaymentInfo.walletAddress && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Send to this address ({cryptoPaymentInfo.network?.toUpperCase()})</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={cryptoPaymentInfo.walletAddress}
                            readOnly
                            className="font-mono text-sm"
                            data-testid="input-wallet-address"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(cryptoPaymentInfo.walletAddress || '')}
                            data-testid="button-copy-address"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {cryptoPaymentInfo.paymentUrl && cryptoPaymentInfo.gatewayName === 'binance_pay' && (
                      <div className="space-y-3">
                        <Button
                          type="button"
                          className="w-full btn-modern rounded-xl py-6 text-lg font-semibold"
                          onClick={() => window.open(cryptoPaymentInfo.paymentUrl, '_blank')}
                          data-testid="button-open-binance"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Pay with Binance Pay
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          You'll be redirected to Binance to complete your payment securely
                        </p>
                        {cryptoPaymentInfo.qrCode && (
                          <div className="flex flex-col items-center gap-2 pt-2">
                            <p className="text-sm text-muted-foreground">Or scan with Binance App:</p>
                            <img 
                              src={cryptoPaymentInfo.qrCode} 
                              alt="Binance Pay QR Code" 
                              className="w-32 h-32 rounded-lg border"
                              data-testid="img-binance-qr"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span>Payment expires in 1 hour</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <h4 className="font-medium text-foreground">Payment Instructions:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    {cryptoPaymentInfo.gatewayName === 'tron_usdt' ? (
                      <>
                        <li>Open your USDT wallet (TRC-20 supported)</li>
                        <li>Copy the wallet address above</li>
                        <li>Send exactly {cryptoPaymentInfo.cryptoAmount} USDT</li>
                        <li>Wait for blockchain confirmation (1-3 minutes)</li>
                      </>
                    ) : (
                      <>
                        <li>Click "Open Binance Pay" to proceed</li>
                        <li>Scan QR code or pay from your Binance app</li>
                        <li>Complete the payment in Binance</li>
                        <li>Your order will be confirmed automatically</li>
                      </>
                    )}
                  </ol>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Order ID: <span className="font-mono">{orderId?.slice(0, 8)}</span></p>
                  <p className="mt-1">Payment will be verified automatically</p>
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
                  onClick={() => {
                    onClose();
                    setStep(1);
                    setCryptoPaymentInfo(null);
                    setOrderId(null);
                  }}
                  className="w-full btn-modern rounded-xl py-6"
                  data-testid="button-done"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Done - I've Sent the Payment
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  You can check your order status in "My Orders"
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
                          {isCryptoPayment 
                            ? `Proceed with ${selectedPaymentMethod?.name}` 
                            : `Pay Rs. ${total.toLocaleString()} with ${selectedPaymentMethod?.name}`
                          }
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
