import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import ProductGrid from "@/components/product-grid";
import ShoppingCart from "@/components/shopping-cart";
import CheckoutModal from "@/components/checkout-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart as CartIcon, Smartphone, Music, University, Star, Shield, Truck, HeadphonesIcon } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-white/5 opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30" data-testid="badge-welcome">
              ✨ Welcome to Pakistan's #1 Online Store
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent" data-testid="text-hero-welcome">
              Hello, {user?.firstName || 'Valued Customer'}!
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
              Discover premium products with <span className="font-semibold text-yellow-300">secure Pakistani payment methods</span>. 
              Shop with confidence using EasyPaisa, JazzCash, and HBL Bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-secondary hover:bg-green-500 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg"
                onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-browse-products"
              >
                <CartIcon className="w-6 h-6 mr-3" />
                Start Shopping
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-explore-categories"
              >
                Explore Categories
              </Button>
            </div>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 mb-2 text-green-300" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-8 h-8 mb-2 text-blue-300" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 mb-2 text-yellow-300" />
                <span className="text-sm font-medium">Quality Products</span>
              </div>
              <div className="flex flex-col items-center">
                <HeadphonesIcon className="w-8 h-8 mb-2 text-purple-300" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section id="categories" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-categories-title">
              Shop by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of premium Pakistani products across different categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 shadow-lg" data-testid="card-category-fashion">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Pakistani textiles and clothing" 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                    data-testid="img-category-fashion"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Badge className="absolute top-4 left-4 bg-secondary text-white">Trending</Badge>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors" data-testid="text-category-fashion-title">
                    Fashion & Textiles
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-category-fashion-description">
                    Premium Pakistani fashion and traditional wear
                  </p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                    Browse Collection
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 shadow-lg" data-testid="card-category-electronics">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Electronics and gadgets" 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                    data-testid="img-category-electronics"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Badge className="absolute top-4 left-4 bg-blue-600 text-white">Latest</Badge>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors" data-testid="text-category-electronics-title">
                    Electronics
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-category-electronics-description">
                    Latest gadgets and electronic devices
                  </p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                    Browse Collection
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 shadow-lg" data-testid="card-category-home">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Pakistani handicrafts and home decor" 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                    data-testid="img-category-home"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Badge className="absolute top-4 left-4 bg-purple-600 text-white">Artisan</Badge>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors" data-testid="text-category-home-title">
                    Home & Decor
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-category-home-description">
                    Beautiful handicrafts and home essentials
                  </p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                    Browse Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section id="featured-products" className="py-20 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-products-title">
              Our Premium Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Handpicked products with guaranteed quality and authentic Pakistani craftsmanship
            </p>
          </div>
          <ProductGrid />
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center" data-testid="text-payments-title">
            Secure Pakistani Payment Methods
          </h2>
          <div className="flex justify-center items-center space-x-12">
            <div className="text-center" data-testid="card-payment-easypaisa">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold text-foreground" data-testid="text-payment-easypaisa">EasyPaisa</h3>
            </div>
            <div className="text-center" data-testid="card-payment-jazzcash">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold text-foreground" data-testid="text-payment-jazzcash">JazzCash</h3>
            </div>
            <div className="text-center" data-testid="card-payment-hbl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <University className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold text-foreground" data-testid="text-payment-hbl">HBL Bank</h3>
            </div>
          </div>
        </div>
      </section>

      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}
