import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import StorefrontSidebar, { type StorefrontSection } from "@/components/storefront/StorefrontSidebar";
import MobileHeader from "@/components/storefront/MobileHeader";
import ProductsView from "@/components/storefront/ProductsView";
import ProductDetailsView from "@/components/storefront/ProductDetailsView";
import CategoriesView from "@/components/storefront/CategoriesView";
import CartView from "@/components/storefront/CartView";
import CartSidebar from "@/components/storefront/CartSidebar";
import OrdersView from "@/components/storefront/OrdersView";
import AccountView from "@/components/storefront/AccountView";
import HelpView from "@/components/storefront/HelpView";
import WalletView from "@/components/storefront/WalletView";
import { ChatWidget } from "@/components/storefront/ChatWidget";
import { CustomerNotificationBell } from "@/components/storefront/NotificationBell";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";

function parseSection(search: string): StorefrontSection {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  if (view && isValidSection(view)) {
    return view as StorefrontSection;
  }
  return "products";
}

function isValidSection(section: string): section is StorefrontSection {
  return [
    "products",
    "categories",
    "featured",
    "orders",
    "account",
    "cart",
    "wallet",
    "help",
  ].includes(section) || section.startsWith("category-") || section.startsWith("product-");
}

export default function Storefront() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<StorefrontSection>(() => {
    const search = window.location.search;
    return parseSection(search);
  });

  useEffect(() => {
    const checkoutRedirect = localStorage.getItem('checkoutRedirect');
    if (checkoutRedirect) {
      localStorage.removeItem('checkoutRedirect');
      setActiveSection('cart');
      setLocation('/?view=cart');
    }
  }, [setLocation]);

  const handleSectionChange = (section: StorefrontSection) => {
    setActiveSection(section);
    setLocation(`/?view=${section}`);
  };

  const seoData = useMemo(() => {
    const sectionTitles: Record<string, { title: string; description: string }> = {
      products: { title: "All Products", description: "Browse our complete collection of quality products with secure Pakistani payment options." },
      categories: { title: "Categories", description: "Explore our product categories and find exactly what you're looking for." },
      featured: { title: "Featured Products", description: "Discover our hand-picked featured products and best sellers." },
      cart: { title: "Shopping Cart", description: "Review your shopping cart and proceed to checkout." },
      orders: { title: "My Orders", description: "Track and manage your orders." },
      wallet: { title: "My Wallet", description: "Manage your wallet balance and transactions." },
      account: { title: "My Account", description: "Manage your account settings and preferences." },
      help: { title: "Help & Support", description: "Get help and support for your shopping experience." },
    };

    if (activeSection.startsWith("category-")) {
      return { title: "Category Products", description: "Browse products in this category." };
    }
    if (activeSection.startsWith("product-")) {
      return null;
    }
    return sectionTitles[activeSection] || sectionTitles.products;
  }, [activeSection]);

  const renderContent = () => {
    if (activeSection.startsWith("product-")) {
      const productId = activeSection.replace("product-", "");
      return (
        <ProductDetailsView 
          productId={productId} 
          onBack={() => handleSectionChange("products")} 
        />
      );
    }

    if (activeSection.startsWith("category-")) {
      const categoryId = activeSection.replace("category-", "");
      return <ProductsView categoryId={categoryId} onProductSelect={handleSectionChange} />;
    }

    switch (activeSection) {
      case "products":
        return <ProductsView onProductSelect={handleSectionChange} />;
      case "categories":
        return <CategoriesView onCategorySelect={handleSectionChange} />;
      case "featured":
        return <ProductsView featuredOnly title="Featured Products" onProductSelect={handleSectionChange} />;
      case "cart":
        return <CartView />;
      case "orders":
        return <OrdersView />;
      case "wallet":
        return <WalletView />;
      case "account":
        return <AccountView />;
      case "help":
        return <HelpView />;
      default:
        return <ProductsView onProductSelect={handleSectionChange} />;
    }
  };

  return (
    <CartProvider>
      <WishlistProvider>
        {seoData && (
          <SEO 
            title={seoData.title} 
            description={seoData.description}
            url={typeof window !== 'undefined' ? window.location.href : undefined}
          />
        )}
        <StorefrontLayout
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          renderContent={renderContent}
        />
      </WishlistProvider>
    </CartProvider>
  );
}

// Inner component so useCart works (must be inside CartProvider)
function StorefrontLayout({
  activeSection,
  onSectionChange,
  renderContent,
}: {
  activeSection: string;
  onSectionChange: (s: any) => void;
  renderContent: () => React.ReactNode;
}) {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: storeSettings } = useQuery<any>({ queryKey: ["/api/store-settings"] });
  const showCartSidebar = activeSection !== "cart" && itemCount > 0;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      <StorefrontSidebar
        activeSection={activeSection as any}
        onSectionChange={onSectionChange}
      />

      <MobileHeader
        activeSection={activeSection as any}
        onSectionChange={onSectionChange}
      />

      {/* Desktop top bar — hidden on mobile (MobileHeader handles that) */}
      <div className={`hidden lg:flex fixed top-0 z-40 items-center gap-2 px-6 py-3 transition-all ${showCartSidebar ? "right-72" : "right-0"}`} style={{ left: '18rem' }}>
        <div className="flex-1" />
        {isAuthenticated && user ? (
          <>
            <CustomerNotificationBell />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 overflow-hidden">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.firstName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-xs">
                    {(user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer'}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={handleLogout}
              title="Sign out"
              data-testid="topbar-signout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="rounded-xl btn-modern"
            onClick={() => { window.location.href = '/auth'; }}
            data-testid="topbar-signin"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>

      <main className={`lg:ml-72 pt-16 lg:pt-14 min-h-screen transition-all flex flex-col ${showCartSidebar ? "lg:mr-72" : ""}`}>
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
        <footer className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 mt-4 border-t border-border/40">
          <div className="flex justify-center gap-5 mb-3">
            {/* Facebook */}
            <a
              href={storeSettings?.socialFacebook || "https://www.facebook.com/shinaramall"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted-foreground transition-colors hover:text-[#1877F2]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
            </a>
            {/* Instagram */}
            <a
              href={storeSettings?.socialInstagram || "https://www.instagram.com/shinaramall"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-[#E1306C]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
            </a>
            {/* LinkedIn */}
            <a
              href={storeSettings?.socialLinkedin || "https://www.linkedin.com/company/shinaramall"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground transition-colors hover:text-[#0A66C2]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            </a>
            {/* TikTok */}
            <a
              href={storeSettings?.socialTiktok || "https://www.tiktok.com/@shinaramall"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-muted-foreground transition-colors hover:text-[#010101]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
            </a>
            {/* YouTube */}
            <a
              href={storeSettings?.socialYoutube || "https://www.youtube.com/@shinaramall"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground transition-colors hover:text-[#FF0000]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {storeSettings?.storeName || "Shinara Mall"}. All rights reserved.
          </p>
        </footer>
      </main>

      {showCartSidebar && (
        <CartSidebar onGoToCart={() => onSectionChange("cart")} />
      )}

      <ChatWidget />
    </div>
  );
}
