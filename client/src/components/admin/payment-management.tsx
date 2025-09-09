import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Smartphone,
  Building
} from "lucide-react";
import type { PaymentGateway, PaymentTransaction } from "@shared/schema";

export default function PaymentManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedGateway, setSelectedGateway] = useState<string>("all");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);

  // Fetch payment gateways
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

  // Fetch payment analytics
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

  // Fetch payment transactions
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

  // Initialize payment gateways mutation
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
      toast({
        title: "Success",
        description: "Payment gateways initialized successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment gateways",
        variant: "destructive",
      });
    },
  });

  // Update gateway status mutation
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
      toast({
        title: "Success",
        description: "Payment gateway updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-gateways'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment gateway",
        variant: "destructive",
      });
    },
  });

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

  const getGatewayIcon = (name: string) => {
    switch (name) {
      case 'easypaisa':
      case 'jazzcash':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'hbl':
        return <Building className="w-5 h-5 text-green-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
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
      {/* Payment Analytics Overview */}
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList data-testid="tabs-payment-management">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          <TabsTrigger value="gateways" data-testid="tab-gateways">Gateway Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Gateway Performance Stats */}
          <Card data-testid="card-gateway-performance">
            <CardHeader>
              <CardTitle>Payment Gateway Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.gatewayStats?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.gatewayStats.map((stat: any, index: number) => (
                    <Card key={index} data-testid={`card-gateway-stat-${index}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {getGatewayIcon(stat.gateway.toLowerCase())}
                          <div>
                            <div className="font-medium" data-testid={`text-gateway-name-${index}`}>
                              {stat.gateway}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stat.totalTransactions} transactions
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {stat.successRate.toFixed(1)}% success rate
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              Rs. {stat.revenue.toLocaleString()} revenue
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment gateway statistics available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Filters */}
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
                    <SelectItem value="all" data-testid="option-all-status">All Status</SelectItem>
                    <SelectItem value="completed" data-testid="option-completed">Completed</SelectItem>
                    <SelectItem value="pending" data-testid="option-pending">Pending</SelectItem>
                    <SelectItem value="failed" data-testid="option-failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                  <SelectTrigger className="w-48" data-testid="select-gateway-filter">
                    <SelectValue placeholder="All Gateways" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="option-all-gateways">All Gateways</SelectItem>
                    {gateways?.map((gateway: PaymentGateway) => (
                      <SelectItem key={gateway.id} value={gateway.id} data-testid={`option-gateway-${gateway.id}`}>
                        {gateway.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
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
                      <TableHead data-testid="header-transaction-id">Transaction ID</TableHead>
                      <TableHead data-testid="header-gateway">Gateway</TableHead>
                      <TableHead data-testid="header-amount">Amount</TableHead>
                      <TableHead data-testid="header-status">Status</TableHead>
                      <TableHead data-testid="header-date">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: PaymentTransaction) => (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell>
                          <div className="font-mono text-sm" data-testid={`text-transaction-id-${transaction.id}`}>
                            {transaction.gatewayTransactionId || transaction.id.slice(0, 8)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getGatewayIcon(gateways?.find((g: PaymentGateway) => g.id === transaction.gatewayId)?.name || '')}
                            <span data-testid={`text-gateway-${transaction.id}`}>
                              {gateways?.find((g: PaymentGateway) => g.id === transaction.gatewayId)?.displayName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-amount-${transaction.id}`}>
                          Rs. {parseFloat(transaction.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            {getStatusBadge(transaction.status)}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-date-${transaction.id}`}>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-4">
          {/* Gateway Settings Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Payment Gateway Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure and manage your Pakistani payment methods
              </p>
            </div>
            <Button 
              onClick={() => initializeGatewaysMutation.mutate()}
              disabled={initializeGatewaysMutation.isPending}
              data-testid="button-initialize-gateways"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {initializeGatewaysMutation.isPending ? "Initializing..." : "Initialize Gateways"}
            </Button>
          </div>

          {/* Gateway Settings */}
          <Card data-testid="card-gateway-settings">
            <CardContent className="p-6">
              {gateways?.length > 0 ? (
                <div className="space-y-4">
                  {gateways.map((gateway: PaymentGateway) => (
                    <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`gateway-setting-${gateway.id}`}>
                      <div className="flex items-center space-x-4">
                        {getGatewayIcon(gateway.name)}
                        <div>
                          <div className="font-medium" data-testid={`text-gateway-name-${gateway.id}`}>
                            {gateway.displayName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {gateway.testMode ? "Test Mode" : "Live Mode"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant={gateway.isEnabled ? "default" : "secondary"}
                          data-testid={`badge-gateway-status-${gateway.id}`}
                        >
                          {gateway.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment gateways configured. Click "Initialize Gateways" to set up Pakistani payment methods.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}