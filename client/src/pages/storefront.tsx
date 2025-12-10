import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import StorefrontSidebar, { type StorefrontSection } from "@/components/storefront/StorefrontSidebar";
import MobileHeader from "@/components/storefront/MobileHeader";
import ProductsView from "@/components/storefront/ProductsView";
import ProductDetailsView from "@/components/storefront/ProductDetailsView";
import CategoriesView from "@/components/storefront/CategoriesView";
import CartView from "@/components/storefront/CartView";
import OrdersView from "@/components/storefront/OrdersView";
import AccountView from "@/components/storefront/AccountView";
import HelpView from "@/components/storefront/HelpView";
import { ChatWidget } from "@/components/storefront/ChatWidget";
import { CartProvider } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

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
      {seoData && (
        <SEO title={seoData.title} description={seoData.description} />
      )}
      <div className="min-h-screen bg-background">
        <StorefrontSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        
        <MobileHeader
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>

        {isAuthenticated && user && (
          <ChatWidget 
            userId={user.id} 
            userName={user.firstName || user.email || 'Customer'} 
          />
        )}
      </div>
    </CartProvider>
  );
}
