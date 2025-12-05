import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { CartItem, Product } from "@shared/schema";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function ShoppingCart({ isOpen, onClose, onCheckout }: ShoppingCartProps) {
  const { cartItems, updateQuantity, removeFromCart, isLoading } = useCart() as {
    cartItems: CartItemWithProduct[] | undefined;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
    isLoading: boolean;
  };

  const subtotal = cartItems?.reduce((sum: number, item: CartItemWithProduct) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;

  const itemCount = cartItems?.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0) || 0;
  const shippingCost = subtotal > 5000 ? 0 : 300;
  const total = subtotal + shippingCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl transform transition-transform duration-300 ease-out animate-slide-in-right">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground" data-testid="text-cart-title">
                    Shopping Cart
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={onClose}
                data-testid="button-close-cart"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl animate-pulse">
                    <div className="w-20 h-20 bg-muted rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded-lg mb-3 w-3/4" />
                      <div className="h-3 bg-muted rounded-lg w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !cartItems || cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center" data-testid="text-empty-cart">
                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">Looks like you haven't added any items yet</p>
                <Button 
                  onClick={onClose} 
                  className="btn-modern rounded-xl"
                  data-testid="button-continue-shopping"
                >
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cartItems.map((item: CartItemWithProduct) => (
                  <div 
                    key={item.id} 
                    className="group flex items-start gap-4 p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors"
                    data-testid={`cart-item-${item.id}`}
                  >
                    {/* Product Image */}
                    <div className="relative">
                      <img 
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                        alt={item.product.name} 
                        className="w-20 h-20 object-cover rounded-xl shadow-sm"
                        data-testid={`img-cart-item-${item.id}`}
                      />
                      {item.product.isFeatured && (
                        <Badge className="absolute -top-2 -left-2 h-6 w-6 p-0 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow-lg">
                          <Sparkles className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground line-clamp-2 leading-tight mb-1" data-testid={`text-cart-item-name-${item.id}`}>
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-primary font-semibold" data-testid={`text-cart-item-price-${item.id}`}>
                        Rs. {parseFloat(item.product.price).toLocaleString()}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center bg-background rounded-xl border border-border overflow-hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right">
                      <div className="font-semibold text-foreground" data-testid={`text-cart-item-total-${item.id}`}>
                        Rs. {(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {cartItems && cartItems.length > 0 && (
            <div className="flex-shrink-0 border-t border-border bg-card">
              {/* Free Shipping Banner */}
              {subtotal < 5000 && (
                <div className="px-6 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-border">
                  <p className="text-sm text-center">
                    <span className="text-muted-foreground">Add </span>
                    <span className="font-semibold text-green-600">Rs. {(5000 - subtotal).toLocaleString()}</span>
                    <span className="text-muted-foreground"> more for </span>
                    <span className="font-semibold text-green-600">FREE shipping!</span>
                  </p>
                </div>
              )}
              
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground" data-testid="text-cart-subtotal">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-foreground'}`} data-testid="text-cart-shipping">
                      {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary" data-testid="text-cart-total">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full btn-modern rounded-xl py-6 text-lg" 
                  onClick={onCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure checkout with EasyPaisa, JazzCash & HBL
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
