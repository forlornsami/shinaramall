import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Warehouse, 
  CreditCard,
  Tag,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Shield,
  UserCog
} from "lucide-react";

interface Permission {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  adjust?: boolean;
  manage?: boolean;
}

interface Permissions {
  dashboard?: boolean;
  products?: Permission;
  categories?: Permission;
  orders?: Permission;
  customers?: Permission;
  inventory?: Permission;
  payments?: Permission;
  users?: Permission;
  roles?: Permission;
  settings?: Permission;
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  adminUser?: { username: string; email: string; role: string; permissions?: Permissions | null } | null;
  onLogout?: () => void;
}

const hasPermission = (permissions: Permissions | null | undefined, key: string): boolean => {
  if (!permissions) return false;
  
  const perm = permissions[key as keyof Permissions];
  if (typeof perm === 'boolean') return perm;
  if (typeof perm === 'object' && perm !== null) {
    return perm.view === true;
  }
  return false;
};

const sectionToPermissionKey: Record<string, string> = {
  overview: 'dashboard',
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  customers: 'customers',
  inventory: 'inventory',
  payments: 'payments',
  users: 'users',
  roles: 'roles',
  settings: 'settings',
  help: 'help',
};

const sidebarItems = [
  {
    id: "overview",
    label: "Dashboard",
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "products",
    label: "Products", 
    icon: Package,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tag,
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    color: "from-orange-500 to-orange-600",
    badge: "3",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    color: "from-green-500 to-green-600",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    color: "from-emerald-500 to-emerald-600",
  },
];

const accessControlItems = [
  {
    id: "users",
    label: "User Management",
    icon: UserCog,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    icon: Shield,
    color: "from-amber-500 to-amber-600",
  },
];

const settingsItems = [
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "help",
    label: "Help Center",
    icon: HelpCircle,
    color: "from-teal-500 to-teal-600",
  },
];

export default function AdminSidebar({ activeSection, onSectionChange, adminUser, onLogout }: AdminSidebarProps) {
  const permissions = adminUser?.permissions;
  const isAdmin = adminUser?.role === 'admin';
  
  const canAccessSection = (sectionId: string): boolean => {
    if (isAdmin) return true;
    if (sectionId === 'help') return true;
    const permKey = sectionToPermissionKey[sectionId];
    return hasPermission(permissions, permKey);
  };

  const visibleSidebarItems = sidebarItems.filter(item => canAccessSection(item.id));
  const visibleAccessControlItems = accessControlItems.filter(item => canAccessSection(item.id));
  const visibleSettingsItems = settingsItems.filter(item => canAccessSection(item.id));

  return (
    <div className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border hidden lg:flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text" data-testid="text-admin-dashboard">
              Eshaal Store
            </h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>
        {visibleSidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm font-medium transition-all duration-200 rounded-xl h-12 px-3 group",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => onSectionChange(item.id)}
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
              {item.badge && (
                <Badge className="bg-destructive text-white border-0 h-5 min-w-5 flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          );
        })}
        
        {visibleAccessControlItems.length > 0 && (
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Access Control
          </p>
          {visibleAccessControlItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm font-medium transition-all duration-200 rounded-xl h-12 px-3 group",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => onSectionChange(item.id)}
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
                {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            );
          })}
        </div>
        )}
        
        {visibleSettingsItems.length > 0 && (
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Settings
          </p>
          {visibleSettingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm font-medium transition-all duration-200 rounded-xl h-12 px-3 group",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => onSectionChange(item.id)}
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
                {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            );
          })}
        </div>
        )}
      </nav>
      
      {/* User Profile Section */}
      {adminUser && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {adminUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{adminUser.username}</p>
              <p className="text-xs text-muted-foreground truncate">{adminUser.email}</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 text-xs capitalize">
              {adminUser.role}
            </Badge>
          </div>
          
          {onLogout && (
            <Button
              variant="outline"
              className="w-full justify-start text-sm font-medium rounded-xl h-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              onClick={onLogout}
              data-testid="sidebar-logout"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Log out
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
