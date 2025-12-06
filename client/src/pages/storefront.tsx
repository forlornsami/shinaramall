import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import StorefrontSidebar, { type StorefrontSection } from "@/components/storefront/StorefrontSidebar";
import MobileHeader from "@/components/storefront/MobileHeader";
import ProductsView from "@/components/storefront/ProductsView";
import CategoriesView from "@/components/storefront/CategoriesView";
import CartView from "@/components/storefront/CartView";
import OrdersView from "@/components/storefront/OrdersView";
import AccountView from "@/components/storefront/AccountView";
import HelpView from "@/components/storefront/HelpView";
import { CartProvider } from "@/contexts/CartContext";

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
  ].includes(section) || section.startsWith("category-");
}

export default function Storefront() {
  const [location, setLocation] = useLocation();
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

  const renderContent = () => {
    if (activeSection.startsWith("category-")) {
      const categoryId = activeSection.replace("category-", "");
      return <ProductsView categoryId={categoryId} />;
    }

    switch (activeSection) {
      case "products":
        return <ProductsView />;
      case "categories":
        return <CategoriesView onCategorySelect={handleSectionChange} />;
      case "featured":
        return <ProductsView featuredOnly title="Featured Products" />;
      case "cart":
        return <CartView />;
      case "orders":
        return <OrdersView />;
      case "account":
        return <AccountView />;
      case "help":
        return <HelpView />;
      default:
        return <ProductsView />;
    }
  };

  return (
    <CartProvider>
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
      </div>
    </CartProvider>
  );
}
