import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import type { User as UserType, CartItem, Category, StoreSettings } from "@shared/schema";
import { ShoppingCart, Search, User as UserIcon, LogOut, Menu, X, Heart, Bell, ChevronDown, Package, Settings, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  onCartToggle: () => void;
}

export default function Navigation({ onCartToggle }: NavigationProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth() as { user: UserType | null };
  const { cartItems } = useCart() as { cartItems: CartItem[] | undefined };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartItemCount = cartItems?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const storeName = storeSettings?.storeName || 'Shinara Mall';
  const storeLogo = storeSettings?.storeLogo;

  const categories = categoriesData?.slice(0, 6).map(cat => ({
    name: cat.name,
    href: `#`,
    slug: cat.slug,
  })) || [];

  return (
    <nav className="sticky top-0 z-50 glass-nav" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2 group" data-testid="logo-link">
              {storeLogo ? (
                <img 
                  src={storeLogo} 
                  alt={storeName}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-lg">{storeName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent" data-testid="logo-text">
                {storeName}
              </span>
            </a>
            
            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center space-x-1">
              {categories.map((category) => (
                <Button 
                  key={category.name}
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-lg transition-colors"
                  data-testid={`nav-category-${category.name.toLowerCase()}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-11 rounded-xl bg-muted/50 border-0 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                data-testid="input-nav-search"
              />
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden h-10 w-10 p-0 rounded-xl hover:bg-muted"
              data-testid="button-mobile-search"
            >
              <Search className="w-5 h-5" />
            </Button>
            
            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden sm:flex h-10 w-10 p-0 rounded-xl hover:bg-muted relative"
              data-testid="button-wishlist"
            >
              <Heart className="w-5 h-5" />
            </Button>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden sm:flex h-10 w-10 p-0 rounded-xl hover:bg-muted relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* Cart */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-10 px-3 rounded-xl hover:bg-muted relative group"
              onClick={onCartToggle}
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center bg-secondary text-white text-xs font-semibold rounded-full shadow-lg"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-10 px-2 rounded-xl hover:bg-muted flex items-center space-x-2"
                  data-testid="button-user-menu"
                >
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary/20"
                      data-testid="img-user-avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-foreground leading-tight" data-testid="text-user-name">
                      {user?.firstName || 'Guest'}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid="text-user-greeting">
                      Welcome back!
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-0 glass-card p-2">
                <DropdownMenuLabel className="font-normal px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  className="rounded-lg cursor-pointer" 
                  onClick={() => setLocation('/profile?tab=orders')}
                  data-testid="menu-my-orders"
                >
                  <Package className="w-4 h-4 mr-3" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="menu-wishlist">
                  <Heart className="w-4 h-4 mr-3" />
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="rounded-lg cursor-pointer" 
                  onClick={() => setLocation('/profile?tab=settings')}
                  data-testid="menu-settings"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="rounded-lg cursor-pointer" 
                  onClick={() => setLocation('/profile')}
                  data-testid="menu-profile"
                >
                  <UserIcon className="w-4 h-4 mr-3" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              className="lg:hidden h-10 w-10 p-0 rounded-xl hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 animate-slide-up" data-testid="mobile-menu">
            <div className="pt-4 border-t border-border/50">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 h-12 rounded-xl bg-muted/50 border-0"
                  data-testid="input-mobile-search"
                />
              </div>
              
              {/* Mobile Categories */}
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button 
                    key={category.name}
                    variant="outline" 
                    className="justify-start h-12 rounded-xl border-muted hover:bg-muted/50"
                    data-testid={`mobile-nav-category-${category.name.toLowerCase()}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
