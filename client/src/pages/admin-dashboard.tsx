import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/sidebar";
import ProductManagement from "@/components/admin/product-management";
import OrderManagement from "@/components/admin/order-management";
import CustomerManagement from "@/components/admin/customer-management";
import CategoryManagement from "@/components/admin/category-management";
import InventoryManagement from "@/components/admin/inventory-management";
import PaymentManagement from "@/components/admin/payment-management";
import UserManagement from "@/components/admin/user-management";
import RoleManagement from "@/components/admin/role-management";
import SettingsSection from "@/components/admin/settings";
import HelpCenterSection from "@/components/admin/help-center";
import ChatSupport from "@/components/admin/chat-support";
import TeamChat from "@/components/admin/team-chat";
import { AdminNotificationBell } from "@/components/admin/notification-bell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import type { StoreSettings } from "@shared/schema";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  Activity,
  Menu,
  X,
  Warehouse,
  CreditCard,
  Tag,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Shield,
  UserCog,
  MessageCircle,
  MessagesSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminSection = "overview" | "products" | "categories" | "orders" | "customers" | "inventory" | "payments" | "users" | "roles" | "settings" | "help" | "chat" | "team-chat";

const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: BarChart3, color: "from-blue-500 to-blue-600" },
  { id: "products", label: "Products", icon: Package, color: "from-purple-500 to-purple-600" },
  { id: "categories", label: "Categories", icon: Tag, color: "from-pink-500 to-pink-600" },
  { id: "orders", label: "Orders", icon: ShoppingBag, color: "from-orange-500 to-orange-600" },
  { id: "customers", label: "Customers", icon: Users, color: "from-green-500 to-green-600" },
  { id: "inventory", label: "Inventory", icon: Warehouse, color: "from-cyan-500 to-cyan-600" },
  { id: "payments", label: "Payments", icon: CreditCard, color: "from-emerald-500 to-emerald-600" },
  { id: "chat", label: "Chat Support", icon: MessageCircle, color: "from-violet-500 to-violet-600" },
  { id: "team-chat", label: "Team Chat", icon: MessagesSquare, color: "from-sky-500 to-sky-600" },
];

const accessControlItems = [
  { id: "users", label: "User Management", icon: UserCog, color: "from-indigo-500 to-indigo-600" },
  { id: "roles", label: "Roles & Permissions", icon: Shield, color: "from-amber-500 to-amber-600" },
];

