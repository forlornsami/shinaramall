import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Store, 
  Smartphone, 
  Wallet, 
  CreditCard,
  Sparkles,
  Shield,
  Truck,
  HeadphonesIcon,
  ArrowRight,
  Star,
  CheckCircle2,
  Zap,
  Package,
  Users,
  TrendingUp,
  ChevronRight,
  Mail,
  MapPin,
  Phone
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your transactions are protected with bank-level security",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free shipping on orders over Rs. 5,000 across Pakistan",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Get help anytime with our dedicated support team",
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: Zap,
      title: "Quick Checkout",
      description: "Seamless checkout with Pakistani payment methods",
      color: "from-orange-500 to-amber-600",
    },
  ];

  const categories = [
    {
      name: "Fashion & Textiles",
      description: "Premium Pakistani fashion and traditional wear",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      products: "500+ Products",
    },
    {
      name: "Electronics",
      description: "Latest gadgets and electronic devices",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      products: "300+ Products",
    },
    {
      name: "Home & Decor",
      description: "Beautiful handicrafts and home essentials",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      products: "400+ Products",
    },
  ];

  const paymentMethods = [
    {
      name: "EasyPaisa",
      icon: Smartphone,
      color: "from-green-500 to-emerald-600",
      description: "Mobile wallet payments",
    },
    {
      name: "JazzCash",
      icon: Wallet,
      color: "from-red-500 to-rose-600",
      description: "Digital payments made easy",
    },
    {
      name: "HBL Bank",
      icon: CreditCard,
      color: "from-blue-600 to-indigo-700",
      description: "Secure bank transfers",
    },
  ];

  const stats = [
    { value: "50K+", label: "Happy Customers", icon: Users },
    { value: "10K+", label: "Products", icon: Package },
    { value: "99%", label: "Satisfaction Rate", icon: TrendingUp },
    { value: "24/7", label: "Customer Support", icon: HeadphonesIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text" data-testid="logo-text">PakMart</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                className="hidden sm:flex rounded-xl"
                onClick={() => window.location.href = '/admin/login'}
              >
                Admin
              </Button>
              <Button 
                className="btn-modern rounded-xl"
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Pakistan's #1 E-Commerce Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
              Shop Pakistan's{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                Best Products
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Discover amazing products with secure Pakistani payment methods. 
              Shop with confidence and get fast delivery nationwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 py-6 text-lg font-semibold shadow-2xl group"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-shop-now"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                className="bg-white/20 border-2 border-white/40 text-white hover:bg-white/30 rounded-xl px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                onClick={() => window.location.href = '/api/login'}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Products
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>Free Delivery over Rs. 5000</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>100% Authentic Products</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card relative -mt-20 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="card-modern border-0 text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Shop with Confidence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the best shopping experience with secure payments, fast delivery, and excellent customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-modern border-0 group hover:-translate-y-2 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-0">
              Browse Categories
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-categories-title">
              Featured Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of products across popular categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card 
                key={index}
                className="card-modern border-0 overflow-hidden group cursor-pointer"
                onClick={() => window.location.href = '/api/login'}
                data-testid={`card-category-${index}`}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-4 left-4 bg-white/90 text-foreground border-0">
                    {category.products}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                    <span>Browse Collection</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-24 bg-gradient-to-br from-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-0">
              <Shield className="w-3 h-3 mr-1" />
              Secure Payments
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-payments-title">
              Pakistani Payment Methods
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pay with your favorite local payment methods. All transactions are secured with bank-level encryption.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {paymentMethods.map((method, index) => (
              <Card 
                key={index}
                className="card-modern border-0 text-center group hover:-translate-y-2 transition-all duration-300"
                data-testid={`card-payment-${method.name.toLowerCase()}`}
              >
                <CardContent className="p-8">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-payment-${method.name.toLowerCase()}`}>
                    {method.name}
                  </h3>
                  <p className="text-muted-foreground">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover amazing products at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 rounded-xl px-10 py-6 text-lg font-semibold shadow-2xl"
              onClick={() => window.location.href = '/api/login'}
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white/20 border-2 border-white/40 text-white hover:bg-white/30 rounded-xl px-10 py-6 text-lg font-semibold backdrop-blur-sm"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <h3 className="text-2xl font-bold gradient-text">PakMart</h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-sm" data-testid="text-footer-description">
                Pakistan's premier e-commerce platform offering authentic products with secure local payment methods.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.9/5 Customer Rating</span>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
                <li className="hover:text-primary transition-colors cursor-pointer">FAQs</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Shipping Info</li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@pakmart.pk
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +92 300 1234567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Lahore, Pakistan
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 PakMart. All rights reserved.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/admin/login'}
              className="text-muted-foreground hover:text-foreground rounded-xl"
              data-testid="link-admin"
            >
              Admin Access
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
