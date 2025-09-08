import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Search, User, LogOut } from "lucide-react";

interface NavigationProps {
  onCartToggle: () => void;
}

export default function Navigation({ onCartToggle }: NavigationProps) {
  const { user } = useAuth();
  const { cartItems } = useCart();

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary" data-testid="logo-text">PakMart</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-search"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onCartToggle}
              data-testid="button-cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </span>
              )}
            </Button>
            
            <div className="flex items-center space-x-2">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="img-user-avatar"
                />
              )}
              <div className="hidden sm:block">
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
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
