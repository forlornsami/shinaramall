import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import ProductGrid from "@/components/product-grid";
import ShoppingCart from "@/components/shopping-cart";
import CheckoutModal from "@/components/checkout-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart as CartIcon, 
  Smartphone, 
  Sparkles,
  Star, 
  Shield, 
  Truck, 
  HeadphonesIcon,
  ArrowRight,
  Zap,
  Gift,
  CreditCard,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const trustFeatures = [
    { icon: Shield, title: "Secure Payments", description: "100% Protected" },
    { icon: Truck, title: "Fast Delivery", description: "Nationwide" },
    { icon: Gift, title: "Easy Returns", description: "7-Day Policy" },
    { icon: HeadphonesIcon, title: "24/7 Support", description: "Always Here" },
  ];

  const paymentMethods = [
    { name: "EasyPaisa", color: "from-green-500 to-emerald-600" },
    { name: "JazzCash", color: "from-red-500 to-rose-600" },
    { name: "HBL", color: "from-blue-600 to-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-hero">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in" data-testid="badge-welcome">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Pakistan's Premier Online Shopping Destination</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight animate-slide-up" data-testid="text-hero-welcome">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">{user?.firstName || 'Shopper'}</span>!
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" data-testid="text-hero-subtitle">
              Discover amazing products with <span className="text-yellow-300 font-semibold">secure Pakistani payment methods</span>. 
              Shop confidently with EasyPaisa, JazzCash & HBL.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Button 
                size="lg" 
                className="btn-modern bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg gap-3 rounded-2xl"
                onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-browse-products"
              >
                <CartIcon className="w-5 h-5" />
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-modern border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg gap-2 rounded-2xl backdrop-blur-sm"
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-explore-categories"
              >
                Explore Categories
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in">
              {trustFeatures.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="glass rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-testid={`trust-feature-${index}`}
                >
                  <feature.icon className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                  <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                  <p className="text-white/60 text-xs">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Payment Methods Banner */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="text-muted-foreground font-medium flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Secure Payments with:
            </span>
            {paymentMethods.map((method) => (
              <div 
                key={method.name}
                className={`px-6 py-2 rounded-xl bg-gradient-to-r ${method.color} text-white font-semibold shadow-lg hover:shadow-xl transition-shadow`}
                data-testid={`payment-badge-${method.name.toLowerCase()}`}
              >
                {method.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0 px-4 py-1">Shop by Category</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-categories-title">
              Featured Categories
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our wide range of products across popular categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fashion & Textiles",
                description: "Premium Pakistani fashion and traditional wear",
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                gradient: "from-pink-500/80 to-rose-600/80"
              },
              {
                title: "Electronics",
                description: "Latest gadgets and electronic devices",
                image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                gradient: "from-blue-500/80 to-indigo-600/80"
              },
              {
                title: "Home & Decor",
                description: "Beautiful handicrafts and home essentials",
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                gradient: "from-amber-500/80 to-orange-600/80"
              }
            ].map((category, index) => (
              <Card 
                key={category.title}
                className="group card-modern border-0 cursor-pointer"
                data-testid={`card-category-${index}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-testid={`img-category-${index}`}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg" data-testid={`text-category-title-${index}`}>
                        {category.title}
                      </h3>
                      <p className="text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" data-testid={`text-category-desc-${index}`}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <Badge className="mb-4 bg-secondary/10 text-secondary border-0 px-4 py-1">
                <Zap className="w-3 h-3 mr-1" />
                Hot Products
              </Badge>
              <h2 className="text-4xl font-bold text-foreground mb-2" data-testid="text-featured-title">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-lg">
                Discover our most popular items loved by customers
              </p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0 rounded-xl" data-testid="button-view-all">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <ProductGrid />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-0 px-4 py-1">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-why-title">
              The Eshaal Store Difference
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're committed to providing the best shopping experience in Pakistan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Payments",
                description: "All transactions are encrypted and secured with Pakistani payment gateways",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Nationwide delivery with real-time tracking across Pakistan",
                color: "from-green-500 to-green-600"
              },
              {
                icon: CheckCircle2,
                title: "Quality Assured",
                description: "All products are verified and quality checked before shipping",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: HeadphonesIcon,
                title: "24/7 Support",
                description: "Our team is available around the clock to assist you",
                color: "from-orange-500 to-orange-600"
              }
            ].map((feature, index) => (
              <Card 
                key={feature.title}
                className="card-modern border-0 text-center p-8 group"
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" data-testid="text-newsletter-title">
            Stay Updated
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new arrivals, and special offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
              data-testid="input-newsletter-email"
            />
            <Button className="btn-modern bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-xl" data-testid="button-subscribe">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-2xl font-bold gradient-text">Eshaal Store</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Pakistan's trusted online marketplace for quality products with secure payment options.
              </p>
              <div className="flex gap-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.name}
                    className={`px-3 py-1 rounded-lg bg-gradient-to-r ${method.color} text-white text-xs font-medium`}
                  >
                    {method.name}
                  </div>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Shop",
                links: ["All Products", "Categories", "Deals", "New Arrivals"]
              },
              {
                title: "Support",
                links: ["Help Center", "Track Order", "Returns", "Contact Us"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Privacy Policy"]
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Eshaal Store. All rights reserved. Made with ❤️ in Pakistan</p>
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
