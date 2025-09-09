import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductGrid() {
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/storefront'],
    queryFn: async () => {
      const response = await fetch('/api/products?isActive=true&limit=20');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    retry: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart",
        description: "Product added to your cart successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden" data-testid={`skeleton-product-${i}`}>
            <div className="w-full h-48 bg-muted animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse mb-2 w-2/3" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12" data-testid="text-no-products">
        <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
        <p className="text-muted-foreground">Check back later for new products.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product: Product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
          <div className="relative">
            <img 
              src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"} 
              alt={product.name} 
              className="w-full h-48 object-cover"
              data-testid={`img-product-${product.id}`}
            />
            {product.isFeatured && (
              <Badge className="absolute top-2 left-2 bg-secondary" data-testid={`badge-featured-${product.id}`}>
                Featured
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2" data-testid={`text-product-description-${product.id}`}>
              {product.shortDescription || product.description?.substring(0, 100)}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                  Rs. {parseFloat(product.price).toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through" data-testid={`text-product-compare-price-${product.id}`}>
                    Rs. {parseFloat(product.compareAtPrice).toLocaleString()}
                  </span>
                )}
              </div>
              {product.stock > 0 && product.stock <= 10 && (
                <Badge variant="destructive" data-testid={`badge-low-stock-${product.id}`}>
                  Low Stock
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground" data-testid={`text-product-stock-${product.id}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              <Button
                size="sm"
                disabled={product.stock === 0 || addToCartMutation.isPending}
                onClick={() => addToCartMutation.mutate(product.id)}
                data-testid={`button-add-cart-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
