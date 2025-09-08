import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function ShoppingCart({ isOpen, onClose, onCheckout }: ShoppingCartProps) {
  const { cartItems, updateQuantity, removeFromCart, isLoading } = useCart();

  const subtotal = cartItems?.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  ) || 0;

  const shippingCost = 300; // Fixed shipping cost
  const total = subtotal + shippingCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-96 bg-card shadow-xl transform transition-transform duration-300 ease-in-out">
        <Card className="h-full rounded-none border-0 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle data-testid="text-cart-title">Shopping Cart</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                data-testid="button-close-cart"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-background rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !cartItems || cartItems.length === 0 ? (
              <div className="p-6 text-center" data-testid="text-empty-cart">
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button className="mt-4" onClick={onClose} data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-4 p-3 bg-background rounded-lg"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <img 
                        src={item.product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded"
                        data-testid={`img-cart-item-${item.id}`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground" data-testid={`text-cart-item-name-${item.id}`}>
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-cart-item-price-${item.id}`}>
                          Rs. {parseFloat(item.product.price).toLocaleString()}
                        </p>
                        <div className="flex items-center mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground" data-testid={`text-cart-item-total-${item.id}`}>
                          Rs. {(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 mt-1 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          {cartItems && cartItems.length > 0 && (
            <div className="flex-shrink-0 p-6 border-t border-border">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground" data-testid="text-cart-subtotal">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-foreground" data-testid="text-cart-shipping">
                    Rs. {shippingCost.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-foreground" data-testid="text-cart-total">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={onCheckout}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
