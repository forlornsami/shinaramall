import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Tag, Percent, Calendar, Users, Package, Layers, Copy, Check } from "lucide-react";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderAmount?: string;
  maxDiscount?: string;
  scope: "all" | "category" | "product";
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

const defaultFormState = {
  code: "",
  description: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  scope: "all" as "all" | "category" | "product",
  usageLimit: "",
  usageLimitPerUser: "",
  isActive: true,
  startsAt: "",
  expiresAt: "",
  categoryIds: [] as string[],
  productIds: [] as string[],
};

export default function CouponManagement() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formState, setFormState] = useState(defaultFormState);

  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData: typeof formState) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponData.code.toUpperCase(),
          description: couponData.description || null,
          discountType: couponData.discountType,
          discountValue: couponData.discountValue,
          minOrderAmount: couponData.minOrderAmount || null,
          maxDiscount: couponData.maxDiscount || null,
          scope: couponData.scope,
          usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : null,
          usageLimitPerUser: couponData.usageLimitPerUser ? parseInt(couponData.usageLimitPerUser) : null,
          isActive: couponData.isActive,
          startsAt: couponData.startsAt || null,
          expiresAt: couponData.expiresAt || null,
          categoryIds: couponData.categoryIds,
          productIds: couponData.productIds,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create coupon");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      resetForm();
      setIsAddModalOpen(false);
      toast({ title: "Success", description: "Coupon created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formState }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: data.code.toUpperCase(),
          description: data.description || null,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderAmount: data.minOrderAmount || null,
          maxDiscount: data.maxDiscount || null,
          scope: data.scope,
          usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
          usageLimitPerUser: data.usageLimitPerUser ? parseInt(data.usageLimitPerUser) : null,
          isActive: data.isActive,
          startsAt: data.startsAt || null,
          expiresAt: data.expiresAt || null,
          categoryIds: data.categoryIds,
          productIds: data.productIds,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update coupon");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      resetForm();
      setEditingCoupon(null);
      setIsAddModalOpen(false);
      toast({ title: "Success", description: "Coupon updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete coupon");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Success", description: "Coupon deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update coupon");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update coupon status", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormState(defaultFormState);
  };

  const openEditModal = async (coupon: Coupon) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const couponDetails = await response.json();
      setEditingCoupon(coupon);
      setFormState({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || "",
        maxDiscount: coupon.maxDiscount || "",
        scope: coupon.scope,
        usageLimit: coupon.usageLimit?.toString() || "",
        usageLimitPerUser: coupon.usageLimitPerUser?.toString() || "",
        isActive: coupon.isActive,
        startsAt: coupon.startsAt ? coupon.startsAt.split("T")[0] : "",
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
        categoryIds: couponDetails.categories?.map((c: any) => c.categoryId) || [],
        productIds: couponDetails.products?.map((p: any) => p.productId) || [],
      });
      setIsAddModalOpen(true);
    }
  };

  const handleSubmit = () => {
    if (!formState.code.trim()) {
      toast({ title: "Error", description: "Coupon code is required", variant: "destructive" });
      return;
    }
    if (!formState.discountValue || parseFloat(formState.discountValue) <= 0) {
      toast({ title: "Error", description: "Discount value must be greater than 0", variant: "destructive" });
      return;
    }
    if (formState.discountType === "percentage" && parseFloat(formState.discountValue) > 100) {
      toast({ title: "Error", description: "Percentage discount cannot exceed 100%", variant: "destructive" });
      return;
    }

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, data: formState });
    } else {
      createCouponMutation.mutate(formState);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: "Inactive", variant: "secondary" as const };
    
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return { label: "Scheduled", variant: "outline" as const };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { label: "Exhausted", variant: "destructive" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-coupon-title">Coupon Management</h2>
          <p className="text-muted-foreground">Create and manage discount coupons for your store</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingCoupon(null); setIsAddModalOpen(true); }} data-testid="button-add-coupon">
          <Plus className="h-4 w-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            All Coupons
          </CardTitle>
          <CardDescription>
            {coupons?.length || 0} total coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading coupons...</div>
          ) : coupons?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons yet. Create your first coupon to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons?.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded font-mono text-sm" data-testid={`text-code-${coupon.id}`}>
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(coupon.code)}
                            data-testid={`button-copy-${coupon.id}`}
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discountType === "percentage" ? (
                            <>
                              <Percent className="h-3 w-3" />
                              {coupon.discountValue}%
                            </>
                          ) : (
                            <>Rs. {coupon.discountValue}</>
                          )}
                        </div>
                        {coupon.minOrderAmount && (
                          <p className="text-xs text-muted-foreground">Min: Rs. {coupon.minOrderAmount}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {coupon.scope === "all" && <Layers className="h-3 w-3 mr-1" />}
                          {coupon.scope === "category" && <Tag className="h-3 w-3 mr-1" />}
                          {coupon.scope === "product" && <Package className="h-3 w-3 mr-1" />}
                          {coupon.scope.charAt(0).toUpperCase() + coupon.scope.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {coupon.usageCount}
                          {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: coupon.id, isActive: checked })}
                          data-testid={`switch-active-${coupon.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(coupon)} data-testid={`button-edit-${coupon.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setCouponToDelete(coupon.id); setDeleteConfirmOpen(true); }}
                            data-testid={`button-delete-${coupon.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) { setEditingCoupon(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? "Update the coupon details below" : "Fill in the details to create a new discount coupon"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formState.code}
                  onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  className="uppercase"
                  data-testid="input-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formState.discountType}
                  onValueChange={(value: "percentage" | "fixed") => setFormState({ ...formState, discountType: value })}
                >
                  <SelectTrigger data-testid="select-discount-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (Rs.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formState.discountValue}
                  onChange={(e) => setFormState({ ...formState, discountValue: e.target.value })}
                  placeholder={formState.discountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                  data-testid="input-discount-value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount (Rs.)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formState.maxDiscount}
                  onChange={(e) => setFormState({ ...formState, maxDiscount: e.target.value })}
                  placeholder="Optional max discount cap"
                  disabled={formState.discountType === "fixed"}
                  data-testid="input-max-discount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Brief description of the coupon (for internal use)"
                rows={2}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum Order Amount (Rs.)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formState.minOrderAmount}
                  onChange={(e) => setFormState({ ...formState, minOrderAmount: e.target.value })}
                  placeholder="Optional minimum order"
                  data-testid="input-min-order"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Applies To</Label>
                <Select
                  value={formState.scope}
                  onValueChange={(value: "all" | "category" | "product") => setFormState({ ...formState, scope: value, categoryIds: [], productIds: [] })}
                >
                  <SelectTrigger data-testid="select-scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="category">Specific Categories</SelectItem>
                    <SelectItem value="product">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formState.scope === "category" && categories && categories.length > 0 && (
              <div className="space-y-2">
                <Label>Select Categories</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={formState.categoryIds.includes(category.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newIds = formState.categoryIds.includes(category.id)
                          ? formState.categoryIds.filter((id) => id !== category.id)
                          : [...formState.categoryIds, category.id];
                        setFormState({ ...formState, categoryIds: newIds });
                      }}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formState.scope === "product" && products && products.length > 0 && (
              <div className="space-y-2">
                <Label>Select Products</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50 max-h-40 overflow-y-auto">
                  {products.map((product) => (
                    <Badge
                      key={product.id}
                      variant={formState.productIds.includes(product.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newIds = formState.productIds.includes(product.id)
                          ? formState.productIds.filter((id) => id !== product.id)
                          : [...formState.productIds, product.id];
                        setFormState({ ...formState, productIds: newIds });
                      }}
                    >
                      {product.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formState.usageLimit}
                  onChange={(e) => setFormState({ ...formState, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                  data-testid="input-usage-limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimitPerUser">Per User Limit</Label>
                <Input
                  id="usageLimitPerUser"
                  type="number"
                  value={formState.usageLimitPerUser}
                  onChange={(e) => setFormState({ ...formState, usageLimitPerUser: e.target.value })}
                  placeholder="Unlimited"
                  data-testid="input-per-user-limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start Date</Label>
                <Input
                  id="startsAt"
                  type="date"
                  value={formState.startsAt}
                  onChange={(e) => setFormState({ ...formState, startsAt: e.target.value })}
                  data-testid="input-starts-at"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formState.expiresAt}
                  onChange={(e) => setFormState({ ...formState, expiresAt: e.target.value })}
                  data-testid="input-expires-at"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                id="isActive"
                checked={formState.isActive}
                onCheckedChange={(checked) => setFormState({ ...formState, isActive: checked })}
                data-testid="switch-is-active"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                <div>Coupon is Active</div>
                <p className="text-sm text-muted-foreground font-normal">
                  When disabled, customers cannot use this coupon
                </p>
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingCoupon(null); resetForm(); }} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCouponMutation.isPending || updateCouponMutation.isPending}
                data-testid="button-submit"
              >
                {createCouponMutation.isPending || updateCouponMutation.isPending ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coupon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (couponToDelete) {
                  deleteCouponMutation.mutate(couponToDelete);
                }
                setDeleteConfirmOpen(false);
                setCouponToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
