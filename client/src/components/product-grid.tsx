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
import { ShoppingCart, Heart, Search, Filter, Eye, Star, Sparkles, TrendingUp } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductGrid() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/storefront'],
    queryFn: async () => {
      const response = await fetch('/api/products?isActive=true&limit=20');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    retry: false,
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter((product: Product) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product: Product) => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-500":
          filtered = filtered.filter((product: Product) => parseFloat(product.price) < 500);
          break;
        case "500-1000":
          filtered = filtered.filter((product: Product) => {
            const price = parseFloat(product.price);
            return price >= 500 && price <= 1000;
          });
          break;
        case "1000-2000":
          filtered = filtered.filter((product: Product) => {
            const price = parseFloat(product.price);
            return price > 1000 && price <= 2000;
          });
          break;
        case "over-2000":
          filtered = filtered.filter((product: Product) => parseFloat(product.price) > 2000);
          break;
      }
    }
    
    filtered.sort((a: Product, b: Product) => {
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

  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = [...new Set(products.map((p: Product) => p.category).filter(Boolean))] as string[];
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="glass-card rounded-2xl p-6 animate-pulse">
          <div className="h-12 bg-muted rounded-xl w-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="card-modern animate-pulse" data-testid={`skeleton-product-${i}`}>
              <div className="w-full h-64 bg-muted rounded-t-2xl" />
              <CardContent className="p-5">
                <div className="h-5 bg-muted rounded-lg mb-3 w-3/4" />
                <div className="h-4 bg-muted rounded-lg mb-4 w-1/2" />
                <div className="h-10 bg-muted rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20" data-testid="text-no-products">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-3">No Products Found</h3>
        <p className="text-muted-foreground text-lg">Check back later for new products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filters */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <label className="text-sm font-medium text-foreground mb-2 block">Search Products</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl border-2 border-muted focus:border-primary transition-colors"
                data-testid="input-product-search"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="w-full lg:w-52">
            <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-muted" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category} className="rounded-lg">{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Price Range */}
          <div className="w-full lg:w-52">
            <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-muted" data-testid="select-price-range">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">All Prices</SelectItem>
                <SelectItem value="under-500" className="rounded-lg">Under Rs. 500</SelectItem>
                <SelectItem value="500-1000" className="rounded-lg">Rs. 500 - 1,000</SelectItem>
                <SelectItem value="1000-2000" className="rounded-lg">Rs. 1,000 - 2,000</SelectItem>
                <SelectItem value="over-2000" className="rounded-lg">Over Rs. 2,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort */}
          <div className="w-full lg:w-52">
            <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-muted" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="name" className="rounded-lg">Name A-Z</SelectItem>
                <SelectItem value="price-low" className="rounded-lg">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="rounded-lg">Price: High to Low</SelectItem>
                <SelectItem value="stock" className="rounded-lg">Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results info */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> of {products.length} products
            </p>
          </div>
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
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20" data-testid="text-no-filtered-products">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Filter className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">No Products Match Your Filters</h3>
          <p className="text-muted-foreground text-lg mb-6">Try adjusting your search criteria or clear the filters.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceRange("all");
              setSortBy("name");
            }}
            className="rounded-xl"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product) => (
            <Card 
              key={product.id} 
              className="group card-modern border-0"
              data-testid={`card-product-${product.id}`}
            >
              <div className="relative overflow-hidden rounded-t-2xl">
                <img 
                  src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"} 
                  alt={product.name} 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  data-testid={`img-product-${product.id}`}
                />
                
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg" data-testid={`badge-featured-${product.id}`}>
                      <Sparkles className="w-3 h-3 mr-1" /> Featured
                    </Badge>
                  )}
                  {product.stock > 0 && product.stock <= 10 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-lg" data-testid={`badge-low-stock-${product.id}`}>
                      Only {product.stock} left
                    </Badge>
                  )}
                  {product.compareAtPrice && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg" data-testid={`badge-discount-${product.id}`}>
                      {Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice)) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                    data-testid={`button-wishlist-${product.id}`}
                  >
                    <Heart className="h-4 w-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                    data-testid={`button-quick-view-${product.id}`}
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </Button>
                </div>
                
                {/* Quick Add Button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Button
                    className="w-full btn-modern rounded-xl bg-white text-primary hover:bg-white/90 shadow-lg"
                    size="sm"
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                    onClick={() => addToCartMutation.mutate(product.id)}
                    data-testid={`button-quick-add-${product.id}`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Quick Add
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight" data-testid={`text-product-name-${product.id}`}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-product-description-${product.id}`}>
                    {product.shortDescription || product.description?.substring(0, 80)}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center mt-3 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">(4.8) · 120 reviews</span>
                  </div>
                </div>
                
                {/* Price and stock */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                        Rs. {parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through" data-testid={`text-product-compare-price-${product.id}`}>
                          Rs. {parseFloat(product.compareAtPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground" data-testid={`text-product-stock-${product.id}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  {/* Add to cart button (desktop) */}
                  <Button
                    className="hidden sm:flex btn-modern rounded-xl"
                    size="sm"
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                    onClick={() => addToCartMutation.mutate(product.id)}
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Mobile add to cart */}
                <Button
                  className="w-full mt-4 sm:hidden btn-modern rounded-xl"
                  disabled={product.stock === 0 || addToCartMutation.isPending}
                  onClick={() => addToCartMutation.mutate(product.id)}
                  data-testid={`button-add-cart-mobile-${product.id}`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addToCartMutation.isPending ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
