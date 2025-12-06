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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Power, PowerOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Product, Category } from "@shared/schema";

export default function ProductManagement() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    isActive: true,
    isFeatured: false,
  });

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

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setEditingProduct(null);
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      if (data.softDeleted) {
        toast({
          title: "Product Deactivated",
          description: "This product has order history, so it was deactivated instead of deleted.",
        });
      } else {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Toggle product status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update product status');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: variables.isActive ? "Product activated successfully" : "Product deactivated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setProductForm({
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: "",
      compareAtPrice: "",
      sku: "",
      stock: "",
      categoryId: "",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...productForm,
      price: parseFloat(productForm.price).toString(),
      compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice).toString() : undefined,
      stock: parseInt(productForm.stock),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price,
      compareAtPrice: product.compareAtPrice || "",
      sku: product.sku || "",
      stock: product.stock.toString(),
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || "",
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const filteredProducts = products?.filter((product: Product) => {
    if (selectedStatus === 'active' && !product.isActive) return false;
    if (selectedStatus === 'inactive' && product.isActive) return false;
    if (selectedStatus === 'out-of-stock' && product.stock > 0) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6" data-testid="section-products">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground" data-testid="text-product-management-title">
          Product Management
        </h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle data-testid="text-product-modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-product">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" data-testid="label-product-name">Product Name</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setProductForm({
                        ...productForm,
                        name,
                        slug: generateSlug(name),
                      });
                    }}
                    placeholder="Product name"
                    data-testid="input-product-name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug" data-testid="label-product-slug">Slug</Label>
                  <Input
                    id="slug"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    placeholder="product-slug"
                    data-testid="input-product-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription" data-testid="label-short-description">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  placeholder="Brief product description"
                  data-testid="input-short-description"
                />
              </div>

              <div>
                <Label htmlFor="description" data-testid="label-description">Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detailed product description"
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" data-testid="label-price">Price (Rs.)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-price"
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice" data-testid="label-compare-price">Compare Price (Rs.)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-compare-price"
                  />
                </div>
                <div>
                  <Label htmlFor="stock" data-testid="label-stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="0"
                    data-testid="input-stock"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku" data-testid="label-sku">SKU</Label>
                  <Input
                    id="sku"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="Product SKU"
                    data-testid="input-sku"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId" data-testid="label-category">Category</Label>
                  <Select 
                    value={productForm.categoryId} 
                    onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id} data-testid={`option-category-${category.id}`}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl" data-testid="label-image-url">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-image-url"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    data-testid="checkbox-active"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    data-testid="checkbox-featured"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-product"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  data-testid="button-save-product"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending 
                    ? 'Saving...' 
                    : editingProduct ? 'Update Product' : 'Create Product'
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card data-testid="card-product-filters">
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
                  data-testid="input-search-products"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-all-categories">All Categories</SelectItem>
                {categories?.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id} data-testid={`option-filter-category-${category.id}`}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-all-status">All Status</SelectItem>
                <SelectItem value="active" data-testid="option-active">Active</SelectItem>
                <SelectItem value="inactive" data-testid="option-inactive">Inactive</SelectItem>
                <SelectItem value="out-of-stock" data-testid="option-out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card data-testid="card-products-table">
        <CardContent className="p-0">
          {productsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-6 text-center" data-testid="text-no-products">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-product">Product</TableHead>
                  <TableHead data-testid="header-category">Category</TableHead>
                  <TableHead data-testid="header-price">Price</TableHead>
                  <TableHead data-testid="header-stock">Stock</TableHead>
                  <TableHead data-testid="header-status">Status</TableHead>
                  <TableHead data-testid="header-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => (
                  <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          data-testid={`img-product-${product.id}`}
                        />
                        <div>
                          <div className="font-medium text-foreground" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-product-sku-${product.id}`}>
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-product-category-${product.id}`}>
                      {categories?.find((c: Category) => c.id === product.categoryId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell data-testid={`text-product-price-${product.id}`}>
                      Rs. {parseFloat(product.price).toLocaleString()}
                    </TableCell>
                    <TableCell data-testid={`text-product-stock-${product.id}`}>
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.isActive ? "default" : "secondary"}
                        data-testid={`badge-product-status-${product.id}`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex items-center space-x-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                data-testid={`button-edit-${product.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit product</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStatusMutation.mutate({ 
                                  id: product.id, 
                                  isActive: !product.isActive 
                                })}
                                className={product.isActive ? "text-orange-500 hover:text-orange-600" : "text-green-500 hover:text-green-600"}
                                data-testid={`button-toggle-status-${product.id}`}
                              >
                                {product.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {product.isActive ? "Deactivate product" : "Activate product"}
                            </TooltipContent>
                          </Tooltip>
                          
                          {!product.isActive && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`button-delete-${product.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete permanently</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
