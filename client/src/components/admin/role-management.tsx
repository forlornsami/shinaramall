import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Search,
  Lock,
  Unlock,
  ChevronRight,
} from "lucide-react";

interface Permission {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  adjust?: boolean;
  manage?: boolean;
  respond?: boolean;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  permissions: Record<string, boolean | Permission>;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultPermissions: Record<string, boolean | Permission> = {
  dashboard: true,
  products: { view: true, create: false, edit: false, delete: false },
  categories: { view: true, create: false, edit: false, delete: false },
  orders: { view: true, edit: false },
  customers: { view: true },
  inventory: { view: true, adjust: false },
  payments: { view: false, manage: false },
  users: { view: false, create: false, edit: false, delete: false },
  roles: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
  chat: { view: false, respond: false },
};

const permissionLabels: Record<string, string> = {
  dashboard: "Dashboard Access",
  products: "Product Management",
  categories: "Category Management",
  orders: "Order Management",
  customers: "Customer Access",
  inventory: "Inventory Management",
  payments: "Payment Management",
  users: "User Management",
  roles: "Role Management",
  settings: "Settings Access",
  chat: "Chat Support",
};

export default function RoleManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: { ...defaultPermissions },
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["/api/admin/roles"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch roles");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role created successfully" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role updated successfully" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role deleted successfully" });
      setDeleteRoleId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role status");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: `Role ${variables.isActive ? "activated" : "deactivated"} successfully` });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update role status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      permissions: { ...defaultPermissions },
    });
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      permissions: role.permissions || { ...defaultPermissions },
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.displayName) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const togglePermission = (
    key: string,
    subKey?: string
  ) => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };
      if (subKey) {
        const current = newPermissions[key] as Permission;
        newPermissions[key] = {
          ...current,
          [subKey]: !current[subKey as keyof Permission],
        };
      } else {
        newPermissions[key] = !newPermissions[key];
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getPermissionCount = (permissions: Record<string, boolean | Permission>): number => {
    let count = 0;
    Object.values(permissions).forEach((perm) => {
      if (typeof perm === "boolean" && perm) {
        count++;
      } else if (typeof perm === "object") {
        count += Object.values(perm).filter(Boolean).length;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6" data-testid="section-roles">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Roles & Permissions</h2>
          <p className="text-muted-foreground">
            Manage roles and their access permissions
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-xl gradient-primary"
          data-testid="button-add-role"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl"
          data-testid="input-search-roles"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="card-modern border-0" data-testid={`card-role-${role.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      role.isSystem ? "bg-amber-500/10" : "bg-primary/10"
                    }`}>
                      <Shield className={`w-6 h-6 ${role.isSystem ? "text-amber-600" : "text-primary"}`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground" data-testid={`text-role-name-${role.id}`}>
                          {role.displayName}
                        </h3>
                        {role.isSystem && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-0">
                            <Lock className="w-3 h-3 mr-1" />
                            System
                          </Badge>
                        )}
                        <Badge
                          className={
                            role.isActive
                              ? "bg-green-500/10 text-green-600 border-0"
                              : "bg-red-500/10 text-red-600 border-0"
                          }
                        >
                          {role.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description || "No description provided"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{getPermissionCount(role.permissions)} permissions</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-xs">
                          {Object.keys(role.permissions).filter((k) => {
                            const p = role.permissions[k];
                            return typeof p === "boolean" ? p : Object.values(p as Permission).some(Boolean);
                          }).map((k) => permissionLabels[k] || k).slice(0, 3).join(", ")}
                          {Object.keys(role.permissions).length > 3 && "..."}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={role.isActive}
                        onCheckedChange={(checked) =>
                          toggleStatusMutation.mutate({ id: role.id, isActive: checked })
                        }
                        disabled={toggleStatusMutation.isPending}
                        data-testid={`switch-role-active-${role.id}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {role.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(role)}
                      className="rounded-xl hover:bg-primary/10"
                      data-testid={`button-edit-role-${role.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteRoleId(role.id)}
                        className="rounded-xl hover:bg-destructive/10 text-destructive"
                        data-testid={`button-delete-role-${role.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredRoles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No roles found
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update role details and permissions"
                : "Create a new role with specific permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    }))
                  }
                  placeholder="e.g., content_manager"
                  className="rounded-xl"
                  disabled={editingRole?.isSystem}
                  data-testid="input-role-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  placeholder="e.g., Content Manager"
                  className="rounded-xl"
                  data-testid="input-role-display-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe what this role can do..."
                className="rounded-xl"
                data-testid="input-role-description"
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-3">
                {Object.entries(permissionLabels).map(([key, label]) => {
                  const perm = formData.permissions[key];
                  const isBoolean = typeof perm === "boolean";

                  return (
                    <Card key={key} className="border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{label}</span>
                        {isBoolean && (
                          <Switch
                            checked={perm as boolean}
                            onCheckedChange={() => togglePermission(key)}
                            data-testid={`switch-permission-${key}`}
                          />
                        )}
                      </div>
                      {!isBoolean && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {Object.keys(perm as Permission).map((subKey) => (
                            <div
                              key={subKey}
                              className="flex items-center gap-2"
                            >
                              <Switch
                                id={`${key}-${subKey}`}
                                checked={(perm as Permission)[subKey as keyof Permission] ?? false}
                                onCheckedChange={() => togglePermission(key, subKey)}
                                data-testid={`switch-permission-${key}-${subKey}`}
                              />
                              <Label
                                htmlFor={`${key}-${subKey}`}
                                className="text-sm capitalize"
                              >
                                {subKey}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-xl gradient-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-role"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone. Users with this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoleId && deleteMutation.mutate(deleteRoleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-role"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
