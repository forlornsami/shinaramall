import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import type { Order, OrderItem, Product } from "@shared/schema";

export default function OrderManagement() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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
    mutationFn: async ({ orderId, status, paymentStatus }: { 
      orderId: string; 
      status?: string; 
      paymentStatus?: string; 
    }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders', selectedOrder?.id] });
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

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

  const formatDate = (dateString: string) => {
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

      {/* Orders Table */}
      <Card data-testid="card-orders-table">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
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
          ) : !orders || orders.length === 0 ? (
            <div className="p-6 text-center" data-testid="text-no-orders">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-order-number">Order Number</TableHead>
                  <TableHead data-testid="header-customer">Customer</TableHead>
                  <TableHead data-testid="header-amount">Amount</TableHead>
                  <TableHead data-testid="header-status">Status</TableHead>
                  <TableHead data-testid="header-payment">Payment</TableHead>
                  <TableHead data-testid="header-date">Date</TableHead>
                  <TableHead data-testid="header-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-medium" data-testid={`text-order-number-${order.id}`}>
                      {order.orderNumber}
                    </TableCell>
                    <TableCell data-testid={`text-order-customer-${order.id}`}>
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </TableCell>
                    <TableCell data-testid={`text-order-amount-${order.id}`}>
                      Rs. {parseFloat(order.total).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderMutation.mutate({ orderId: order.id, status: value })}
                        >
                          <SelectTrigger className="w-32 h-8" data-testid={`select-order-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" data-testid="option-pending">Pending</SelectItem>
                            <SelectItem value="processing" data-testid="option-processing">Processing</SelectItem>
                            <SelectItem value="shipped" data-testid="option-shipped">Shipped</SelectItem>
                            <SelectItem value="delivered" data-testid="option-delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled" data-testid="option-cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)} data-testid={`badge-payment-status-${order.id}`}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                        <Select
                          value={order.paymentStatus}
                          onValueChange={(value) => updateOrderMutation.mutate({ orderId: order.id, paymentStatus: value })}
                        >
                          <SelectTrigger className="w-28 h-8" data-testid={`select-payment-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" data-testid="option-payment-pending">Pending</SelectItem>
                            <SelectItem value="processing" data-testid="option-payment-processing">Processing</SelectItem>
                            <SelectItem value="completed" data-testid="option-payment-completed">Paid</SelectItem>
                            <SelectItem value="failed" data-testid="option-payment-failed">Failed</SelectItem>
                            <SelectItem value="refunded" data-testid="option-payment-refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground" data-testid={`text-payment-method-${order.id}`}>
                          {order.paymentMethod?.toUpperCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm" data-testid={`text-order-date-${order.id}`}>
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        data-testid={`button-view-order-${order.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-order-details-title">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {orderDetails && (
            <div className="space-y-6" data-testid="order-details-content">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-6">
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
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent data-testid="shipping-address-content">
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
                                src={item.product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                                alt={item.product.name}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
