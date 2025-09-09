import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Search, User, LogOut, Menu, Heart, Bell } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  onCartToggle: () => void;
}

export default function Navigation({ onCartToggle }: NavigationProps) {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-border shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary" data-testid="logo-text">PakMart</h1>
            
            {/* Desktop Categories */}
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                Fashion
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                Electronics
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                Home & Decor
              </Button>
            </div>
          </div>
          
          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-background/50 border-border focus:bg-background transition-colors"
                data-testid="input-search"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Wishlist button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden sm:flex relative"
              data-testid="button-wishlist"
            >
              <Heart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                0
              </span>
            </Button>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden sm:flex relative"
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* Cart button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onCartToggle}
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </span>
              )}
            </Button>
            
            {/* User profile section */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-border">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                  data-testid="img-user-avatar"
                />
              )}
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-foreground" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="hover:bg-red-50 hover:text-red-600"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                  data-testid="input-search-mobile"
                />
              </div>
              
              {/* Mobile categories */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  Fashion
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  Electronics
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  Home & Decor
                </Button>
              </div>
              
              {/* Mobile user info */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-3">
                  {user?.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover"
                      data-testid="img-user-avatar-mobile"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-foreground" data-testid="text-user-name-mobile">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid="text-user-email-mobile">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="hover:bg-red-50 hover:text-red-600"
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
