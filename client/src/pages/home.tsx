import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import ProductGrid from "@/components/product-grid";
import ShoppingCart from "@/components/shopping-cart";
import CheckoutModal from "@/components/checkout-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart as CartIcon, Smartphone, Music, University } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-welcome">
              Welcome back, {user?.firstName || 'Valued Customer'}!
            </h1>
            <p className="text-xl mb-8 text-blue-100" data-testid="text-hero-subtitle">
              Discover amazing products with secure Pakistani payment methods
            </p>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-green-600 text-secondary-foreground"
              onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-browse-products"
            >
              Browse Products <CartIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center" data-testid="text-categories-title">
            Featured Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow" data-testid="card-category-fashion">
              <CardContent className="p-6 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Pakistani textiles and clothing" 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  data-testid="img-category-fashion"
                />
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-category-fashion-title">
                  Fashion & Textiles
                </h3>
                <p className="text-muted-foreground" data-testid="text-category-fashion-description">
                  Premium Pakistani fashion and traditional wear
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow" data-testid="card-category-electronics">
              <CardContent className="p-6 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Electronics and gadgets" 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  data-testid="img-category-electronics"
                />
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-category-electronics-title">
                  Electronics
                </h3>
                <p className="text-muted-foreground" data-testid="text-category-electronics-description">
                  Latest gadgets and electronic devices
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow" data-testid="card-category-home">
              <CardContent className="p-6 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Pakistani handicrafts and home decor" 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  data-testid="img-category-home"
                />
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-category-home-title">
                  Home & Decor
                </h3>
                <p className="text-muted-foreground" data-testid="text-category-home-description">
                  Beautiful handicrafts and home essentials
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center" data-testid="text-products-title">
            Our Products
          </h2>
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
