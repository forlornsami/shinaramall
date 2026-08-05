import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { CustomerNotificationBell } from "./NotificationBell";
import type { Category, StoreSettings } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Menu,
  Package,
  Grid3X3,
  Sparkles,
  ShoppingCart,
  ClipboardList,
  User,
  HelpCircle,
  LogIn,
  LogOut,
  Tag,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { StorefrontSection } from "./StorefrontSidebar";

interface MobileHeaderProps {
  activeSection: StorefrontSection;
  onSectionChange: (section: StorefrontSection) => void;
}

const mainNavItems = [
  { id: "products" as StorefrontSection, label: "All Products", icon: Package, color: "from-blue-500 to-blue-600" },
  { id: "categories" as StorefrontSection, label: "Categories", icon: Grid3X3, color: "from-purple-500 to-purple-600", hasSubmenu: true },
  { id: "featured" as StorefrontSection, label: "Featured", icon: Sparkles, color: "from-amber-500 to-orange-500" },
];

const accountNavItems = [
  { id: "orders" as StorefrontSection, label: "My Orders", icon: ClipboardList, color: "from-green-500 to-emerald-600", requiresAuth: true },
  { id: "wallet" as StorefrontSection, label: "My Wallet", icon: Wallet, color: "from-amber-500 to-yellow-600", requiresAuth: true },
  { id: "account" as StorefrontSection, label: "My Account", icon: User, color: "from-indigo-500 to-violet-600", requiresAuth: true },
  { id: "cart" as StorefrontSection, label: "Cart", icon: ShoppingCart, color: "from-pink-500 to-rose-600" },
];

const helpNavItems = [
  { id: "help" as StorefrontSection, label: "Help & Support", icon: HelpCircle, color: "from-teal-500 to-cyan-600" },
];

export default function MobileHeader({ activeSection, onSectionChange }: MobileHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const { data: categories } = useQuery<Category[]>({
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

  const handleNavClick = (section: StorefrontSection, requiresAuth?: boolean, hasSubmenu?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      window.location.href = '/auth';
      return;
    }
    if (hasSubmenu) {
      setCategoriesExpanded(!categoriesExpanded);
    }
    onSectionChange(section);
    if (!hasSubmenu) {
      setIsOpen(false);
    }
  };

  const renderNavItem = (item: typeof mainNavItems[0] & { requiresAuth?: boolean; hasSubmenu?: boolean }) => {
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
            "w-full justify-start text-sm font-medium rounded-xl h-12 px-3",
            isActive
              ? "bg-primary text-primary-foreground"
              : isDisabled
              ? "text-muted-foreground/50"
              : "text-foreground"
          )}
          onClick={() => handleNavClick(item.id, item.requiresAuth, item.hasSubmenu)}
        >
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center mr-3",
            isActive ? "bg-white/20" : `bg-gradient-to-br ${item.color}`
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="flex-1 text-left">{item.label}</span>
          {showCartBadge && (
            <Badge className="bg-destructive text-white border-0">{itemCount}</Badge>
          )}
          {showOrdersBadge && (
            <Badge className="bg-orange-500 text-white border-0">{pendingOrdersCount.count}</Badge>
          )}
          {item.hasSubmenu && (categoriesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
        </Button>
        
        {item.hasSubmenu && categoriesExpanded && (
          <div className="ml-12 mt-1 space-y-1">
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-sm rounded-lg h-9 px-3",
                  activeSection === `category-${category.id}`
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => {
                  onSectionChange(`category-${category.id}` as StorefrontSection);
                  setIsOpen(false);
                }}
              >
                <Tag className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 lg:hidden glass-nav border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-16">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-mobile-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  {storeSettings?.storeLogo ? (
                    <img 
                      src={storeSettings.storeLogo} 
                      alt={storeSettings?.storeName || "Store"}
                      className="w-10 h-10 rounded-xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {storeSettings?.storeName?.charAt(0) || "E"}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold gradient-text">
                      {storeSettings?.storeName || "Shinara Mall"}
                    </h2>
                    <p className="text-xs text-muted-foreground">Shop Authentic Products</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                  Shop
                </p>
                {mainNavItems.map(renderNavItem)}
                
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                    My Account
                  </p>
                  {accountNavItems.map(renderNavItem)}
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
                          <img src={user.profileImageUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {(user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <CustomerNotificationBell />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl h-11 text-destructive hover:text-destructive"
                      onClick={() => { logout(); window.location.href = '/'; }}
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full btn-modern rounded-xl h-11"
                    onClick={() => window.location.href = '/auth'}
                    data-testid="button-login"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          {storeSettings?.storeLogo ? (
            <img 
              src={storeSettings.storeLogo} 
              alt={storeSettings?.storeName || "Store"}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {storeSettings?.storeName?.charAt(0) || "E"}
              </span>
            </div>
          )}
          <span className="font-bold gradient-text">
            {storeSettings?.storeName || "Shinara Mall"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl relative"
          onClick={() => {
            onSectionChange("cart");
          }}
          data-testid="button-mobile-cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-destructive text-white border-0 text-xs p-0">
              {itemCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
