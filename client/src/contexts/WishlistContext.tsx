import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, WishlistItem } from "@shared/schema";

interface WishlistContextType {
  items: string[];
  itemCount: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isToggling: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "eshaal_guest_wishlist";

function getStoredWishlist(): string[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredWishlist(items: string[]): void {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

function clearStoredWishlist(): void {
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [localWishlist, setLocalWishlist] = useState<string[]>([]);
  const [hasMerged, setHasMerged] = useState(false);

  const { data: serverWishlist, isLoading: serverWishlistLoading } = useQuery<(WishlistItem & { product: Product })[]>({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const stored = getStoredWishlist();
    setLocalWishlist(stored);
  }, []);

  const mergeMutation = useMutation({
    mutationFn: async (guestItems: string[]) => {
      await apiRequest('POST', '/api/wishlist/merge', { items: guestItems });
    },
    onSuccess: () => {
      clearStoredWishlist();
      setLocalWishlist([]);
      setHasMerged(true);
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
  });

  useEffect(() => {
    if (isAuthenticated && !hasMerged && localWishlist.length > 0) {
      mergeMutation.mutate(localWishlist);
    }
    if (isAuthenticated && localWishlist.length === 0) {
      setHasMerged(true);
    }
  }, [isAuthenticated, hasMerged, localWishlist.length]);

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('POST', '/api/wishlist', { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
  });

  const addToWishlist = useCallback((productId: string) => {
    if (isAuthenticated) {
      addToWishlistMutation.mutate(productId);
    } else {
      setLocalWishlist(prev => {
        if (prev.includes(productId)) return prev;
        const updated = [...prev, productId];
        setStoredWishlist(updated);
        return updated;
      });
    }
  }, [isAuthenticated, addToWishlistMutation]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (isAuthenticated) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      setLocalWishlist(prev => {
        const updated = prev.filter(id => id !== productId);
        setStoredWishlist(updated);
        return updated;
      });
    }
  }, [isAuthenticated, removeFromWishlistMutation]);

  const isInWishlist = useCallback((productId: string) => {
    if (isAuthenticated && serverWishlist) {
      return serverWishlist.some(item => item.productId === productId);
    }
    return localWishlist.includes(productId);
  }, [isAuthenticated, serverWishlist, localWishlist]);

  const toggleWishlist = useCallback((productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(() => {
    if (isAuthenticated) {
      serverWishlist?.forEach(item => {
        removeFromWishlistMutation.mutate(item.productId);
      });
    } else {
      setLocalWishlist([]);
      clearStoredWishlist();
    }
  }, [isAuthenticated, serverWishlist, removeFromWishlistMutation]);

  const items = useMemo(() => {
    if (isAuthenticated && serverWishlist) {
      return serverWishlist.map(item => item.productId);
    }
    return localWishlist;
  }, [isAuthenticated, serverWishlist, localWishlist]);

  const itemCount = items.length;
  const isLoading = serverWishlistLoading && isAuthenticated;
  const isToggling = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isToggling,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
