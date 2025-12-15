import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Eye, Trash2, Package, ShoppingCart, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import type { Product, Supplier, Purchase } from "@shared/schema";

type PurchaseWithDetails = Purchase & { supplier?: Supplier; itemCount?: number; items?: any[] };

export default function PurchaseManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseWithDetails | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<{ productId: string; quantity: number; costPrice: string }[]>([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    shippingCost: "0",
    otherCosts: "0",
    notes: "",
    expectedDate: "",
  });

  const { data: purchases, isLoading } = useQuery<PurchaseWithDetails[]>({
    queryKey: ['/api/admin/purchases'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/purchases', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch purchases');
      return response.json();
    },
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/admin/suppliers'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { supplierId: string | null; items: any[]; shippingCost: string; otherCosts: string; notes: string; expectedDate: string | null }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create purchase');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Purchase order created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/purchases/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Purchase status updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async ({ id, receivedItems }: { id: string; receivedItems: { purchaseItemId: string; receivedQuantity: number }[] }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/purchases/${id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ receivedItems }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to receive purchase');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Purchase received and stock updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsReceiveModalOpen(false);
      setViewingPurchase(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/purchases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete purchase');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Purchase order deleted" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ supplierId: "", shippingCost: "0", otherCosts: "0", notes: "", expectedDate: "" });
    setPurchaseItems([{ productId: "", quantity: 1, costPrice: "0" }]);
  };

  const handleView = async (purchase: PurchaseWithDetails) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`/api/admin/purchases/${purchase.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const fullPurchase = await response.json();
      setViewingPurchase(fullPurchase);
      setIsViewModalOpen(true);
    }
  };

  const handleReceive = async (purchase: PurchaseWithDetails) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`/api/admin/purchases/${purchase.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const fullPurchase = await response.json();
      setViewingPurchase(fullPurchase);
      setIsReceiveModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      deleteMutation.mutate(id);
    }
  };

  const addItem = () => {
    setPurchaseItems([...purchaseItems, { productId: "", quantity: 1, costPrice: "0" }]);
  };

  const removeItem = (index: number) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPurchaseItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * parseFloat(item.costPrice || "0")), 0);
    return subtotal + parseFloat(formData.shippingCost || "0") + parseFloat(formData.otherCosts || "0");
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      ordered: { variant: "default", icon: ShoppingCart },
      received: { variant: "default", icon: CheckCircle },
      partially_received: { variant: "secondary", icon: Truck },
      cancelled: { variant: "destructive", icon: XCircle },
    };
    const { variant, icon: Icon } = styles[status] || styles.pending;
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredPurchases = purchases?.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchTerm && !p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  const stats = {
    total: purchases?.length || 0,
    pending: purchases?.filter(p => p.status === 'pending').length || 0,
    ordered: purchases?.filter(p => p.status === 'ordered').length || 0,
    received: purchases?.filter(p => p.status === 'received').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-600">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600">Ordered</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{stats.ordered}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-green-600">Received</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.received}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase Orders</CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setPurchaseItems([{ productId: "", quantity: 1, costPrice: "0" }]); }} data-testid="button-create-purchase">
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier</Label>
                    <Select value={formData.supplierId} onValueChange={(v) => setFormData({ ...formData, supplierId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Supplier</SelectItem>
                        {suppliers?.filter(s => s.isActive).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expected Date</Label>
                    <Input type="date" value={formData.expectedDate} onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Items</Label>
                  <div className="flex gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <div className="flex-1">Product</div>
                    <div className="w-20 text-center">Quantity</div>
                    <div className="w-28 text-center">Cost (Rs.)</div>
                    <div className="w-9"></div>
                  </div>
                  {purchaseItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Select value={item.productId} onValueChange={(v) => updateItem(index, 'productId', v)}>
                        <SelectTrigger className="flex-1" data-testid={`select-product-${index}`}><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products?.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-20" data-testid={`input-quantity-${index}`} />
                      <Input type="number" min="0" step="0.01" value={item.costPrice} onChange={(e) => updateItem(index, 'costPrice', e.target.value)} className="w-28" data-testid={`input-cost-${index}`} />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={purchaseItems.length === 1} data-testid={`button-remove-item-${index}`}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addItem} data-testid="button-add-item"><Plus className="h-4 w-4 mr-1" />Add Item</Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Shipping Cost</Label><Input type="number" min="0" value={formData.shippingCost} onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })} /></div>
                  <div><Label>Other Costs</Label><Input type="number" min="0" value={formData.otherCosts} onChange={(e) => setFormData({ ...formData, otherCosts: e.target.value })} /></div>
                </div>

                <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-lg font-bold">Total: Rs. {calculateTotal().toLocaleString()}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                      const validItems = purchaseItems.filter(i => i.productId && i.quantity > 0 && parseFloat(i.costPrice) >= 0);
                      if (validItems.length === 0) {
                        toast({ title: "Error", description: "Add at least one valid item", variant: "destructive" });
                        return;
                      }
                      createMutation.mutate({
                        supplierId: formData.supplierId === "none" ? null : formData.supplierId || null,
                        items: validItems,
                        shippingCost: formData.shippingCost,
                        otherCosts: formData.otherCosts,
                        notes: formData.notes,
                        expectedDate: formData.expectedDate || null,
                      });
                    }} disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Order'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search purchases..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="partially_received">Partially Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No purchase orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.purchaseNumber}</TableCell>
                    <TableCell>{purchase.supplier?.name || '-'}</TableCell>
                    <TableCell>{purchase.itemCount || 0} items</TableCell>
                    <TableCell>Rs. {parseFloat(purchase.total).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                    <TableCell>{new Date(purchase.createdAt!).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(purchase)}><Eye className="h-4 w-4" /></Button>
                        {(purchase.status === 'ordered' || purchase.status === 'partially_received') && (
                          <Button variant="ghost" size="sm" onClick={() => handleReceive(purchase)} className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                        )}
                        {purchase.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatusMutation.mutate({ id: purchase.id, status: 'ordered' })} className="text-blue-600"><Truck className="h-4 w-4" /></Button>
                        )}
                        {(purchase.status === 'pending' || purchase.status === 'ordered') && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(purchase.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Purchase Order Details</DialogTitle></DialogHeader>
          {viewingPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Order Number</Label><p className="font-medium">{viewingPurchase.purchaseNumber}</p></div>
                <div><Label className="text-muted-foreground">Supplier</Label><p className="font-medium">{viewingPurchase.supplier?.name || 'N/A'}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div>{getStatusBadge(viewingPurchase.status)}</div></div>
                <div><Label className="text-muted-foreground">Total</Label><p className="font-medium">Rs. {parseFloat(viewingPurchase.total).toLocaleString()}</p></div>
              </div>
              {viewingPurchase.items && viewingPurchase.items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPurchase.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || 'Unknown'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.receivedQuantity || 0}</TableCell>
                          <TableCell>Rs. {parseFloat(item.costPrice).toLocaleString()}</TableCell>
                          <TableCell>Rs. {parseFloat(item.total).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {viewingPurchase.notes && <div><Label className="text-muted-foreground">Notes</Label><p>{viewingPurchase.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiveModalOpen} onOpenChange={setIsReceiveModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Receive Purchase Order</DialogTitle></DialogHeader>
          {viewingPurchase && (
            <div className="space-y-4">
              <p className="text-muted-foreground">Enter the quantity received for each item. Stock will be automatically updated.</p>
              {viewingPurchase.items && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Ordered</TableHead>
                      <TableHead>Previously Received</TableHead>
                      <TableHead>Receive Now</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingPurchase.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.receivedQuantity || 0}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity - (item.receivedQuantity || 0)}
                            defaultValue={item.quantity - (item.receivedQuantity || 0)}
                            className="w-20"
                            id={`receive-${item.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReceiveModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  const receivedItems = viewingPurchase.items?.map((item: any) => {
                    const input = document.getElementById(`receive-${item.id}`) as HTMLInputElement;
                    return { purchaseItemId: item.id, receivedQuantity: parseInt(input?.value || "0") };
                  }).filter(i => i.receivedQuantity > 0) || [];
                  if (receivedItems.length > 0) {
                    receiveMutation.mutate({ id: viewingPurchase.id, receivedItems });
                  }
                }} disabled={receiveMutation.isPending}>
                  {receiveMutation.isPending ? 'Processing...' : 'Confirm Receipt'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
