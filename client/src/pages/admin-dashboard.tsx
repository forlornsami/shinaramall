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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  LogOut, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  Activity
} from "lucide-react";

type AdminSection = "overview" | "products" | "categories" | "orders" | "customers" | "inventory" | "payments" | "users" | "roles" | "settings" | "help";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [adminUser, setAdminUser] = useState<{ username: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      setLocation('/admin/login');
      return;
    }
    
    setAdminUser(JSON.parse(user));
  }, [setLocation]);

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

  const renderContent = () => {
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30" data-testid="admin-dashboard">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => setActiveSection(section as AdminSection)}
        adminUser={adminUser}
        onLogout={handleLogout}
      />
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 glass-nav px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground capitalize">
                {activeSection === "overview" ? "Dashboard" : activeSection.replace("-", " ")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
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
