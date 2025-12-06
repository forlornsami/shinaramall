import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { X, Lock, ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Smartphone, Wallet, Banknote } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product } from "@shared/schema";

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
  },
  {
    id: "jazzcash" as PaymentMethod,
    name: "JazzCash",
    description: "Pay with your JazzCash account",
    icon: Wallet,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-500",
  },
  {
    id: "hbl" as PaymentMethod,
    name: "HBL Bank",
    description: "Pay with your HBL bank account",
    icon: CreditCard,
    color: "from-blue-600 to-indigo-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-600",
  },
  {
    id: "cod" as PaymentMethod,
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Banknote,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-500",
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
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

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
                <p className="text-sm text-muted-foreground">Step {step} of 2</p>
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
          </CardContent>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border p-6">
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
                    <>Processing...</>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Pay Rs. {total.toLocaleString()} with {selectedPaymentMethod?.name}
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              Secured by 256-bit SSL encryption
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
