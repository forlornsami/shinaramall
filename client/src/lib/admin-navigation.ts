import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  Warehouse, 
  CreditCard,
  Tag,
  Settings,
  HelpCircle,
  Shield,
  UserCog,
  MessageCircle,
  MessagesSquare,
  Wallet,
  Ticket,
  Star,
  Truck,
  PieChart,
  Building2,
  FileText
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface Permission {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  adjust?: boolean;
  manage?: boolean;
  respond?: boolean;
}

export interface Permissions {
  dashboard?: boolean;
  products?: Permission;
  categories?: Permission;
  reviews?: Permission;
  orders?: Permission;
  customers?: Permission;
  inventory?: Permission;
  suppliers?: Permission;
  purchases?: Permission;
  profitAnalytics?: Permission;
  balanceSheet?: Permission;
  payments?: Permission;
  wallets?: Permission;
  coupons?: Permission;
  users?: Permission;
  roles?: Permission;
  settings?: Permission;
  chat?: Permission;
  teamChat?: Permission;
}

export const sectionToPermissionKey: Record<string, string> = {
  overview: 'dashboard',
  products: 'products',
  categories: 'categories',
  reviews: 'reviews',
  orders: 'orders',
  customers: 'customers',
  inventory: 'inventory',
  suppliers: 'suppliers',
  purchases: 'purchases',
  'profit-analytics': 'profitAnalytics',
  'balance-sheet': 'balanceSheet',
  payments: 'payments',
  wallets: 'wallets',
  coupons: 'coupons',
  users: 'users',
  roles: 'roles',
  settings: 'settings',
  help: 'help',
  chat: 'chat',
  'team-chat': 'teamChat',
};

export const navigationSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { id: "overview", label: "Overview", icon: BarChart3, color: "from-blue-500 to-blue-600" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { id: "products", label: "Products", icon: Package, color: "from-purple-500 to-purple-600" },
      { id: "categories", label: "Categories", icon: Tag, color: "from-pink-500 to-pink-600" },
      { id: "reviews", label: "Reviews", icon: Star, color: "from-yellow-500 to-yellow-600" },
    ],
  },
  {
    title: "Sales",
    items: [
      { id: "orders", label: "Orders", icon: ShoppingBag, color: "from-orange-500 to-orange-600" },
      { id: "customers", label: "Customers", icon: Users, color: "from-green-500 to-green-600" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { id: "inventory", label: "Stock", icon: Warehouse, color: "from-cyan-500 to-cyan-600" },
      { id: "suppliers", label: "Suppliers", icon: Building2, color: "from-lime-500 to-lime-600" },
      { id: "purchases", label: "Purchases", icon: Truck, color: "from-teal-500 to-teal-600" },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "profit-analytics", label: "Profit & Analytics", icon: PieChart, color: "from-fuchsia-500 to-fuchsia-600" },
      { id: "balance-sheet", label: "Balance Sheet", icon: FileText, color: "from-indigo-500 to-indigo-600" },
      { id: "payments", label: "Payments", icon: CreditCard, color: "from-emerald-500 to-emerald-600" },
      { id: "wallets", label: "Wallets", icon: Wallet, color: "from-amber-500 to-amber-600" },
      { id: "coupons", label: "Coupons", icon: Ticket, color: "from-rose-500 to-rose-600" },
    ],
  },
  {
    title: "Communication",
    items: [
      { id: "chat", label: "Chat Support", icon: MessageCircle, color: "from-violet-500 to-violet-600" },
      { id: "team-chat", label: "Team Chat", icon: MessagesSquare, color: "from-sky-500 to-sky-600" },
    ],
  },
];

export const accessControlSection: NavSection = {
  title: "Access Control",
  items: [
    { id: "users", label: "User Management", icon: UserCog, color: "from-indigo-500 to-indigo-600" },
    { id: "roles", label: "Roles & Permissions", icon: Shield, color: "from-amber-500 to-amber-600" },
  ],
};

export const settingsSection: NavSection = {
  title: "Settings",
  items: [
    { id: "settings", label: "Settings", icon: Settings, color: "from-slate-500 to-slate-600" },
    { id: "help", label: "Help Center", icon: HelpCircle, color: "from-teal-500 to-teal-600" },
  ],
};

export const hasPermission = (permissions: Permissions | null | undefined, sectionId: string): boolean => {
  if (!permissions) return false;
  
  const permKey = sectionToPermissionKey[sectionId];
  if (!permKey) return false;
  
  const perm = permissions[permKey as keyof Permissions];
  if (typeof perm === 'boolean') return perm;
  if (typeof perm === 'object' && perm !== null) {
    return perm.view === true;
  }
  return false;
};

export const canAccessSection = (
  permissions: Permissions | null | undefined, 
  role: string, 
  sectionId: string
): boolean => {
  const isSuperAdmin = role.toLowerCase() === 'super_admin';
  if (isSuperAdmin) return true;
  if (sectionId === 'help') return true;
  return hasPermission(permissions, sectionId);
};

export const getVisibleNavigationSections = (
  permissions: Permissions | null | undefined,
  role: string
): NavSection[] => {
  return navigationSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => canAccessSection(permissions, role, item.id))
    }))
    .filter(section => section.items.length > 0);
};

export const getVisibleAccessControlItems = (
  permissions: Permissions | null | undefined,
  role: string
): NavItem[] => {
  return accessControlSection.items.filter(item => canAccessSection(permissions, role, item.id));
};

export const getVisibleSettingsItems = (
  permissions: Permissions | null | undefined,
  role: string
): NavItem[] => {
  return settingsSection.items.filter(item => canAccessSection(permissions, role, item.id));
};
