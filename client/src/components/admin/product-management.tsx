import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getProductThumbnail, getDefaultProductPlaceholder } from "@/lib/utils";
import { Plus, Edit, Trash2, Search, Power, PowerOff, Upload, X, Star, GripVertical, ImageIcon, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Product, Category, StoreSettings } from "@shared/schema";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function ProductManagement() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    sku: "",
    stock: "",
    lowStockThreshold: "",
    categoryId: "",
    imageUrls: [] as string[],
    tags: [] as string[],
    isActive: true,
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState("");

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

  // Fetch store settings for default product image
  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ['/api/store-settings'],
  });

  // Default image file input ref
  const defaultImageInputRef = useRef<HTMLInputElement>(null);
  const [isDefaultImageDragging, setIsDefaultImageDragging] = useState(false);

  // Update default product image mutation
  const updateDefaultImageMutation = useMutation({
    mutationFn: async (defaultProductImage: string | null) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ defaultProductImage }),
      });
      if (!response.ok) throw new Error('Failed to update default image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/store-settings'] });
      toast({
        title: "Success",
        description: "Default product image updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update default image",
        variant: "destructive",
      });
    },
  });

  const handleDefaultImageSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Use JPG, PNG, GIF, or WebP format.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be under 2MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      updateDefaultImageMutation.mutate(base64);
    } catch {
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    }
  }, [toast, updateDefaultImageMutation]);

  const handleDefaultImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDefaultImageDragging(true);
  }, []);

  const handleDefaultImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDefaultImageDragging(false);
  }, []);

  const handleDefaultImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDefaultImageDragging(false);
    handleDefaultImageSelect(e.dataTransfer.files);
  }, [handleDefaultImageSelect]);

  const handleRemoveDefaultImage = () => {
    updateDefaultImageMutation.mutate(null);
  };

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
    onError: () => {
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
    onError: () => {
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
    onError: () => {
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
    onError: () => {
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
      costPrice: "",
      sku: "",
      stock: "",
      lowStockThreshold: "",
      categoryId: "",
      imageUrls: [],
      tags: [],
      isActive: true,
      isFeatured: false,
    });
    setTagInput("");
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format. Use JPG, PNG, GIF, or WebP.`,
          variant: "destructive",
        });
        continue;
      }
      
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 2MB limit.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      } catch {
        toast({
          title: "Error",
          description: `Failed to read ${file.name}`,
          variant: "destructive",
        });
      }
    }

    if (newImages.length > 0) {
      setProductForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newImages],
      }));
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setProductForm(prev => {
      const newUrls = [...prev.imageUrls];
      const [removed] = newUrls.splice(index, 1);
      newUrls.unshift(removed);
      return { ...prev, imageUrls: newUrls };
    });
  };

  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setProductForm(prev => {
      const newUrls = [...prev.imageUrls];
      const [removed] = newUrls.splice(draggedIndex, 1);
      newUrls.splice(index, 0, removed);
      setDraggedIndex(index);
      return { ...prev, imageUrls: newUrls };
    });
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...productForm,
      price: parseFloat(productForm.price).toString(),
      compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice).toString() : undefined,
      costPrice: productForm.costPrice ? parseFloat(productForm.costPrice).toString() : undefined,
      stock: parseInt(productForm.stock),
      lowStockThreshold: productForm.lowStockThreshold ? parseInt(productForm.lowStockThreshold) : undefined,
      imageUrl: productForm.imageUrls[0] || null,
      imageUrls: productForm.imageUrls,
      tags: productForm.tags,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const existingImages = product.imageUrls || [];
    const primaryImage = product.imageUrl;
    
    let imageUrls = [...existingImages];
    if (primaryImage && !imageUrls.includes(primaryImage)) {
      imageUrls = [primaryImage, ...imageUrls];
    }
    
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price,
      compareAtPrice: product.compareAtPrice || "",
      costPrice: (product as any).costPrice || "",
      sku: product.sku || "",
      stock: product.stock.toString(),
      lowStockThreshold: (product as any).lowStockThreshold?.toString() || "",
      categoryId: product.categoryId || "",
      imageUrls,
      tags: (product as any).tags || [],
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setTagInput("");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle data-testid="text-product-modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-product">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    required
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
                    required
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

              <div>
                <Label htmlFor="tags" data-testid="label-tags">Tags (for SEO)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const tag = tagInput.trim().toLowerCase();
                        if (tag && !productForm.tags.includes(tag)) {
                          setProductForm({ ...productForm, tags: [...productForm.tags, tag] });
                          setTagInput("");
                        }
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                    data-testid="input-tags"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tag = tagInput.trim().toLowerCase();
                      if (tag && !productForm.tags.includes(tag)) {
                        setProductForm({ ...productForm, tags: [...productForm.tags, tag] });
                        setTagInput("");
                      }
                    }}
                    data-testid="button-add-tag"
                  >
                    Add
                  </Button>
                </div>
                {productForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {productForm.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1" data-testid={`tag-${tag}`}>
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              tags: productForm.tags.filter((_, i) => i !== index)
                            });
                          }}
                          data-testid={`button-remove-tag-${tag}`}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="price" data-testid="label-price">Selling Price (Rs.)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                    required
                    data-testid="input-price"
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice" data-testid="label-cost-price">Cost Price (Rs.)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-cost-price"
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice" data-testid="label-compare-price">Compare Price (Rs.)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    min="0"
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
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="0"
                    required
                    data-testid="input-stock"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lowStockThreshold" data-testid="label-low-stock">Low Stock Alert</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                    placeholder="Alert when stock below this"
                    data-testid="input-low-stock-threshold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label data-testid="label-images">Product Images</Label>
                
                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="dropzone-images"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    data-testid="input-file-images"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Drag & drop images here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF, WebP up to 2MB each
                  </p>
                </div>

                {/* Image Gallery */}
                {productForm.imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drag to reorder. First image is the primary thumbnail.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {productForm.imageUrls.map((url, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleImageDragStart(index)}
                          onDragOver={(e) => handleImageDragOver(e, index)}
                          onDragEnd={handleImageDragEnd}
                          className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                            index === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          } ${draggedIndex === index ? 'opacity-50' : ''}`}
                          data-testid={`image-preview-${index}`}
                        >
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Primary Badge */}
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Primary
                            </div>
                          )}

                          {/* Drag Handle */}
                          <div className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Actions Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index !== 0 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrimaryImage(index);
                                }}
                                className="h-8"
                                data-testid={`button-set-primary-${index}`}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Set Primary
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="h-8"
                              data-testid={`button-remove-image-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                    data-testid="checkbox-active"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                    data-testid="checkbox-featured"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
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

      {/* Default Product Image Settings */}
      <Card data-testid="card-default-product-image">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Default Product Image</CardTitle>
          </div>
          <CardDescription>
            This image will be shown for products that don't have any images uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-shrink-0">
              <img
                src={getDefaultProductPlaceholder(storeSettings?.defaultProductImage)}
                alt="Default product"
                className="w-24 h-24 object-cover rounded-lg border"
                data-testid="img-default-product"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                  isDefaultImageDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDefaultImageDragOver}
                onDragLeave={handleDefaultImageDragLeave}
                onDrop={handleDefaultImageDrop}
                onClick={() => defaultImageInputRef.current?.click()}
                data-testid="dropzone-default-image"
              >
                <input
                  ref={defaultImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleDefaultImageSelect(e.target.files)}
                  data-testid="input-default-image-file"
                />
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {storeSettings?.defaultProductImage ? 'Change default image' : 'Upload default image'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF, WebP (max 2MB)
                </p>
              </div>
              {storeSettings?.defaultProductImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveDefaultImage}
                  disabled={updateDefaultImageMutation.isPending}
                  data-testid="button-remove-default-image"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove Default Image
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card data-testid="card-product-filters">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
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
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-category">
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
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
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
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-product">Product</TableHead>
                    <TableHead className="hidden md:table-cell" data-testid="header-category">Category</TableHead>
                    <TableHead data-testid="header-price">Price</TableHead>
                    <TableHead className="hidden sm:table-cell" data-testid="header-stock">Stock</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: Product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <img
                              src={getProductThumbnail(product, storeSettings?.defaultProductImage)}
                              alt={`${product.name} - Product thumbnail`}
                              loading="lazy"
                              className="w-full h-full object-cover rounded"
                              data-testid={`img-product-${product.id}`}
                            />
                            {product.imageUrls && product.imageUrls.length > 1 && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                +{product.imageUrls.length - 1}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate max-w-[150px] sm:max-w-none" data-testid={`text-product-name-${product.id}`}>
                              {product.name}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`text-product-sku-${product.id}`}>
                              SKU: {product.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell" data-testid={`text-product-category-${product.id}`}>
                        {categories?.find((c: Category) => c.id === product.categoryId)?.name || 'Uncategorized'}
                      </TableCell>
                      <TableCell data-testid={`text-product-price-${product.id}`}>
                        <div className="flex flex-col">
                          <span className="font-medium">Rs. {parseFloat(product.price).toLocaleString()}</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              Rs. {parseFloat(product.compareAtPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell" data-testid={`text-product-stock-${product.id}`}>
                        <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                          {product.stock > 0 ? product.stock : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-product-status-${product.id}`}>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(product)}
                                  data-testid={`button-edit-product-${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit product</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleStatusMutation.mutate({ id: product.id, isActive: !product.isActive })}
                                  data-testid={`button-toggle-status-${product.id}`}
                                >
                                  {product.isActive ? (
                                    <PowerOff className="h-4 w-4 text-yellow-600" />
                                  ) : (
                                    <Power className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {product.isActive ? 'Deactivate' : 'Activate'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(product.id)}
                                  data-testid={`button-delete-product-${product.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete product</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
    </div>
  );
}
