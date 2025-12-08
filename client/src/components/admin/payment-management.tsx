import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Settings, 
  DollarSign, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Smartphone,
  Building,
  Wallet,
  Banknote,
  Pencil,
  Trash2,
  Globe,
  Landmark
} from "lucide-react";
import type { PaymentGateway, PaymentTransaction } from "@shared/schema";

const iconOptions = [
  { value: 'smartphone', label: 'Mobile', icon: Smartphone },
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'building', label: 'Bank', icon: Building },
  { value: 'banknote', label: 'Cash', icon: Banknote },
  { value: 'credit-card', label: 'Card', icon: CreditCard },
  { value: 'globe', label: 'Online', icon: Globe },
  { value: 'landmark', label: 'Institution', icon: Landmark },
];

export default function PaymentManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedGateway, setSelectedGateway] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [deletingGateway, setDeletingGateway] = useState<PaymentGateway | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    icon: 'credit-card',
    description: '',
    isEnabled: true,
    testMode: true,
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    walletAddress: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      icon: 'credit-card',
      description: '',
      isEnabled: true,
      testMode: true,
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
      walletAddress: '',
    });
  };

  const isCryptoGateway = (name: string) => {
    return name === 'tron_usdt' || name === 'binance_pay';
  };

  const { data: gateways, isLoading: gatewaysLoading } = useQuery({
    queryKey: ['/api/admin/payment-gateways'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/payment-gateways', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch payment gateways');
      return response.json();
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/payment-analytics'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/payment-analytics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch payment analytics');
      return response.json();
    },
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/payment-transactions', { status: selectedStatus, gateway: selectedGateway }],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedGateway !== 'all') params.append('gatewayId', selectedGateway);
      
      const response = await fetch(`/api/admin/payment-transactions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch payment transactions');
      return response.json();
    },
  });

  const initializeGatewaysMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/initialize-payment-gateways', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to initialize payment gateways');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment gateways initialized successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to initialize payment gateways", variant: "destructive" });
    },
  });

  const createGatewayMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/payment-gateways', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create payment gateway');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment gateway created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create payment gateway", variant: "destructive" });
    },
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/payment-gateways/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update payment gateway');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment gateway updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
      setIsEditModalOpen(false);
      setEditingGateway(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update payment gateway", variant: "destructive" });
    },
  });

  const deleteGatewayMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/payment-gateways/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete payment gateway');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment gateway deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
      setIsDeleteDialogOpen(false);
      setDeletingGateway(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete payment gateway", variant: "destructive" });
    },
  });

  const updateTransactionStatusMutation = useMutation({
    mutationFn: async ({ transactionId, status }: { transactionId: string; status: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/payment-transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update transaction status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update payment status", variant: "destructive" });
    },
  });

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(i => i.value === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return <CreditCard className="w-5 h-5" />;
  };

  const getIconColor = (name: string) => {
    switch (name) {
      case 'easypaisa': return 'text-green-600';
      case 'jazzcash': return 'text-red-600';
      case 'hbl': return 'text-blue-600';
      case 'cod': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      failed: "destructive", 
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    const config = gateway.configuration as any || {};
    setFormData({
      name: gateway.name,
      displayName: gateway.displayName,
      icon: gateway.icon || 'credit-card',
      description: gateway.description || '',
      isEnabled: gateway.isEnabled ?? true,
      testMode: gateway.testMode ?? true,
      walletAddress: config.walletAddress || gateway.apiKey || '',
      apiKey: gateway.apiKey || '',
      apiSecret: gateway.apiSecret || '',
      webhookUrl: gateway.webhookUrl || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (gateway: PaymentGateway) => {
    setDeletingGateway(gateway);
    setIsDeleteDialogOpen(true);
  };

  const filteredTransactions = transactions?.filter((transaction: PaymentTransaction) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.gatewayTransactionId?.toLowerCase().includes(searchLower) ||
        transaction.orderId.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  if (gatewaysLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-transactions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-transactions">
              {analytics?.totalTransactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-completed-transactions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-completed-transactions">
              {analytics?.completedTransactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-failed-transactions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-failed-transactions">
              {analytics?.failedTransactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-total-revenue">
              Rs. {analytics?.totalRevenue?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList data-testid="tabs-payment-management">
          <TabsTrigger value="gateways" data-testid="tab-gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          <TabsTrigger value="overview" data-testid="tab-overview">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Payment Gateway Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure and manage your Pakistani payment methods
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => initializeGatewaysMutation.mutate()}
                disabled={initializeGatewaysMutation.isPending}
                variant="outline"
                data-testid="button-initialize-gateways"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {initializeGatewaysMutation.isPending ? "Initializing..." : "Initialize Default"}
              </Button>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                data-testid="button-add-gateway"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Gateway
              </Button>
            </div>
          </div>

          <Card data-testid="card-gateway-settings">
            <CardContent className="p-6">
              {gateways?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gateways.map((gateway: PaymentGateway) => (
                      <TableRow key={gateway.id} data-testid={`gateway-row-${gateway.id}`}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-muted ${getIconColor(gateway.name)}`}>
                              {getIconComponent(gateway.icon || 'credit-card')}
                            </div>
                            <div>
                              <div className="font-medium" data-testid={`text-gateway-name-${gateway.id}`}>
                                {gateway.displayName}
                              </div>
                              <div className="text-xs text-muted-foreground">{gateway.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {gateway.description || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={gateway.isEnabled ? "default" : "secondary"}
                            data-testid={`badge-gateway-status-${gateway.id}`}
                          >
                            {gateway.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {gateway.testMode ? "Test" : "Live"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateGatewayMutation.mutate({
                                  id: gateway.id,
                                  data: { isEnabled: !gateway.isEnabled }
                                });
                              }}
                              data-testid={`button-toggle-gateway-${gateway.id}`}
                            >
                              {gateway.isEnabled ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(gateway)}
                              data-testid={`button-edit-gateway-${gateway.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(gateway)}
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-gateway-${gateway.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment gateways configured. Click "Initialize Default" to set up Pakistani payment methods or "Add Gateway" to create a new one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card data-testid="card-transaction-filters">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-48">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-transactions"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                  <SelectTrigger className="w-48" data-testid="select-gateway-filter">
                    <SelectValue placeholder="All Gateways" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gateways</SelectItem>
                    {gateways?.map((gateway: PaymentGateway) => (
                      <SelectItem key={gateway.id} value={gateway.id}>
                        {gateway.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-transactions-table">
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading transactions...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching your criteria.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: PaymentTransaction) => {
                      const gateway = gateways?.find((g: PaymentGateway) => g.id === transaction.gatewayId);
                      return (
                        <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {transaction.gatewayTransactionId || transaction.id.slice(0, 8)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={getIconColor(gateway?.name || '')}>
                                {getIconComponent(gateway?.icon || 'credit-card')}
                              </span>
                              <span>{gateway?.displayName || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            Rs. {parseFloat(transaction.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              {getStatusBadge(transaction.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={transaction.status}
                              onValueChange={(value) => updateTransactionStatusMutation.mutate({ 
                                transactionId: transaction.id, 
                                status: value 
                              })}
                              disabled={updateTransactionStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32 h-8" data-testid={`select-transaction-status-${transaction.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card data-testid="card-gateway-performance">
            <CardHeader>
              <CardTitle>Payment Gateway Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.gatewayStats?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.gatewayStats.map((stat: any, index: number) => {
                    const gateway = gateways?.find((g: PaymentGateway) => 
                      g.displayName.toLowerCase() === stat.gateway.toLowerCase()
                    );
                    return (
                      <Card key={index} data-testid={`card-gateway-stat-${index}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-muted ${getIconColor(gateway?.name || '')}`}>
                              {getIconComponent(gateway?.icon || 'credit-card')}
                            </div>
                            <div>
                              <div className="font-medium">{stat.gateway}</div>
                              <div className="text-sm text-muted-foreground">
                                {stat.totalTransactions} transactions
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {stat.successRate.toFixed(1)}% success
                              </div>
                              <div className="text-sm font-medium text-blue-600">
                                Rs. {stat.revenue.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment gateway statistics available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Gateway</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Gateway Name (ID)</Label>
              <Input
                id="name"
                placeholder="e.g., paypal, stripe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                data-testid="input-gateway-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="e.g., PayPal, Stripe"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                data-testid="input-gateway-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger data-testid="select-gateway-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this payment method"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-gateway-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isEnabled">Enable Gateway</Label>
              <Switch
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                data-testid="switch-gateway-enabled"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="testMode">Test Mode</Label>
              <Switch
                id="testMode"
                checked={formData.testMode}
                onCheckedChange={(checked) => setFormData({ ...formData, testMode: checked })}
                data-testid="switch-gateway-test-mode"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createGatewayMutation.mutate(formData)}
              disabled={createGatewayMutation.isPending || !formData.name || !formData.displayName}
              data-testid="button-save-gateway"
            >
              {createGatewayMutation.isPending ? "Creating..." : "Create Gateway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Gateway</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                data-testid="input-edit-gateway-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger data-testid="select-edit-gateway-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-gateway-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isEnabled">Enable Gateway</Label>
              <Switch
                id="edit-isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                data-testid="switch-edit-gateway-enabled"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-testMode">Test Mode</Label>
              <Switch
                id="edit-testMode"
                checked={formData.testMode}
                onCheckedChange={(checked) => setFormData({ ...formData, testMode: checked })}
                data-testid="switch-edit-gateway-test-mode"
              />
            </div>

            {editingGateway && isCryptoGateway(editingGateway.name) && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Crypto Configuration</h4>
                </div>
                
                {editingGateway.name === 'tron_usdt' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-walletAddress">USDT (TRC-20) Wallet Address</Label>
                    <Input
                      id="edit-walletAddress"
                      value={formData.walletAddress}
                      onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                      placeholder="Your Tron wallet address (T...)"
                      data-testid="input-edit-gateway-wallet-address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Customers will send USDT payments to this address
                    </p>
                  </div>
                )}

                {editingGateway.name === 'binance_pay' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Binance Pay API Integration</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Binance Pay uses direct API integration. When customers select Binance Pay, they'll be redirected to Binance's secure checkout page to complete payment.
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Get your API credentials from <a href="https://merchant.binance.com" target="_blank" rel="noopener noreferrer" className="underline">Binance Merchant Portal</a> → Developers → API Keys
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-binanceApiKey">Binance Pay API Key</Label>
                      <Input
                        id="edit-binanceApiKey"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        placeholder="Your Binance Pay API Key"
                        data-testid="input-edit-gateway-binance-api-key"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-binanceApiSecret">Binance Pay Secret Key</Label>
                      <Input
                        id="edit-binanceApiSecret"
                        type="password"
                        value={formData.apiSecret}
                        onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                        placeholder="Your Binance Pay Secret Key"
                        data-testid="input-edit-gateway-binance-api-secret"
                      />
                      <p className="text-xs text-muted-foreground">
                        Keep this secret secure. Never share it publicly.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-webhookUrl">Webhook URL</Label>
                  <Input
                    id="edit-webhookUrl"
                    value={formData.webhookUrl}
                    readOnly
                    className="bg-muted"
                    placeholder={`${window.location.origin}/api/webhooks/${editingGateway.name === 'tron_usdt' ? 'tron' : 'binance'}`}
                    data-testid="input-edit-gateway-webhook-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure this URL in your payment provider's dashboard to receive payment notifications
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (editingGateway) {
                  const updateData: any = {
                    displayName: formData.displayName,
                    icon: formData.icon,
                    description: formData.description,
                    isEnabled: formData.isEnabled,
                    testMode: formData.testMode,
                  };

                  if (isCryptoGateway(editingGateway.name)) {
                    if (editingGateway.name === 'tron_usdt') {
                      updateData.apiKey = formData.walletAddress;
                      updateData.configuration = { walletAddress: formData.walletAddress };
                    } else if (editingGateway.name === 'binance_pay') {
                      updateData.apiKey = formData.apiKey;
                      updateData.apiSecret = formData.apiSecret;
                      updateData.configuration = { network: 'binance', supportedCurrencies: ['USDT', 'BUSD', 'BNB'] };
                    }
                    updateData.webhookUrl = `${window.location.origin}/api/webhooks/${editingGateway.name === 'tron_usdt' ? 'tron' : 'binance'}`;
                  }

                  updateGatewayMutation.mutate({
                    id: editingGateway.id,
                    data: updateData
                  });
                }
              }}
              disabled={updateGatewayMutation.isPending}
              data-testid="button-update-gateway"
            >
              {updateGatewayMutation.isPending ? "Updating..." : "Update Gateway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingGateway?.displayName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingGateway) {
                  deleteGatewayMutation.mutate(deletingGateway.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteGatewayMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
