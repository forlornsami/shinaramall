import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { useWishlistSafe } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { cn, getProductThumbnail } from "@/lib/utils";
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
import type { Category, Product, StoreSettings } from "@shared/schema";
import type { StorefrontSection } from "./StorefrontSidebar";
import {
  Search,
  Package,
  X,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  ArrowUpDown,
  ShoppingCart,
  Heart,
  Star,
} from "lucide-react";

interface ProductsViewProps {
  categoryId?: string;
  featuredOnly?: boolean;
  title?: string;
  onProductSelect?: (section: StorefrontSection) => void;
}

export default function ProductsView({ categoryId, featuredOnly, title, onProductSelect }: ProductsViewProps) {
  const { toast } = useToast();
  const { addToCart, isAddingToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId || null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [gridView, setGridView] = useState<"large" | "small">("large");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: featuredOnly ? ['/api/products/featured'] : ['/api/products'],
    queryFn: async () => {
      const url = featuredOnly ? '/api/products/featured' : '/api/products?isActive=true&limit=500';
      const response = await fetch(url);
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
    
    if (selectedCategory || categoryId) {
      const catId = selectedCategory || categoryId;
      filtered = filtered.filter(p => p.categoryId === catId);
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
  }, [allProducts, searchQuery, selectedCategory, categoryId, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(categoryId || null);
    setPriceRange([0, maxPrice]);
    setSortBy("featured");
  };

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId, 1);
    toast({
      title: "Added to Cart",
      description: `${productName} added to your cart`,
    });
  };

  const hasActiveFilters = searchQuery || (selectedCategory && !categoryId) || priceRange[0] > 0 || priceRange[1] < maxPrice;
  const currentCategory = categories?.find(c => c.id === (selectedCategory || categoryId));
  const displayTitle = title || currentCategory?.name || (featuredOnly ? "Featured Products" : "All Products");

  return (
    <div className="space-y-6">
      <div className="relative max-w-2xl">
        <div className="glass-card rounded-2xl p-2 shadow-lg border border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-search-products"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground" data-testid="text-section-title">
              {displayTitle}
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
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            {!categoryId && !featuredOnly && (
              <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
                <SelectTrigger className="w-40 rounded-xl" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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

      {showFilters && (
        <div className="lg:hidden p-4 bg-background rounded-2xl border space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {!categoryId && !featuredOnly && (
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
                <SelectTrigger className="rounded-xl" data-testid="select-category-mobile">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
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

      {productsLoading ? (
        <div className={`grid gap-4 ${gridView === "large" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
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
        <div className={`grid gap-4 ${gridView === "large" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product.id, product.name)}
              onProductClick={() => onProductSelect?.(`product-${product.id}`)}
              isAddingToCart={isAddingToCart}
              size={gridView === "large" ? "large" : "small"}
              defaultProductImage={storeSettings?.defaultProductImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onProductClick?: () => void;
  isAddingToCart: boolean;
  size: "large" | "small";
  defaultProductImage?: string | null;
}

function ProductCard({ product, onAddToCart, onProductClick, isAddingToCart, size, defaultProductImage }: ProductCardProps) {
  const { toast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlistSafe();
  const isSmall = size === "small";
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;
  const isWishlisted = isInWishlist(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted 
        ? `${product.name} removed from your wishlist`
        : `${product.name} added to your wishlist`,
    });
  };
  
  return (
    <Card 
      className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-background"
      onClick={onProductClick}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={getProductThumbnail(product, defaultProductImage)}
          alt={`${product.name} - Buy online at Eshaal Store`}
          loading="lazy"
          className={cn(
            "w-full object-cover transition-transform duration-500 group-hover:scale-110",
            isSmall ? "h-32" : "h-48"
          )}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-destructive text-white border-0 text-xs">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant={isWishlisted ? "default" : "secondary"}
            className="w-8 h-8 rounded-full shadow-lg"
            onClick={handleWishlist}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            className="w-full rounded-lg shadow-lg btn-modern"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={isAddingToCart || product.stock === 0}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
      
      <CardContent className={isSmall ? "p-3" : "p-4"}>
        <h3 className={cn(
          "font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors",
          isSmall ? "text-sm" : "text-base"
        )}>
          {product.name}
        </h3>
        
        {!isSmall && product.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.shortDescription}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <span className={cn("font-bold text-primary", isSmall ? "text-sm" : "text-lg")}>
            Rs. {parseFloat(product.price).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className={cn("text-muted-foreground line-through", isSmall ? "text-xs" : "text-sm")}>
              Rs. {parseFloat(product.compareAtPrice!).toLocaleString()}
            </span>
          )}
        </div>
        
        {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-1">Only {product.stock} left!</p>
        )}
      </CardContent>
    </Card>
  );
}