const settingsItems = [
  { id: "settings", label: "Settings", icon: Settings, color: "from-slate-500 to-slate-600" },
  { id: "help", label: "Help Center", icon: HelpCircle, color: "from-teal-500 to-teal-600" },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [adminUser, setAdminUser] = useState<{ 
    username: string; 
    email: string; 
    role: string; 
    roleId?: string;
    profilePicture?: string | null;
    permissions?: Record<string, boolean | Record<string, boolean>> | null;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      setLocation('/admin/login');
      return;
    }
    
    setAdminUser(JSON.parse(user));
  }, [setLocation]);

  const { data: adminProfile } = useQuery<{ profilePicture?: string | null }>({
    queryKey: ['/api/admin/profile'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No token');
      const response = await fetch('/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!adminUser,
  });

  const adminUserWithProfile = adminUser ? {
    ...adminUser,
    profilePicture: adminProfile?.profilePicture || adminUser.profilePicture,
  } : null;

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!adminUser,
  });

  const { data: pendingOrdersCount } = useQuery<{ count: number }>({
    queryKey: ['/api/admin/orders/pending-count'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders/pending-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending orders count');
      return response.json();
    },
    enabled: !!adminUser,
    refetchInterval: 30000,
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setLocation('/admin/login');
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      trend: "+12%",
      trendUp: true,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: "+8%",
      trendUp: true,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      textColor: "text-green-600",
    },
    {
      title: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      trend: "+3",
      trendUp: true,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600",
    },
    {
      title: "Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      trend: "+5%",
      trendUp: true,
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-600",
    },
  ];

  const hasPermission = (section: string): boolean => {
    const role = adminUser?.role?.toLowerCase() || '';
    if (role === 'admin' || role === 'super_admin' || role.includes('admin')) return true;
    if (section === 'help') return true;
    
    const permissions = adminUser?.permissions;
    if (!permissions) return false;
    
    const sectionMap: Record<string, string> = {
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
      chat: 'chat',
    };
    
    const permKey = sectionMap[section];
    if (!permKey) return false;
    
    const perm = permissions[permKey];
    if (typeof perm === 'boolean') return perm;
    if (typeof perm === 'object' && perm !== null) {
      return (perm as Record<string, boolean>).view === true;
    }
    return false;
  };

  const renderAccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
      <p className="text-muted-foreground max-w-md">
        You don't have permission to access this section. Please contact your administrator if you believe this is a mistake.
      </p>
      <Button 
        onClick={() => setActiveSection('overview')} 
        className="mt-6"
        variant="outline"
      >
        Go to Dashboard
      </Button>
    </div>
  );

  const renderContent = () => {
    if (!hasPermission(activeSection)) {
      return renderAccessDenied();
    }

    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8" data-testid="section-overview">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <Badge className="mb-4 bg-white/20 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Admin Dashboard
                </Badge>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {adminUser?.username}!
                </h1>
                <p className="text-white/80 text-lg">
                  Here's what's happening with your store today.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Card 
                  key={stat.title} 
                  className="card-modern border-0 overflow-hidden"
                  data-testid={`card-stat-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                      <Badge 
                        variant={stat.trendUp ? "default" : "destructive"}
                        className={`${stat.trendUp ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-red-500/10 text-red-600'} border-0`}
                      >
                        {stat.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {stat.trend}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1" data-testid={`text-stat-${index}`}>
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-modern border-0 cursor-pointer group" onClick={() => setActiveSection("orders")}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Recent Orders</h3>
                    <p className="text-sm text-muted-foreground">View and manage orders</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>

              <Card className="card-modern border-0 cursor-pointer group" onClick={() => setActiveSection("inventory")}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Inventory</h3>
                    <p className="text-sm text-muted-foreground">Stock management</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>

              <Card className="card-modern border-0 cursor-pointer group" onClick={() => setActiveSection("payments")}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Payments</h3>
                    <p className="text-sm text-muted-foreground">Payment analytics</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "products":
        return <ProductManagement />;
      case "categories":
        return <CategoryManagement />;
      case "orders":
        return <OrderManagement />;
      case "customers":
        return <CustomerManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "payments":
        return <PaymentManagement />;
      case "users":
        return <UserManagement />;
      case "roles":
        return <RoleManagement />;
      case "settings":
        return <SettingsSection />;
      case "help":
        return <HelpCenterSection />;
      case "chat":
        const adminToken = localStorage.getItem('adminToken') || '';
        const storedUser = localStorage.getItem('adminUser');
        const adminId = storedUser ? JSON.parse(storedUser).id || '' : '';
        return <ChatSupport adminToken={adminToken} adminId={adminId} />;
      case "team-chat":
        const teamChatToken = localStorage.getItem('adminToken') || '';
        const teamChatStoredUser = localStorage.getItem('adminUser');
        const teamChatAdminId = teamChatStoredUser ? JSON.parse(teamChatStoredUser).id || '' : '';
        return <TeamChat adminToken={teamChatToken} adminId={teamChatAdminId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30" data-testid="admin-dashboard">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => setActiveSection(section as AdminSection)}
        adminUser={adminUserWithProfile}
        onLogout={handleLogout}
      />
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 glass-nav px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden h-10 w-10 rounded-xl"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 border-r">
                <div className="flex flex-col h-full">
                  {/* Logo Section */}
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
                          <span className="text-white font-bold text-lg">{(storeSettings?.storeName || "E").charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold gradient-text">{storeSettings?.storeName || "Eshaal Store"}</h2>
                        <p className="text-xs text-muted-foreground">Admin Panel</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Main Menu</p>
                    {sidebarItems.map((item) => {
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
                          onClick={() => {
                            setActiveSection(item.id as AdminSection);
                            setMobileMenuOpen(false);
                          }}
                          data-testid={`mobile-nav-${item.id}`}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all",
                            isActive ? "bg-white/20" : `bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100`
                          )}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.id === 'orders' && pendingOrdersCount && pendingOrdersCount.count > 0 && (
                            <Badge className="bg-destructive text-white border-0 h-5 min-w-5 flex items-center justify-center text-xs">
                              {pendingOrdersCount.count}
                            </Badge>
                          )}
                          {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
                        </Button>
                      );
                    })}
                    
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Access Control</p>
                      {accessControlItems.map((item) => {
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
                            onClick={() => {
                              setActiveSection(item.id as AdminSection);
                              setMobileMenuOpen(false);
                            }}
                            data-testid={`mobile-nav-${item.id}`}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all",
                              isActive ? "bg-white/20" : `bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100`
                            )}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="flex-1 text-left">{item.label}</span>
                            {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Settings</p>
                      {settingsItems.map((item) => {
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
                            onClick={() => {
                              setActiveSection(item.id as AdminSection);
                              setMobileMenuOpen(false);
                            }}
                            data-testid={`mobile-nav-${item.id}`}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all",
                              isActive ? "bg-white/20" : `bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100`
                            )}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="flex-1 text-left">{item.label}</span>
                            {isActive && <ChevronRight className="h-4 w-4 ml-2" />}
                          </Button>
                        );
                      })}
                    </div>
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
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-sm font-medium rounded-xl h-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        data-testid="mobile-sidebar-logout"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground capitalize">
                {activeSection === "overview" ? "Dashboard" : activeSection.replace("-", " ")}
              </h2>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <AdminNotificationBell />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
