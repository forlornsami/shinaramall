import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import type { UserAddress } from "@shared/schema";

const LABELS = ["Home", "Office", "Other"];

const emptyForm = {
  label: "Home",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  isDefault: false,
};

type AddressForm = typeof emptyForm;

function AddressFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: AddressForm;
  onSave: (data: AddressForm) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<AddressForm>(initial);

  // Reset when dialog opens with new initial data
  const handleOpen = (v: boolean) => {
    if (v) setForm(initial);
    onOpenChange(v);
  };

  const set = (key: keyof AddressForm, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial.firstName ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>Fill in the shipping address details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Label */}
          <div className="flex gap-2">
            {LABELS.map(l => (
              <button
                key={l}
                type="button"
                onClick={() => set("label", l)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.label === l
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Ali" />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Khan" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Street Address *</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="House 12, Street 5, DHA" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>City *</Label>
              <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Lahore" />
            </div>
            <div className="space-y-1">
              <Label>Postal Code</Label>
              <Input value={form.postalCode} onChange={e => set("postalCode", e.target.value)} placeholder="54000" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+92 300 1234567" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => set("isDefault", e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm">Set as default address</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={saving || !form.firstName || !form.address || !form.city || !form.phone}
          >
            {saving ? "Saving..." : "Save Address"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AddressBook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery<UserAddress[]>({
    queryKey: ["/api/addresses"],
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAddress | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });

  const createMutation = useMutation({
    mutationFn: (data: AddressForm) => apiRequest("POST", "/api/addresses", data),
    onSuccess: () => { toast({ title: "Address added" }); invalidate(); setDialogOpen(false); },
    onError: () => toast({ title: "Failed to add address", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressForm }) =>
      apiRequest("PATCH", `/api/addresses/${id}`, data),
    onSuccess: () => { toast({ title: "Address updated" }); invalidate(); setDialogOpen(false); setEditing(null); },
    onError: () => toast({ title: "Failed to update address", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/addresses/${id}`),
    onSuccess: () => { toast({ title: "Address deleted" }); invalidate(); setDeleteTarget(null); },
    onError: () => toast({ title: "Failed to delete address", variant: "destructive" }),
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/addresses/${id}/default`),
    onSuccess: () => { toast({ title: "Default address updated" }); invalidate(); },
    onError: () => toast({ title: "Failed to set default", variant: "destructive" }),
  });

  const handleSave = (form: AddressForm) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (addr: UserAddress) => { setEditing(addr); setDialogOpen(true); };

  const initialForm = editing
    ? {
        label: editing.label || "Home",
        firstName: editing.firstName,
        lastName: editing.lastName || "",
        address: editing.address,
        city: editing.city,
        postalCode: editing.postalCode || "",
        phone: editing.phone,
        isDefault: !!editing.isDefault,
      }
    : { ...emptyForm, isDefault: addresses.length === 0 };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Saved Addresses
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your shipping addresses
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No saved addresses yet</p>
          <Button variant="link" size="sm" className="mt-1" onClick={openAdd}>
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`relative p-4 rounded-xl border transition-colors ${
                addr.isDefault
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {addr.address}, {addr.city}
                    {addr.postalCode ? ` ${addr.postalCode}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Set as default"
                      onClick={() => defaultMutation.mutate(addr.id)}
                      disabled={defaultMutation.isPending}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(addr)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(addr)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={v => { setDialogOpen(v); if (!v) setEditing(null); }}
        initial={initialForm}
        onSave={handleSave}
        saving={saving}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the{" "}
              <strong>{deleteTarget?.label}</strong> address ({deleteTarget?.address},{" "}
              {deleteTarget?.city}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
