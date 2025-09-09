import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { X, Smartphone, Music, University, Lock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "easypaisa" | "jazzcash" | "hbl";

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("easypaisa");
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const subtotal = cartItems?.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;
  
  const shippingCost = 300;
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
      // Process payment
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
            description: `Your order #${order.orderNumber} has been placed. Transaction ID: ${paymentResult.transactionId}`,
          });
          // Refresh product data to show updated stock levels
          queryClient.invalidateQueries({ queryKey: ['/api/products/storefront'] });
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          clearCart();
          onClose();
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
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping info
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all shipping information fields.",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center" data-testid="text-checkout-title">
              <Lock className="w-5 h-5 mr-2" />
              Secure Checkout
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-checkout"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Information */}
            <div>
              <h3 className="font-medium text-foreground mb-4" data-testid="text-shipping-title">
                Shipping Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" data-testid="label-first-name">First Name</Label>
                  <Input
                    id="firstName"
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    placeholder="First name"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" data-testid="label-last-name">Last Name</Label>
                  <Input
                    id="lastName"
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    placeholder="Last name"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <Label htmlFor="address" data-testid="label-address">Address</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  placeholder="Street address"
                  data-testid="input-address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label htmlFor="city" data-testid="label-city">City</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    placeholder="City"
                    data-testid="input-city"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" data-testid="label-postal-code">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                    placeholder="Postal code"
                    data-testid="input-postal-code"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <Label htmlFor="phone" data-testid="label-phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  placeholder="Phone number"
                  data-testid="input-phone"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="font-medium text-foreground mb-4" data-testid="text-payment-title">
                Select Payment Method
              </h3>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="easypaisa" id="easypaisa" data-testid="radio-easypaisa" />
                  <Label htmlFor="easypaisa" className="flex items-center cursor-pointer flex-1">
                    <Smartphone className="text-secondary mr-3" />
                    <span className="font-medium">EasyPaisa</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="jazzcash" id="jazzcash" data-testid="radio-jazzcash" />
                  <Label htmlFor="jazzcash" className="flex items-center cursor-pointer flex-1">
                    <Music className="text-secondary mr-3" />
                    <span className="font-medium">JazzCash</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
                  <RadioGroupItem value="hbl" id="hbl" data-testid="radio-hbl" />
                  <Label htmlFor="hbl" className="flex items-center cursor-pointer flex-1">
                    <University className="text-secondary mr-3" />
                    <span className="font-medium">HBL Bank Transfer</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Order Summary */}
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3" data-testid="text-summary-title">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground" data-testid="text-checkout-subtotal">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-foreground" data-testid="text-checkout-shipping">
                    Rs. {shippingCost.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-foreground" data-testid="text-checkout-total">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-green-600 text-secondary-foreground"
              disabled={createOrderMutation.isPending}
              data-testid="button-place-order"
            >
              <Lock className="w-4 h-4 mr-2" />
              {createOrderMutation.isPending ? 'Processing...' : 'Place Secure Order'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
