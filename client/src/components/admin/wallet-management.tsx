import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw, 
  Plus, 
  Minus,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Users,
  History
} from "lucide-react";
import { format } from "date-fns";
import type { WalletTopupRequest, WalletTransaction, User } from "@shared/schema";

interface WalletWithUser {
  id: string;
  userId: string;
  balance: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  user: User;
}

interface TopupRequestWithDetails extends WalletTopupRequest {
  user: User;
  processedByAdmin: { username: string } | null;
}

export default function WalletManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewingRequest, setViewingRequest] = useState<TopupRequestWithDetails | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [deductFundsDialogOpen, setDeductFundsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");
  const [fundsDescription, setFundsDescription] = useState("");
  const [viewingWallet, setViewingWallet] = useState<WalletWithUser | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const { data: pendingCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/wallets/topup-requests/pending-count"],
  });
  const pendingCount = pendingCountData?.count || 0;

  const { data: topupRequests = [], isLoading: requestsLoading, refetch: refetchRequests } = useQuery<TopupRequestWithDetails[]>({
    queryKey: ["/api/admin/wallets/topup-requests"],
  });

  const { data: wallets = [], isLoading: walletsLoading, refetch: refetchWallets } = useQuery<WalletWithUser[]>({
    queryKey: ["/api/admin/wallets"],
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, approved, note }: { id: string; approved: boolean; note?: string }) => {
      return apiRequest("POST", `/api/admin/wallets/topup-requests/${id}/process`, { approved, note });
    },
    onSuccess: () => {
      toast({ title: "Request processed successfully" });
      setViewingRequest(null);
      setRejectNote("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets/topup-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets/topup-requests/pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to process request", description: error.message, variant: "destructive" });
    },
  });

  const addFundsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: string; description: string }) => {
      return apiRequest("POST", `/api/admin/wallets/${userId}/add-funds`, { amount, description });
    },
    onSuccess: () => {
      toast({ title: "Funds added successfully" });
      setAddFundsDialogOpen(false);
      setFundsAmount("");
      setFundsDescription("");
      setSelectedUserId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add funds", description: error.message, variant: "destructive" });
    },
  });

  const deductFundsMutation = useMutation({
    mutationFn: async ({ userId, amount, description }: { userId: string; amount: string; description: string }) => {
      return apiRequest("POST", `/api/admin/wallets/${userId}/deduct-funds`, { amount, description });
    },
    onSuccess: () => {
      toast({ title: "Funds deducted successfully" });
      setDeductFundsDialogOpen(false);
      setFundsAmount("");
      setFundsDescription("");
      setSelectedUserId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wallets"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to deduct funds", description: error.message, variant: "destructive" });
    },
  });

  const loadWalletTransactions = async (userId: string) => {
    setTransactionsLoading(true);
    try {
      const response = await fetch(`/api/admin/wallets/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await response.json();
      setWalletTransactions(data.transactions || []);
    } catch (error) {
      toast({ title: "Failed to load transactions", variant: "destructive" });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = topupRequests.filter((req) => {
    const matchesSearch = 
      req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredWallets = wallets.filter((wallet) => {
    return (
      wallet.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage customer wallets and topup requests</p>
        </div>
        <Button onClick={() => { refetchRequests(); refetchWallets(); }} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-2xl font-bold" data-testid="text-pending-count">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold">Rs. {totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Wallets</p>
                <p className="text-2xl font-bold">{wallets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Balance</p>
                <p className="text-2xl font-bold">
                  Rs. {wallets.length > 0 ? Math.round(totalBalance / wallets.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topup-requests">
        <TabsList>
          <TabsTrigger value="topup-requests" className="relative" data-testid="tab-topup-requests">
            Top-up Requests
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-wallets" data-testid="tab-all-wallets">All Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="topup-requests" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by customer or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-requests"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
              data-testid="select-status-filter"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <Card>
            <CardContent className="p-0">
              {requestsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No topup requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} data-testid={`topup-request-row-${request.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.user?.firstName || 'N/A'} {request.user?.lastName || ''}</p>
                            <p className="text-sm text-gray-500">{request.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">Rs. {parseFloat(request.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{request.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{request.transactionId || '-'}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.createdAt && format(new Date(request.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingRequest(request)}
                            data-testid={`button-view-request-${request.id}`}
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
        </TabsContent>

        <TabsContent value="all-wallets" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-wallets"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {walletsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredWallets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No wallets found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWallets.map((wallet) => (
                      <TableRow key={wallet.id} data-testid={`wallet-row-${wallet.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{wallet.user?.firstName || 'N/A'} {wallet.user?.lastName || ''}</p>
                            <p className="text-sm text-gray-500">{wallet.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-lg">
                          Rs. {parseFloat(wallet.balance).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {wallet.updatedAt && format(new Date(wallet.updatedAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingWallet(wallet);
                              loadWalletTransactions(wallet.userId);
                            }}
                            data-testid={`button-view-wallet-${wallet.id}`}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => {
                              setSelectedUserId(wallet.userId);
                              setAddFundsDialogOpen(true);
                            }}
                            data-testid={`button-add-funds-${wallet.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUserId(wallet.userId);
                              setDeductFundsDialogOpen(true);
                            }}
                            data-testid={`button-deduct-funds-${wallet.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Topup Request Details</DialogTitle>
            <DialogDescription>Review and process the customer topup request</DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Customer</Label>
                  <p className="font-medium">{viewingRequest.user?.firstName} {viewingRequest.user?.lastName}</p>
                  <p className="text-sm text-gray-500">{viewingRequest.user?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Amount</Label>
                  <p className="text-2xl font-bold text-green-600">Rs. {parseFloat(viewingRequest.amount).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Method</Label>
                  <p className="capitalize font-medium">{viewingRequest.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Transaction ID</Label>
                  <p className="font-mono">{viewingRequest.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingRequest.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Requested On</Label>
                  <p>{viewingRequest.createdAt && format(new Date(viewingRequest.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              {viewingRequest.screenshotUrl && (
                <div>
                  <Label className="text-gray-500">Payment Screenshot</Label>
                  <img
                    src={viewingRequest.screenshotUrl}
                    alt="Payment screenshot"
                    className="mt-2 rounded-lg border max-h-64 object-contain w-full"
                  />
                </div>
              )}

              {viewingRequest.status === 'pending' ? (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Rejection Note (optional)</Label>
                    <Textarea
                      placeholder="Enter reason for rejection (if rejecting)..."
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      data-testid="textarea-reject-note"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => processMutation.mutate({ id: viewingRequest.id, approved: false, note: rejectNote })}
                      disabled={processMutation.isPending}
                      data-testid="button-reject-request"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => processMutation.mutate({ id: viewingRequest.id, approved: true })}
                      disabled={processMutation.isPending}
                      data-testid="button-approve-request"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t">
                  {viewingRequest.processedByAdmin && (
                    <p className="text-sm text-gray-500">
                      Processed by: {viewingRequest.processedByAdmin.username}
                    </p>
                  )}
                  {viewingRequest.adminNote && (
                    <p className="text-sm mt-2">Note: {viewingRequest.adminNote}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingWallet} onOpenChange={() => setViewingWallet(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Wallet Transactions</DialogTitle>
            <DialogDescription>
              {viewingWallet?.user?.firstName} {viewingWallet?.user?.lastName} - Balance: Rs. {parseFloat(viewingWallet?.balance || "0").toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : walletTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {walletTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${parseFloat(tx.amount) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {parseFloat(tx.amount) >= 0 ? (
                        <ArrowDownLeft className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-500">
                        {tx.createdAt && format(new Date(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${parseFloat(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(tx.amount) >= 0 ? '+' : ''}Rs. {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Bal: Rs. {parseFloat(tx.balanceAfter).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>Manually add funds to customer wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (Rs.)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
                min="1"
                data-testid="input-add-funds-amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Reason for adding funds..."
                value={fundsDescription}
                onChange={(e) => setFundsDescription(e.target.value)}
                data-testid="textarea-add-funds-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFundsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedUserId && fundsAmount) {
                  addFundsMutation.mutate({
                    userId: selectedUserId,
                    amount: fundsAmount,
                    description: fundsDescription,
                  });
                }
              }}
              disabled={addFundsMutation.isPending || !fundsAmount}
              data-testid="button-confirm-add-funds"
            >
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deductFundsDialogOpen} onOpenChange={setDeductFundsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deduct Funds from Wallet</DialogTitle>
            <DialogDescription>Manually deduct funds from customer wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (Rs.)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
                min="1"
                data-testid="input-deduct-funds-amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Reason for deducting funds..."
                value={fundsDescription}
                onChange={(e) => setFundsDescription(e.target.value)}
                data-testid="textarea-deduct-funds-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeductFundsDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUserId && fundsAmount) {
                  deductFundsMutation.mutate({
                    userId: selectedUserId,
                    amount: fundsAmount,
                    description: fundsDescription,
                  });
                }
              }}
              disabled={deductFundsMutation.isPending || !fundsAmount}
              data-testid="button-confirm-deduct-funds"
            >
              Deduct Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
