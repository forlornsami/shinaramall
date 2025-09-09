import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, Search, Filter, Eye, Star } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductGrid() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/storefront'],
    queryFn: async () => {
      const response = await fetch('/api/products?isActive=true&limit=20');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    retry: false,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-500":
          filtered = filtered.filter(product => parseFloat(product.price) < 500);
          break;
        case "500-1000":
          filtered = filtered.filter(product => {
            const price = parseFloat(product.price);
            return price >= 500 && price <= 1000;
          });
          break;
        case "1000-2000":
          filtered = filtered.filter(product => {
            const price = parseFloat(product.price);
            return price > 1000 && price <= 2000;
          });
          break;
        case "over-2000":
          filtered = filtered.filter(product => parseFloat(product.price) > 2000);
          break;
      }
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "stock":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories;
  }, [products]);

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
    <div className="space-y-8">
      {/* Enhanced Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <label className="text-sm font-medium text-foreground mb-2 block">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-product-search"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Price Range Filter */}
          <div className="w-full lg:w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger data-testid="select-price-range">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-500">Under Rs. 500</SelectItem>
                <SelectItem value="500-1000">Rs. 500 - 1,000</SelectItem>
                <SelectItem value="1000-2000">Rs. 1,000 - 2,000</SelectItem>
                <SelectItem value="over-2000">Over Rs. 2,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort */}
          <div className="w-full lg:w-48">
            <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results info */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(searchQuery || selectedCategory !== "all" || priceRange !== "all") && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange("all");
                setSortBy("name");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12" data-testid="text-no-filtered-products">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Products Match Your Filters</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria or clear the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product) => (
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
