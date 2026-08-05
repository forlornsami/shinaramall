import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";

interface LocalCartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  items: LocalCartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isAddingToCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "shinara_guest_cart";

function getStoredCart(): LocalCartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredCart(items: LocalCartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function clearStoredCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [hasMerged, setHasMerged] = useState(false);

  const { data: serverCart, isLoading: serverCartLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products?isActive=true&limit=500');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  useEffect(() => {
    const stored = getStoredCart();
    setLocalCart(stored);
  }, []);

  const mergeMutation = useMutation({
    mutationFn: async (guestItems: LocalCartItem[]) => {
      await apiRequest('POST', '/api/cart/merge', { items: guestItems });
    },
    onSuccess: () => {
      clearStoredCart();
      setLocalCart([]);
      setHasMerged(true);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  useEffect(() => {
    if (isAuthenticated && !hasMerged && localCart.length > 0) {
      mergeMutation.mutate(localCart);
    }
    if (isAuthenticated && localCart.length === 0) {
      setHasMerged(true);
    }
  }, [isAuthenticated, hasMerged, localCart.length]);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await apiRequest('POST', '/api/cart', { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('DELETE', `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await apiRequest('PATCH', `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const enrichedItems = useMemo(() => {
    if (isAuthenticated && serverCart) {
      return serverCart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
      }));
    }
    return localCart.map(item => ({
      ...item,
      product: products?.find(p => p.id === item.productId),
    }));
  }, [isAuthenticated, serverCart, localCart, products]);

  const itemCount = useMemo(() => {
    return enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [enrichedItems]);

  const total = useMemo(() => {
    return enrichedItems.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || "0");
      return sum + price * item.quantity;
    }, 0);
  }, [enrichedItems]);

  const addToCart = useCallback((productId: string, quantity = 1): boolean => {
    if (isAuthenticated) {
      const existing = enrichedItems.find(i => i.productId === productId);
      const stock = existing?.product?.stock;
      const inCart = existing?.quantity ?? 0;
      if (stock !== undefined && stock !== null && inCart >= stock) return false;
      const allowed = stock !== undefined && stock !== null
        ? Math.min(quantity, stock - inCart)
        : quantity;
      if (allowed <= 0) return false;
      addToCartMutation.mutate({ productId, quantity: allowed });
      return true;
    } else {
      const existing = localCart.find(item => item.productId === productId);
      const stock = products?.find(p => p.id === productId)?.stock;
      const inCart = existing?.quantity ?? 0;
      if (stock !== undefined && stock !== null && inCart >= stock) return false;
      const allowed = stock !== undefined && stock !== null
        ? Math.min(quantity, stock - inCart)
        : quantity;
      if (allowed <= 0) return false;
      setLocalCart(prev => {
        const ex = prev.find(item => item.productId === productId);
        let updated: LocalCartItem[];
        if (ex) {
          updated = prev.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + allowed }
              : item
          );
        } else {
          updated = [...prev, { productId, quantity: allowed }];
        }
        setStoredCart(updated);
        return updated;
      });
      return true;
    }
  }, [isAuthenticated, addToCartMutation, enrichedItems, localCart, products]);

  const removeFromCart = useCallback((productId: string) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(productId);
    } else {
      setLocalCart(prev => {
        const updated = prev.filter(item => item.productId !== productId);
        setStoredCart(updated);
        return updated;
      });
    }
  }, [isAuthenticated, removeFromCartMutation]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    // Cap at available stock (product is present in enrichedItems)
    const item = enrichedItems.find(i => i.productId === productId);
    const stock = item?.product?.stock;
    if (stock !== undefined && stock !== null && quantity > stock) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ productId, quantity });
    } else {
      setLocalCart(prev => {
        const updated = prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
        setStoredCart(updated);
        return updated;
      });
    }
  }, [isAuthenticated, updateQuantityMutation, removeFromCart]);

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      serverCart?.forEach(item => {
        removeFromCartMutation.mutate(item.productId);
      });
    } else {
      setLocalCart([]);
      clearStoredCart();
    }
  }, [isAuthenticated, serverCart, removeFromCartMutation]);

  const isLoading = serverCartLoading && isAuthenticated;
  const isAddingToCart = addToCartMutation.isPending;

  return (
    <CartContext.Provider
      value={{
        items: enrichedItems,
        itemCount,
        total,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isAddingToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
