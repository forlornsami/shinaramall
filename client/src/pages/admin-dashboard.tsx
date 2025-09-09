import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/sidebar";
import ProductManagement from "@/components/admin/product-management";
import OrderManagement from "@/components/admin/order-management";
import CustomerManagement from "@/components/admin/customer-management";
import CategoryManagement from "@/components/admin/category-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BarChart3, Package, ShoppingBag, Users, LogOut } from "lucide-react";

type AdminSection = "overview" | "products" | "categories" | "orders" | "customers" | "inventory" | "payments";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [adminUser, setAdminUser] = useState<any>(null);

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
    return <div>Loading...</div>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6" data-testid="section-overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="card-stat-orders">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-primary bg-opacity-10">
                      <ShoppingBag className="text-primary text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-stat-orders">
                        {stats?.totalOrders || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-stat-revenue">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-secondary bg-opacity-10">
                      <BarChart3 className="text-secondary text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-stat-revenue">
                        Rs. {stats?.totalRevenue?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-products">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-accent bg-opacity-10">
                      <Package className="text-accent text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-stat-products">
                        {stats?.totalProducts || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-customers">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-primary bg-opacity-10">
                      <Users className="text-primary text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Customers</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-stat-customers">
                        {stats?.totalCustomers || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-recent-orders">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  Recent orders will be displayed here...
                </div>
              </CardContent>
            </Card>
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
        return (
          <div data-testid="section-inventory">
            <h2 className="text-2xl font-bold text-foreground mb-6">Inventory Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Inventory management functionality will be implemented here...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "payments":
        return (
          <div data-testid="section-payments">
            <h2 className="text-2xl font-bold text-foreground mb-6">Payment Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Payment gateway management functionality will be implemented here...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={(section) => setActiveSection(section as AdminSection)} 
      />
      
      <div className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-section-title">
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "products" && "Product Management"}
              {activeSection === "categories" && "Category Management"}
              {activeSection === "orders" && "Order Management"}
              {activeSection === "customers" && "Customer Management"}
              {activeSection === "inventory" && "Inventory Management"}
              {activeSection === "payments" && "Payment Management"}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground" data-testid="text-admin-welcome">
                Welcome, {adminUser.username}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                data-testid="button-admin-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
