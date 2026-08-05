import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { CustomerNotificationBell } from "./NotificationBell";
import type { Category, StoreSettings } from "@shared/schema";
import {
  Package,
  Grid3X3,
  Sparkles,
  ShoppingCart,
  ClipboardList,
  User,
  HelpCircle,
  ChevronRight,
  LogIn,
  LogOut,
  Tag,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export type StorefrontSection = 
  | "products" 
  | "categories" 
  | "featured" 
  | "orders" 
  | "account" 
  | "cart" 
  | "wallet"
  | "help"
  | `category-${string}`
  | `product-${string}`;

interface StorefrontSidebarProps {
  activeSection: StorefrontSection;
  onSectionChange: (section: StorefrontSection) => void;
}

const mainNavItems = [
  {
    id: "products" as StorefrontSection,
    label: "All Products",
    icon: Package,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "categories" as StorefrontSection,
    label: "Categories",
    icon: Grid3X3,
    color: "from-purple-500 to-purple-600",
    hasSubmenu: true,
  },
  {
    id: "featured" as StorefrontSection,
    label: "Featured",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
  },
];

const accountNavItems = [
  {
    id: "orders" as StorefrontSection,
    label: "My Orders",
    icon: ClipboardList,
    color: "from-green-500 to-emerald-600",
    requiresAuth: true,
  },
  {
    id: "wallet" as StorefrontSection,
    label: "My Wallet",
    icon: Wallet,
    color: "from-amber-500 to-yellow-600",
    requiresAuth: true,
  },
  {
    id: "account" as StorefrontSection,
    label: "My Account",
    icon: User,
    color: "from-indigo-500 to-violet-600",
    requiresAuth: true,
  },
  {
    id: "cart" as StorefrontSection,
    label: "Cart",
    icon: ShoppingCart,
    color: "from-pink-500 to-rose-600",
  },
];

const helpNavItems = [
  {
    id: "help" as StorefrontSection,
    label: "Help & Support",
    icon: HelpCircle,
    color: "from-teal-500 to-cyan-600",
  },
];

export default function StorefrontSidebar({ activeSection, onSectionChange }: StorefrontSidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const { data: pendingOrdersCount } = useQuery<{ count: number }>({
    queryKey: ['/api/orders/pending-count'],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const renderNavItem = (item: typeof mainNavItems[0] & { badge?: number; requiresAuth?: boolean; hasSubmenu?: boolean }) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id || 
      (item.id === "categories" && activeSection.startsWith("category-"));
    const isDisabled = item.requiresAuth && !isAuthenticated;
    const showCartBadge = item.id === "cart" && itemCount > 0;
    const showOrdersBadge = item.id === "orders" && pendingOrdersCount && pendingOrdersCount.count > 0;
    
    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm font-medium transition-all duration-200 rounded-xl h-12 px-3 group",
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary shadow-lg"
              : isDisabled
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          onClick={() => {
            if (isDisabled) {
              handleLogin();
              return;
            }
            if (item.hasSubmenu) {
              setCategoriesExpanded(!categoriesExpanded);
              onSectionChange(item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
          data-testid={`nav-${item.id}`}
        >
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all",
            isActive 
              ? "bg-white/20" 
              : `bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100`
          )}>
            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white")} />
          </div>
          <span className="flex-1 text-left">{item.label}</span>
          {showCartBadge && (
            <Badge className="bg-destructive text-white border-0 h-5 min-w-5 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
          {showOrdersBadge && (
            <Badge className="bg-orange-500 text-white border-0 h-5 min-w-5 flex items-center justify-center text-xs">
              {pendingOrdersCount.count}
            </Badge>
          )}
          {item.hasSubmenu && (
            categoriesExpanded ? 
              <ChevronUp className="h-4 w-4 ml-2" /> : 
              <ChevronDown className="h-4 w-4 ml-2" />
          )}
          {isActive && !item.hasSubmenu && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
        
        {item.hasSubmenu && categoriesExpanded && (
          <div className="ml-12 mt-1 space-y-1 animate-in slide-in-from-top-2">
            {categoriesLoading ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-sm rounded-lg h-9 px-3",
                    activeSection === `category-${category.id}`
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => onSectionChange(`category-${category.id}` as StorefrontSection)}
                  data-testid={`nav-category-${category.slug}`}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2 px-3">No categories yet</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const storeName = storeSettings?.storeName || "Shinara Mall";
  const storeLogo = storeSettings?.storeLogo;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border hidden lg:flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <img 
              src={storeLogo} 
              alt={storeName}
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {storeName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold gradient-text" data-testid="text-store-name">
              {storeName}
            </h2>
            <p className="text-xs text-muted-foreground">Shop Authentic Products</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Shop
        </p>
        {mainNavItems.map(renderNavItem)}
        
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            My Account
          </p>
          {accountNavItems
            .filter(item => !item.requiresAuth || isAuthenticated)
            .map(renderNavItem)}
        </div>
        
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Support
          </p>
          {helpNavItems.map(renderNavItem)}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.firstName || 'User'} 
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {(user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <CustomerNotificationBell />
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start text-sm font-medium rounded-xl h-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full justify-center text-sm font-medium rounded-xl h-11 btn-modern"
            onClick={handleLogin}
            data-testid="button-login"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
