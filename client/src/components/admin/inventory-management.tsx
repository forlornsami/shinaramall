import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Search, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import type { Product, Category } from "@shared/schema";

export default function InventoryManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', { search: searchTerm, categoryId: selectedCategory !== 'all' ? selectedCategory : undefined }],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      
      const response = await fetch(`/api/products?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async ({ productId, quantity, operation }: { productId: string; quantity: number; operation: string }) => {
      const token = localStorage.getItem('adminToken');
      return await apiRequest(`/api/admin/inventory/adjust/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity, operation }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory adjusted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAdjustModalOpen(false);
      setAdjustingProduct(null);
      setAdjustmentQuantity("");
      setAdjustmentReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust inventory",
        variant: "destructive",
      });
    },
  });

  const handleAdjustStock = () => {
    if (!adjustingProduct || !adjustmentQuantity) return;
    
    adjustStockMutation.mutate({
      productId: adjustingProduct.id,
      quantity: parseInt(adjustmentQuantity),
      operation: adjustmentType,
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    if (stock <= 10) return { label: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle };
    if (stock <= 50) return { label: 'In Stock', variant: 'default' as const, icon: Package };
    return { label: 'Well Stocked', variant: 'default' as const, icon: Package };
  };

  // Calculate inventory statistics
  const inventoryStats = products ? {
    totalProducts: products.length,
    outOfStock: products.filter((p: Product) => p.stock === 0).length,
    lowStock: products.filter((p: Product) => p.stock > 0 && p.stock <= 10).length,
    totalValue: products.reduce((sum: number, p: Product) => sum + (parseFloat(p.price) * p.stock), 0),
  } : { totalProducts: 0, outOfStock: 0, lowStock: 0, totalValue: 0 };

  // Filter products
  const filteredProducts = products?.filter((product: Product) => {
    if (filterType === 'out-of-stock' && product.stock > 0) return false;
    if (filterType === 'low-stock' && (product.stock === 0 || product.stock > 10)) return false;
    if (filterType === 'well-stocked' && product.stock <= 50) return false;
    return true;
  }) || [];

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-products">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">{inventoryStats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-out-of-stock">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-out-of-stock">{inventoryStats.outOfStock}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-low-stock">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-low-stock">{inventoryStats.lowStock}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-value">
              Rs. {inventoryStats.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card data-testid="card-inventory-filters">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-inventory"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-all-categories">All Categories</SelectItem>
                {categories?.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id} data-testid={`option-category-${category.id}`}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48" data-testid="select-stock-filter">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-all-stock">All Products</SelectItem>
                <SelectItem value="out-of-stock" data-testid="option-out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock" data-testid="option-low-stock">Low Stock</SelectItem>
                <SelectItem value="well-stocked" data-testid="option-well-stocked">Well Stocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card data-testid="card-inventory-table">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-product">Product</TableHead>
                  <TableHead data-testid="header-category">Category</TableHead>
                  <TableHead data-testid="header-current-stock">Current Stock</TableHead>
                  <TableHead data-testid="header-stock-status">Status</TableHead>
                  <TableHead data-testid="header-unit-price">Unit Price</TableHead>
                  <TableHead data-testid="header-stock-value">Stock Value</TableHead>
                  <TableHead data-testid="header-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const StatusIcon = stockStatus.icon;
                  return (
                    <TableRow key={product.id} data-testid={`row-inventory-${product.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            data-testid={`img-inventory-${product.id}`}
                          />
                          <div>
                            <div className="font-medium" data-testid={`text-product-name-${product.id}`}>
                              {product.name}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`text-product-sku-${product.id}`}>
                              SKU: {product.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-category-${product.id}`}>
                        {categories?.find((c: Category) => c.id === product.categoryId)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-semibold" data-testid={`text-stock-quantity-${product.id}`}>
                          {product.stock}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit" data-testid={`badge-stock-status-${product.id}`}>
                          <StatusIcon className="w-3 h-3" />
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-unit-price-${product.id}`}>
                        Rs. {parseFloat(product.price).toLocaleString()}
                      </TableCell>
                      <TableCell data-testid={`text-stock-value-${product.id}`}>
                        Rs. {(parseFloat(product.price) * product.stock).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAdjustingProduct(product);
                              setAdjustmentType("increase");
                              setIsAdjustModalOpen(true);
                            }}
                            data-testid={`button-increase-stock-${product.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAdjustingProduct(product);
                              setAdjustmentType("decrease");
                              setIsAdjustModalOpen(true);
                            }}
                            data-testid={`button-decrease-stock-${product.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent data-testid="dialog-adjust-stock">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "increase" ? "Increase" : "Decrease"} Stock - {adjustingProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock</Label>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-current-stock">
                {adjustingProduct?.stock} units
              </div>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity to {adjustmentType}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="Enter quantity"
                data-testid="input-adjustment-quantity"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g., Received new stock, Damaged goods, etc."
                data-testid="input-adjustment-reason"
              />
            </div>

            {adjustmentQuantity && (
              <div className="p-3 bg-muted rounded">
                <div className="text-sm font-medium">New Stock Level:</div>
                <div className="text-lg font-bold text-green-600" data-testid="text-new-stock-level">
                  {adjustmentType === "increase" 
                    ? (adjustingProduct?.stock || 0) + parseInt(adjustmentQuantity)
                    : Math.max(0, (adjustingProduct?.stock || 0) - parseInt(adjustmentQuantity))
                  } units
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)} data-testid="button-cancel-adjustment">
                Cancel
              </Button>
              <Button 
                onClick={handleAdjustStock} 
                disabled={!adjustmentQuantity || adjustStockMutation.isPending}
                data-testid="button-confirm-adjustment"
              >
                {adjustStockMutation.isPending ? "Adjusting..." : `${adjustmentType === "increase" ? "Increase" : "Decrease"} Stock`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}