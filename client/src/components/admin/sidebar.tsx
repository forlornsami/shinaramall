import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Warehouse, 
  CreditCard 
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    id: "products",
    label: "Products", 
    icon: Package,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
  },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6" data-testid="text-admin-dashboard">
          Admin Dashboard
        </h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => onSectionChange(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
