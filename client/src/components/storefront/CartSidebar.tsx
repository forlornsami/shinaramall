import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductThumbnail } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import CheckoutModal from "@/components/checkout-modal";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  X,
  ShoppingBag,
  CreditCard,
  ChevronUp,
} from "lucide-react";

interface CartSidebarProps {
  onGoToCart: () => void;
}

export default function CartSidebar({ onGoToCart }: CartSidebarProps) {
  const { isAuthenticated } = useAuth();
  const { items, itemCount, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const { data: storeSettings } = useQuery<any>({ queryKey: ["/api/store-settings"] });

  const shippingFee = parseFloat(storeSettings?.shippingFee ?? "300") || 300;
  const freeThreshold = parseFloat(storeSettings?.freeShippingThreshold ?? "5000");
  const shipping = freeThreshold > 0 && total >= freeThreshold ? 0 : shippingFee;
  const grandTotal = total + shipping;
  const guestCheckoutEnabled = storeSettings?.guestCheckoutEnabled ?? false;

  const handleCheckout = () => {
    if (!isAuthenticated && !guestCheckoutEnabled) {
      localStorage.setItem("checkoutRedirect", "true");
      window.location.href = "/auth";
      return;
    }
    setShowCheckoutModal(true);
  };

  const CartContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-pink-500 to-rose-600">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-white" />
          <span className="font-semibold text-white text-sm">
            Cart {itemCount > 0 && <span className="ml-1 bg-white/20 rounded-full px-2 py-0.5 text-xs">{itemCount}</span>}
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-white/80 hover:text-white text-xs transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Your cart is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Add products to get started</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const price = parseFloat(item.product?.price || "0");
              const stock = item.product?.stock ?? Infinity;
              return (
                <li key={item.productId} className="p-3 flex gap-3 hover:bg-muted/30 transition-colors">
                  {/* Thumbnail */}
                  <img
                    src={item.product ? getProductThumbnail(item.product) : "/placeholder-product.svg"}
                    alt={item.product?.name || "Product"}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-xs text-primary font-bold mt-0.5">
                      Rs. {(price * item.quantity).toLocaleString()}
                    </p>
                    {/* Qty controls */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= stock}
                        title={item.quantity >= stock ? `Only ${stock} in stock` : undefined}
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="ml-auto w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer: totals + actions */}
      {items.length > 0 && (
        <div className="border-t bg-background px-4 py-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">Rs. {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Shipping</span>
            <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-foreground"}`}>
              {shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span className="text-primary">Rs. {grandTotal.toLocaleString()}</span>
          </div>

          <Button
            className="w-full btn-modern h-9 rounded-xl text-xs"
            onClick={handleCheckout}
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Checkout
          </Button>
          <button
            onClick={() => { onGoToCart(); setMobileOpen(false); }}
            className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View full cart →
          </button>
        </div>
      )}
    </div>
  );

  // Hide entirely when cart is empty
  if (items.length === 0) return null;

  return (
    <>
      {/* ── Desktop sidebar panel ── */}
      <aside className="hidden lg:flex flex-col fixed right-0 top-0 bottom-0 w-72 border-l bg-card shadow-lg z-30">
        <CartContent />
      </aside>

      {/* ── Mobile: floating button ── */}
      {itemCount > 0 && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg flex items-center justify-center text-white"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-white text-pink-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-pink-200">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        </button>
      )}

      {/* ── Mobile: bottom sheet ── */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: "80vh" }}>
            {/* drag handle */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="w-10 h-1 bg-muted rounded-full mx-auto" />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-3 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <CartContent />
            </div>
          </div>
        </>
      )}

      <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} />
    </>
  );
}
