import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import ShoppingCart from "@/components/shopping-cart";
import CheckoutModal from "@/components/checkout-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Product } from "@shared/schema";
import { 
  ShoppingCart as CartIcon, 
  Search, 
  Sparkles,
  Star, 
  Shield, 
  Truck, 
  HeadphonesIcon,
  Heart,
  Eye,
  Filter,
  X,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  ArrowUpDown,
  Zap,
  TrendingUp,
  Package,
  ChevronRight,
  CreditCard
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [gridView, setGridView] = useState<"large" | "small">("large");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products?isActive=true&limit=100');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const maxPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return 100000;
    const max = Math.max(...allProducts.map(p => parseFloat(p.price)));
    return Math.ceil(max / 1000) * 1000;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    let filtered = [...allProducts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.shortDescription?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }
    
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "featured":
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return filtered;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy]);

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest('POST', '/api/cart', { productId, quantity: 1 });
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
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    },
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceRange([0, maxPrice]);
    setSortBy("featured");
  };

  const hasActiveFilters = searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const paymentMethods = [
    { name: "EasyPaisa", color: "from-green-500 to-emerald-600" },
    { name: "JazzCash", color: "from-red-500 to-rose-600" },
    { name: "HBL", color: "from-blue-600 to-indigo-700" },
    { name: "COD", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      
      {/* Welcome Header with Search */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Message */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-welcome">
                Welcome back, <span className="text-primary">{user?.firstName || 'Shopper'}</span>!
              </h1>
              <p className="text-muted-foreground mt-1">Discover amazing products at great prices</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>Secure Payments:</span>
              </div>
              {paymentMethods.map((method) => (
                <Badge 
                  key={method.name}
                  className={`bg-gradient-to-r ${method.color} text-white border-0 text-xs`}
                >
                  {method.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Main Search Bar */}
          <div className="relative max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl p-2 shadow-xl border border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for products, categories, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    data-testid="input-main-search"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-xl md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
                <Button className="h-12 px-8 rounded-xl btn-modern hidden md:flex" data-testid="button-search">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-category-all"
            >
              All Products
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="rounded-full shrink-0"
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`button-category-${category.slug}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground" data-testid="text-featured-title">Featured Products</h2>
                  <p className="text-sm text-muted-foreground">Handpicked items just for you</p>
                </div>
              </div>
              <Button variant="ghost" className="gap-2" data-testid="button-view-all-featured">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => addToCartMutation.mutate(product.id)}
                    isAddingToCart={addToCartMutation.isPending}
                    size="medium"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Products Section */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-all-products-title">
                  All Products
                </h2>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {filteredProducts.length} items
              </Badge>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-1"
                  onClick={clearFilters}
                  data-testid="button-clear-all-filters"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Price Range */}
                <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-2 border">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Price:</span>
                  <span className="text-sm font-medium whitespace-nowrap">
                    Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                  </span>
                  <div className="w-32">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={maxPrice}
                      step={500}
                      className="cursor-pointer"
                      data-testid="slider-price-range"
                    />
                  </div>
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 rounded-xl" data-testid="select-sort">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grid Toggle */}
              <div className="flex items-center gap-1 bg-background rounded-xl p-1 border">
                <Button
                  variant={gridView === "large" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setGridView("large")}
                  data-testid="button-grid-large"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={gridView === "small" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setGridView("small")}
                  data-testid="button-grid-small"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="lg:hidden gap-2 rounded-xl"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-show-filters-mobile"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mb-6 p-4 bg-background rounded-2xl border space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={maxPrice}
                    step={500}
                    data-testid="slider-price-range-mobile"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Rs. {priceRange[0].toLocaleString()}</span>
                    <span>Rs. {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-xl" data-testid="select-sort-mobile">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full rounded-xl" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {productsLoading ? (
            <div className={`grid gap-4 ${gridView === "large" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-3 md:grid-cols-4 lg:grid-cols-6"}`}>
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className={gridView === "large" ? "h-56" : "h-36"} />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters} className="rounded-xl" data-testid="button-clear-filters-empty">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-4 ${gridView === "large" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-3 md:grid-cols-4 lg:grid-cols-6"}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCartMutation.mutate(product.id)}
                  isAddingToCart={addToCartMutation.isPending}
                  size={gridView === "large" ? "medium" : "small"}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-12 bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Secure Payments", description: "100% Protected", color: "text-blue-600" },
              { icon: Truck, title: "Fast Delivery", description: "Nationwide", color: "text-green-600" },
              { icon: TrendingUp, title: "Best Prices", description: "Guaranteed", color: "text-purple-600" },
              { icon: HeadphonesIcon, title: "24/7 Support", description: "Always Here", color: "text-orange-600" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className={`p-2 rounded-lg bg-background ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold gradient-text">Eshaal Store</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Eshaal Store. Pakistan's trusted online marketplace.
            </p>
            <div className="flex gap-2">
              {paymentMethods.map((method) => (
                <Badge 
                  key={method.name}
                  className={`bg-gradient-to-r ${method.color} text-white border-0 text-xs`}
                >
                  {method.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  size: "small" | "medium";
}

function ProductCard({ product, onAddToCart, isAddingToCart, size }: ProductCardProps) {
  const isSmall = size === "small";
  
  return (
    <Card 
      className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-background"
      data-testid={`card-product-${product.id}`}
    >
      <div className={`relative overflow-hidden ${isSmall ? "h-32" : "h-48 md:h-56"}`}>
        <img 
          src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          data-testid={`img-product-${product.id}`}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
              <Sparkles className="w-3 h-3 mr-0.5" /> Featured
            </Badge>
          )}
          {product.compareAtPrice && (
            <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 text-[10px] px-2 py-0.5">
              {Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice)) * 100)}% OFF
            </Badge>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
              Only {product.stock} left
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            className={`bg-white/90 hover:bg-white shadow-md backdrop-blur-sm ${isSmall ? "h-7 w-7" : "h-8 w-8"} rounded-lg`}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={isSmall ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={`bg-white/90 hover:bg-white shadow-md backdrop-blur-sm ${isSmall ? "h-7 w-7" : "h-8 w-8"} rounded-lg`}
            data-testid={`button-quick-view-${product.id}`}
          >
            <Eye className={isSmall ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>

        {/* Quick Add */}
        {!isSmall && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Button
              className="w-full btn-modern rounded-lg bg-white text-primary hover:bg-white/90 shadow-lg h-9 text-sm"
              disabled={product.stock === 0 || isAddingToCart}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              data-testid={`button-quick-add-${product.id}`}
            >
              <CartIcon className="h-4 w-4 mr-1.5" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className={isSmall ? "p-2.5" : "p-4"}>
        <h3 
          className={`font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors ${isSmall ? "text-xs mb-1" : "text-sm mb-2"}`}
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </h3>
        
        {!isSmall && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
          </div>
        )}
        
        <div className="flex items-end justify-between">
          <div>
            <span 
              className={`font-bold text-primary ${isSmall ? "text-sm" : "text-lg"}`}
              data-testid={`text-product-price-${product.id}`}
            >
              Rs. {parseFloat(product.price).toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className={`text-muted-foreground line-through ml-1.5 ${isSmall ? "text-xs" : "text-sm"}`}>
                Rs. {parseFloat(product.compareAtPrice).toLocaleString()}
              </span>
            )}
          </div>
          {isSmall && (
            <Button
              size="icon"
              className="h-7 w-7 rounded-lg btn-modern"
              disabled={product.stock === 0 || isAddingToCart}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              data-testid={`button-add-cart-small-${product.id}`}
            >
              <CartIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        {!isSmall && (
          <p className={`text-muted-foreground mt-1 ${isSmall ? "text-[10px]" : "text-xs"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
