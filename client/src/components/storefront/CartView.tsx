import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  LogIn,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";
import CheckoutModal from "@/components/checkout-modal";

export default function CartView() {
  const { isAuthenticated } = useAuth();
  const { items, itemCount, total, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleLogin = () => {
    localStorage.setItem('checkoutRedirect', 'true');
    window.location.href = '/auth';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
            <p className="text-sm text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0 && !showCheckoutModal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
        </div>
      </div>
    );
  }
  
  if (items.length === 0 && showCheckoutModal) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            </div>
          </div>

          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
          </div>
        </div>
        <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-cart-title">
              Shopping Cart
            </h2>
            <p className="text-sm text-muted-foreground">{itemCount} items in your cart</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={clearCart}
          data-testid="button-clear-cart"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="border-0 shadow-sm" data-testid={`cart-item-${item.productId}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.product?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                    alt={item.product?.name || "Product"}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid={`cart-item-name-${item.productId}`}>
                      {item.product?.name || "Product"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.product?.shortDescription}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary" data-testid={`text-item-total-${item.productId}`}>
                          Rs. {(parseFloat(item.product?.price || "0") * item.quantity).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                          data-testid={`button-remove-${item.productId}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span className="font-medium">Rs. {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl text-primary" data-testid="text-cart-total">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              <Button
                className="w-full btn-modern h-12 rounded-xl"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free delivery on orders over Rs. 5,000</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {["EasyPaisa", "JazzCash", "HBL", "COD"].map((method) => (
                  <Badge key={method} variant="secondary" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Sign in to Continue
            </DialogTitle>
            <DialogDescription>
              Please sign in to complete your purchase. Your cart will be saved and ready for checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              className="w-full btn-modern h-12 rounded-xl"
              onClick={handleLogin}
              data-testid="button-login-modal"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Continue
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your cart items will be saved and merged with your account
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} />
    </div>
  );
}
