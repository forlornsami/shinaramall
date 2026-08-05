import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Search, Mail, Calendar, ShoppingBag, MapPin } from "lucide-react";
import type { User, Order, UserAddress } from "@shared/schema";

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // This would typically fetch customer data from an API
  // For now, showing the structure with mock data since we don't have a customers endpoint
  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/admin/customers', searchTerm],
    queryFn: async () => {
      // Mock data structure - in real implementation this would be an actual API call
      return [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  const [addressUserId, setAddressUserId] = useState<string | null>(null);
  const [addressCustomerName, setAddressCustomerName] = useState("");

  const { data: customerAddresses = [], isLoading: addressesLoading } = useQuery<UserAddress[]>({
    queryKey: ['/api/admin/customers', addressUserId, 'addresses'],
    queryFn: async () => {
      if (!addressUserId) return [];
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/customers/${addressUserId}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!addressUserId,
  });

  // Group orders by user — registered users by userId, guests by email/phone/name
  const customerStats = orders?.reduce((acc: any, order: any) => {
    const isGuest = !order.userId;
    const customerKey = isGuest
      ? `guest:${order.guestEmail || order.guestPhone || order.guestName || order.shippingAddress?.phone}`
      : `user:${order.userId}`;

    const displayName = isGuest
      ? (order.guestName || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim())
      : `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim();

    const displayEmail = isGuest
      ? (order.guestEmail || order.guestPhone || '—')
      : (order.userEmail || order.shippingAddress?.phone || '—');

    if (!acc[customerKey]) {
      acc[customerKey] = {
        name: displayName || 'Unknown',
        email: displayEmail,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt,
        isGuest,
        userId: isGuest ? null : order.userId,
      };
    }
    acc[customerKey].totalOrders += 1;
    acc[customerKey].totalSpent += parseFloat(order.total);
    if (new Date(order.createdAt) > new Date(acc[customerKey].lastOrderDate)) {
      acc[customerKey].lastOrderDate = order.createdAt;
    }
    return acc;
  }, {}) || {};

  const customerList = Object.values(customerStats).filter((customer: any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const openAddresses = (customer: any) => {
    setAddressCustomerName(customer.name);
    setAddressUserId(customer.userId);
  };

  return (
    <div className="space-y-6" data-testid="section-customers">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground" data-testid="text-customer-management-title">
          Customer Management
        </h2>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="card-total-customers">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary bg-opacity-10">
                <ShoppingBag className="text-primary text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-customers">
                  {customerList.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-customers">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary bg-opacity-10">
                <ShoppingBag className="text-secondary text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-customers">
                  {customerList.filter((c: any) => c.status === 'Active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-order-value">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent bg-opacity-10">
                <ShoppingBag className="text-accent text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-order-value">
                  Rs. {customerList.length > 0 ? 
                    Math.round(customerList.reduce((sum: number, c: any) => sum + (c.totalSpent / c.totalOrders), 0) / customerList.length).toLocaleString() : 
                    0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary bg-opacity-10">
                <ShoppingBag className="text-primary text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-revenue">
                  Rs. {customerList.reduce((sum: number, c: any) => sum + c.totalSpent, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card data-testid="card-customer-search">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-customers"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card data-testid="card-customers-table">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : customerList.length === 0 ? (
            <div className="p-6 text-center" data-testid="text-no-customers">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-customer">Customer</TableHead>
                  <TableHead data-testid="header-contact">Contact</TableHead>
                  <TableHead data-testid="header-orders">Orders</TableHead>
                  <TableHead data-testid="header-total-spent">Total Spent</TableHead>
                  <TableHead data-testid="header-last-order">Last Order</TableHead>
                  <TableHead data-testid="header-status">Status</TableHead>
                  <TableHead>Addresses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerList.map((customer: any, index: number) => (
                  <TableRow key={index} data-testid={`row-customer-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback data-testid={`avatar-customer-${index}`}>
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground" data-testid={`text-customer-name-${index}`}>
                            {customer.name}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-customer-id-${index}`}>
                            Customer #{index + 1}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm" data-testid={`text-customer-email-${index}`}>
                          {customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-customer-orders-${index}`}>
                      {customer.totalOrders}
                    </TableCell>
                    <TableCell data-testid={`text-customer-spent-${index}`}>
                      Rs. {customer.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm" data-testid={`text-customer-last-order-${index}`}>
                          {formatDate(customer.lastOrderDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={customer.isGuest ? 'secondary' : 'default'}
                        data-testid={`badge-customer-status-${index}`}
                      >
                        {customer.isGuest ? 'Guest' : 'Registered'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!customer.isGuest && customer.userId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => openAddresses(customer)}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          View
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Addresses Dialog */}
      <Dialog open={!!addressUserId} onOpenChange={v => !v && setAddressUserId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Saved Addresses — {addressCustomerName}
            </DialogTitle>
            <DialogDescription>
              Shipping addresses saved by this customer
            </DialogDescription>
          </DialogHeader>
          {addressesLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : customerAddresses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No saved addresses</p>
            </div>
          ) : (
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
              {customerAddresses.map((addr: UserAddress) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border ${addr.isDefault ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{addr.firstName} {addr.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    {addr.address}, {addr.city}{addr.postalCode ? ` ${addr.postalCode}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
