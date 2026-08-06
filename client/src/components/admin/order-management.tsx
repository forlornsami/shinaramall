import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getProductThumbnail } from "@/lib/utils";
import { Eye, Package, Truck, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, X, AlertTriangle, Pencil, Copy, Check, Printer } from "lucide-react";
import type { Order, OrderItem, Product, StoreSettings } from "@shared/schema";
import { printOrders, type PrintOrderData } from "@/lib/print-order";

type SortField = 'orderNumber' | 'customer' | 'amount' | 'status' | 'paymentStatus' | 'date';
type SortDirection = 'asc' | 'desc';

export default function OrderManagement() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Cancel order dialog states
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [refundFullToWallet, setRefundFullToWallet] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Update dialog states
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    paymentStatus: "",
    trackingNumber: "",
  });

  // Print / bulk-select states
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === filteredAndSortedOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredAndSortedOrders.map((o: Order) => o.id)));
    }
  };

  const buildPrintData = (order: Order): PrintOrderData => ({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt as string,
    status: order.status,
    paymentMethod: order.paymentMethod || '',
    paymentStatus: order.paymentStatus,
    trackingNumber: (order as any).trackingNumber,
    customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim()
      || (order as any).guestName || 'N/A',
    phone: order.shippingAddress?.phone || (order as any).guestPhone || '',
    email: (order as any).guestEmail,
    address: order.shippingAddress?.address || '',
    city: order.shippingAddress?.city || '',
    postalCode: order.shippingAddress?.postalCode,
    total: parseFloat(order.total as any),
  });

  const handlePrintSelected = () => {
    const toPrint = filteredAndSortedOrders
      .filter((o: Order) => selectedOrderIds.has(o.id))
      .map((o: Order) => buildPrintData(o));
    if (toPrint.length) printOrders(toPrint, storeSettings?.storeName);
  };

  const handlePrintSingle = () => {
    if (!orderDetails) return;
    const data: PrintOrderData = {
      orderNumber: orderDetails.orderNumber,
      createdAt: orderDetails.createdAt as string,
      status: orderDetails.status,
      paymentMethod: orderDetails.paymentMethod || '',
      paymentStatus: orderDetails.paymentStatus,
      trackingNumber: (orderDetails as any).trackingNumber,
      customerName: `${orderDetails.shippingAddress?.firstName || ''} ${orderDetails.shippingAddress?.lastName || ''}`.trim()
        || (orderDetails as any).guestName || 'N/A',
      phone: orderDetails.shippingAddress?.phone || (orderDetails as any).guestPhone || '',
      email: (orderDetails as any).guestEmail,
      address: orderDetails.shippingAddress?.address || '',
      city: orderDetails.shippingAddress?.city || '',
      postalCode: orderDetails.shippingAddress?.postalCode,
      subtotal: parseFloat(orderDetails.subtotal as any),
      shippingCost: parseFloat(orderDetails.shippingCost as any),
      total: parseFloat(orderDetails.total as any),
      items: orderDetails.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown',
        sku: item.product?.sku,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total),
      })),
    };
    printOrders([data], storeSettings?.storeName);
  };
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Fetch store settings
  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
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

  // Fetch order details
  const { data: orderDetails } = useQuery({
    queryKey: ['/api/admin/orders', selectedOrder?.id],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/orders/${selectedOrder?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      return response.json();
    },
    enabled: !!selectedOrder?.id,
  });

  // Update order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, paymentStatus, refundFullToWallet, trackingNumber }: { 
      orderId: string; 
      status?: string; 
      paymentStatus?: string;
      refundFullToWallet?: boolean;
      trackingNumber?: string;
    }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, paymentStatus, refundFullToWallet, trackingNumber }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders', selectedOrder?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallets'] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      // Close cancel dialog if open
      setIsCancelDialogOpen(false);
      setOrderToCancel(null);
      setRefundFullToWallet(false);
      setIsUpdateDialogOpen(false);
      setOrderToUpdate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });
  
  // Open the per-row update form
  const handleOpenUpdateDialog = (order: Order) => {
    setOrderToUpdate(order);
    setUpdateForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: (order as any).trackingNumber || "",
    });
    setIsUpdateDialogOpen(true);
  };

  // Submit the update form
  const handleSubmitUpdate = () => {
    if (!orderToUpdate) return;
    if (updateForm.status === 'cancelled') {
      // Route through cancel confirmation
      setOrderToCancel(orderToUpdate);
      setRefundFullToWallet(false);
      setIsUpdateDialogOpen(false);
      setIsCancelDialogOpen(true);
      return;
    }
    updateOrderMutation.mutate({
      orderId: orderToUpdate.id,
      status: updateForm.status || undefined,
      paymentStatus: updateForm.paymentStatus || undefined,
      trackingNumber: updateForm.trackingNumber,
    });
  };
  
  // Confirm cancellation
  const handleConfirmCancel = () => {
    if (orderToCancel) {
      updateOrderMutation.mutate({
        orderId: orderToCancel.id,
        status: 'cancelled',
        refundFullToWallet,
      });
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders.filter((order: Order) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const customerName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.toLowerCase();
        const orderNum = order.orderNumber?.toLowerCase() || '';
        if (!customerName.includes(query) && !orderNum.includes(query)) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }
      
      // Payment status filter
      if (paymentStatusFilter !== "all" && order.paymentStatus !== paymentStatusFilter) {
        return false;
      }
      
      // Payment method filter
      if (paymentMethodFilter !== "all" && order.paymentMethod !== paymentMethodFilter) {
        return false;
      }
      
      // Date range filter
      if (dateFrom && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(dateFrom);
        if (orderDate < fromDate) return false;
      }
      
      if (dateTo && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }
      
      return true;
    });
    
    // Sort
    filtered.sort((a: Order, b: Order) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'orderNumber':
          comparison = (a.orderNumber || '').localeCompare(b.orderNumber || '');
          break;
        case 'customer':
          const nameA = `${a.shippingAddress?.firstName || ''} ${a.shippingAddress?.lastName || ''}`;
          const nameB = `${b.shippingAddress?.firstName || ''} ${b.shippingAddress?.lastName || ''}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'amount':
          comparison = parseFloat(a.total) - parseFloat(b.total);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'paymentStatus':
          comparison = (a.paymentStatus || '').localeCompare(b.paymentStatus || '');
          break;
        case 'date':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [orders, searchQuery, statusFilter, paymentStatusFilter, paymentMethodFilter, dateFrom, dateTo, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setPaymentMethodFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || paymentStatusFilter !== "all" || paymentMethodFilter !== "all" || dateFrom || dateTo;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Paid';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6" data-testid="section-orders">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground" data-testid="text-order-management-title">
          Order Management
        </h2>
      </div>

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order # or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-orders"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger data-testid="select-payment-status-filter">
                  <SelectValue placeholder="All Payment Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger data-testid="select-payment-method-filter">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="hbl_bank">HBL Bank</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedOrders.length} of {orders?.length || 0} orders
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card data-testid="card-orders-table">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>All Orders</CardTitle>
            {selectedOrderIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintSelected}
                className="flex items-center gap-2 rounded-xl"
                data-testid="button-print-selected"
              >
                <Printer className="h-4 w-4" />
                Print Selected ({selectedOrderIds.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : !filteredAndSortedOrders || filteredAndSortedOrders.length === 0 ? (
            <div className="p-6 text-center" data-testid="text-no-orders">
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No orders match your filters" : "No orders found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredAndSortedOrders.length > 0 && selectedOrderIds.size === filteredAndSortedOrders.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all orders"
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('orderNumber')}
                      data-testid="header-order-number"
                    >
                      <div className="flex items-center">
                        Order Number
                        <SortIcon field="orderNumber" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('customer')}
                      data-testid="header-customer"
                    >
                      <div className="flex items-center">
                        Customer
                        <SortIcon field="customer" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('amount')}
                      data-testid="header-amount"
                    >
                      <div className="flex items-center">
                        Amount
                        <SortIcon field="amount" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('status')}
                      data-testid="header-status"
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('paymentStatus')}
                      data-testid="header-payment"
                    >
                      <div className="flex items-center">
                        Payment
                        <SortIcon field="paymentStatus" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort('date')}
                      data-testid="header-date"
                    >
                      <div className="flex items-center">
                        Date
                        <SortIcon field="date" />
                      </div>
                    </TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedOrders.map((order: Order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={selectedOrderIds.has(order.id)}
                          onCheckedChange={() => toggleSelectOrder(order.id)}
                          aria-label={`Select order ${order.orderNumber}`}
                          data-testid={`checkbox-order-${order.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-order-number-${order.id}`}>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell data-testid={`text-order-customer-${order.id}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span>
                          {!(order as any).userId && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200" data-testid={`badge-guest-${order.id}`}>
                              Guest
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-order-amount-${order.id}`}>
                        Rs. {parseFloat(order.total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          {(order as any).trackingNumber && (
                            <span className="text-xs text-muted-foreground font-mono">
                              # {(order as any).trackingNumber}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getPaymentStatusColor(order.paymentStatus)} data-testid={`badge-payment-status-${order.id}`}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </Badge>
                          <div className="text-xs text-muted-foreground" data-testid={`text-payment-method-${order.id}`}>
                            {order.paymentMethod?.toUpperCase()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-order-date-${order.id}`}>
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            data-testid={`button-view-order-${order.id}`}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(order)}
                            data-testid={`button-update-order-${order.id}`}
                            title="Update order"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-order-details-title">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {orderDetails && (
            <div>
            <div className="flex justify-end pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintSingle}
                className="flex items-center gap-2 rounded-xl"
                data-testid="button-print-order"
              >
                <Printer className="h-4 w-4" />
                Print Slip
              </Button>
            </div>
            <div className="space-y-6" data-testid="order-details-content">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Number:</span>
                      <span className="font-medium" data-testid="text-detail-order-number">
                        {orderDetails.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(orderDetails.status)} data-testid="badge-detail-status">
                        {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge className={getPaymentStatusColor(orderDetails.paymentStatus)} data-testid="badge-detail-payment">
                        {getPaymentStatusLabel(orderDetails.paymentStatus)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium" data-testid="text-detail-payment-method">
                        {orderDetails.paymentMethod?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="font-medium" data-testid="text-detail-order-date">
                        {formatDate(orderDetails.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Shipping Address
                      {!(orderDetails as any).userId && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200" data-testid="badge-detail-guest">
                          Guest Order
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent data-testid="shipping-address-content">
                    {!(orderDetails as any).userId && ((orderDetails as any).guestName) && (
                      <div className="mb-3 pb-3 border-b space-y-1">
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Guest Info</div>
                        <div className="font-medium" data-testid="text-detail-guest-name">{(orderDetails as any).guestName}</div>
                        {(orderDetails as any).guestPhone && (
                          <div className="text-sm text-muted-foreground" data-testid="text-detail-guest-phone">📞 {(orderDetails as any).guestPhone}</div>
                        )}
                        {(orderDetails as any).guestEmail && (
                          <div className="text-sm text-muted-foreground" data-testid="text-detail-guest-email">✉ {(orderDetails as any).guestEmail}</div>
                        )}
                      </div>
                    )}
                    {orderDetails.shippingAddress && (
                      <div className="space-y-1">
                        <div className="font-medium" data-testid="text-shipping-name">
                          {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid="text-shipping-address">
                          {orderDetails.shippingAddress.address}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid="text-shipping-city">
                          {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}
                        </div>
                        <div className="text-sm text-muted-foreground" data-testid="text-shipping-phone">
                          Phone: {orderDetails.shippingAddress.phone}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items?.map((item: OrderItem & { product: Product }) => (
                        <TableRow key={item.id} data-testid={`row-order-item-${item.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={getProductThumbnail(item.product, storeSettings?.defaultProductImage)}
                                alt={`${item.product.name} - Order item`}
                                loading="lazy"
                                className="w-12 h-12 object-cover rounded"
                                data-testid={`img-order-item-${item.id}`}
                              />
                              <div>
                                <div className="font-medium" data-testid={`text-item-name-${item.id}`}>
                                  {item.product.name}
                                </div>
                                <div className="text-sm text-muted-foreground" data-testid={`text-item-sku-${item.id}`}>
                                  SKU: {item.product.sku || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-item-price-${item.id}`}>
                            Rs. {parseFloat(item.price).toLocaleString()}
                          </TableCell>
                          <TableCell data-testid={`text-item-quantity-${item.id}`}>
                            {item.quantity}
                          </TableCell>
                          <TableCell data-testid={`text-item-total-${item.id}`}>
                            Rs. {parseFloat(item.total).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Order Total */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span data-testid="text-detail-subtotal">
                        Rs. {parseFloat(orderDetails.subtotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span data-testid="text-detail-shipping">
                        Rs. {parseFloat(orderDetails.shippingCost).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span data-testid="text-detail-total">
                        Rs. {parseFloat(orderDetails.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Update Order — {orderToUpdate?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Change the order status or assign a tracking number. Payment status is managed in the Payments module.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Order Status */}
            <div className="space-y-2">
              <Label htmlFor="update-status">Order Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(v) => setUpdateForm({ ...updateForm, status: v })}
              >
                <SelectTrigger id="update-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancel Order…</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div className="space-y-2">
              <Label htmlFor="update-tracking">
                Tracking Number
                <span className="ml-1 text-xs text-muted-foreground">(visible to customer)</span>
              </Label>
              <Input
                id="update-tracking"
                placeholder="e.g. TCS-123456789"
                value={updateForm.trackingNumber}
                onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Registered customers can see this in their order portal. Set when shipping.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setIsUpdateDialogOpen(false); setOrderToUpdate(null); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{orderToCancel?.orderNumber}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Order summary */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-medium">Rs. {orderToCancel ? parseFloat(orderToCancel.total).toLocaleString() : 0}</span>
              </div>
              {orderToCancel?.walletAmountUsed && parseFloat(orderToCancel.walletAmountUsed) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Used:</span>
                  <span className="font-medium text-green-600">Rs. {parseFloat(orderToCancel.walletAmountUsed).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">{orderToCancel?.paymentMethod?.toUpperCase()}</span>
              </div>
            </div>

            {/* Refund option - only show if there's a bank payment portion */}
            {orderToCancel && orderToCancel.paymentMethod !== 'wallet' && orderToCancel.paymentMethod !== 'cod' && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="refundFullToWallet"
                    checked={refundFullToWallet}
                    onCheckedChange={(checked) => setRefundFullToWallet(checked === true)}
                    data-testid="checkbox-refund-to-wallet"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="refundFullToWallet" className="font-medium cursor-pointer">
                      Refund full amount to wallet
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Credit Rs. {parseFloat(orderToCancel.total).toLocaleString()} to customer's wallet instead of manual bank refund.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info about automatic wallet refund */}
            {orderToCancel?.walletAmountUsed && parseFloat(orderToCancel.walletAmountUsed) > 0 && !refundFullToWallet && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Wallet amount (Rs. {parseFloat(orderToCancel.walletAmountUsed).toLocaleString()}) will be automatically refunded.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setOrderToCancel(null);
                setRefundFullToWallet(false);
              }}
              data-testid="button-cancel-dialog-close"
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={updateOrderMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {updateOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
