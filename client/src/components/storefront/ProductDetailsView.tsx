import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { getDefaultProductPlaceholder } from "@/lib/utils";
import SEO from "@/components/SEO";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Package,
  Minus,
  Plus,
  ZoomIn,
  X
} from "lucide-react";
import type { Product, Category, StoreSettings } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductDetailsViewProps {
  productId: string;
  onBack: () => void;
}

export default function ProductDetailsView({ productId, onBack }: ProductDetailsViewProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const getProductImages = (product: Product): string[] => {
    const images: string[] = [];
    
    if (product.imageUrls && product.imageUrls.length > 0) {
      images.push(...product.imageUrls);
    } else if (product.imageUrl) {
      images.push(product.imageUrl);
    }
    
    if (images.length === 0) {
      images.push(getDefaultProductPlaceholder(storeSettings?.defaultProductImage));
    }
    
    return images;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (!product) return;
    const images = getProductImages(product);
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!product) return;
    const images = getProductImages(product);
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          Back to Products
        </Button>
      </div>
    );
  }

  const images = getProductImages(product);
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;
  const category = categories?.find(c => c.id === product.categoryId);

  return (
    <>
      <SEO 
        title={product.name}
        description={product.description || `Buy ${product.name} at Eshaal Store. Quality products with secure Pakistani payment options.`}
        type="product"
        image={images[0]}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        product={{
          name: product.name,
          price: product.price,
          currency: 'PKR',
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
          description: product.description || undefined,
          image: images[0],
          sku: product.id,
          category: category?.name,
        }}
      />
      <div className="space-y-6" data-testid="product-details-view">
        {/* Breadcrumb */}
        <Button 
          variant="ghost" 
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground" 
          onClick={onBack}
          data-testid="button-back-to-products"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div 
            className="relative aspect-square rounded-2xl overflow-hidden bg-muted group cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            data-testid="main-product-image"
          >
            <img
              src={images[selectedImageIndex]}
              alt={`${product.name} - Product image`}
              loading="eager"
              className="w-full h-full object-cover transition-transform duration-500"
            />
            
            {/* Zoom Icon */}
            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5" />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-destructive text-white border-0">
                  -{discountPercent}% OFF
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1} of ${images.length}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {category && (
            <Badge variant="outline" className="text-xs" data-testid="product-category">
              {category.name}
            </Badge>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground" data-testid="product-title">
            {product.name}
          </h1>

          {/* SKU */}
          {product.sku && (
            <p className="text-sm text-muted-foreground" data-testid="product-sku">
              SKU: {product.sku}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-primary" data-testid="product-price">
              Rs. {parseFloat(product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through" data-testid="product-compare-price">
                Rs. {parseFloat(product.compareAtPrice!).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-600 font-medium" data-testid="product-stock">
                  {product.stock <= 5 ? `Only ${product.stock} left in stock` : "In Stock"}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-lg text-muted-foreground" data-testid="product-short-description">
              {product.shortDescription}
            </p>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium" data-testid="quantity-value">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {isAddingToCart ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                data-testid="button-wishlist"
              >
                <Heart className="w-5 h-5" />
                <span className="sm:hidden lg:inline">Wishlist</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
                <span className="sm:hidden lg:inline">Share</span>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center gap-3">
                <Truck className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">On orders over Rs. 3,000</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">100% secure checkout</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center gap-3">
                <RotateCcw className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7-day return policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Description
            </h3>
            <div className="prose prose-sm max-w-none text-muted-foreground" data-testid="product-description">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zoom Modal */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl h-[85vh] sm:h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsZoomed(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            <img
              src={images[selectedImageIndex]}
              alt={`${product.name} - Enlarged view`}
              className="max-w-full max-h-full object-contain"
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Thumbnail Strip in Zoom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? "border-white"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
