import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Store, Smartphone, Music, University } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary" data-testid="logo-text">PakMart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                <Store className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Shop Pakistan's Best Products
            </h1>
            <p className="text-xl mb-8 text-blue-100" data-testid="text-hero-subtitle">
              Discover amazing products with secure Pakistani payment methods
            </p>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-green-600 text-secondary-foreground"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-shop-now"
            >
              Shop Now <ShoppingCart className="w-5 h-5 ml-2" />
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

      {/* Payment Methods Section */}
      <section className="py-16 bg-card">
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

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-4" data-testid="text-footer-title">PakMart</h3>
            <p className="text-muted-foreground" data-testid="text-footer-description">
              Pakistan's premier e-commerce platform
            </p>
            <div className="mt-6">
              <Button 
                variant="link" 
                onClick={() => window.location.href = '/admin/login'}
                data-testid="link-admin"
              >
                Admin Access
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
