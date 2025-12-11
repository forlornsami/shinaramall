import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Wallet, Plus, History, Upload, Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Wallet as WalletType, WalletTransaction, WalletTopupRequest, PaymentAccount } from "@shared/schema";

export default function WalletPage() {
  const { toast } = useToast();
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupPaymentMethod, setTopupPaymentMethod] = useState("");
  const [topupScreenshot, setTopupScreenshot] = useState<string | null>(null);
  const [topupTransactionId, setTopupTransactionId] = useState("");

  const { data: wallet, isLoading: walletLoading } = useQuery<WalletType>({
    queryKey: ["/api/wallet"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  const { data: topupRequests = [], isLoading: requestsLoading } = useQuery<WalletTopupRequest[]>({
    queryKey: ["/api/wallet/topup-requests"],
  });

  const { data: paymentAccounts = [] } = useQuery<PaymentAccount[]>({
    queryKey: ["/api/payment-accounts"],
  });

  const topupMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string; screenshotUrl: string; transactionId?: string }) => {
      return apiRequest("POST", "/api/wallet/topup-request", data);
    },
    onSuccess: () => {
      toast({ title: "Top-up request submitted!", description: "Your request is being reviewed." });
      setTopupDialogOpen(false);
      setTopupAmount("");
      setTopupPaymentMethod("");
      setTopupScreenshot(null);
      setTopupTransactionId("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/topup-requests"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to submit request", description: error.message, variant: "destructive" });
    },
  });

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTopupScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTopupSubmit = () => {
    if (!topupAmount || parseFloat(topupAmount) < 100) {
      toast({ title: "Invalid amount", description: "Minimum top-up amount is Rs. 100", variant: "destructive" });
      return;
    }
    if (!topupPaymentMethod) {
      toast({ title: "Payment method required", description: "Please select a payment method", variant: "destructive" });
      return;
    }
    if (!topupScreenshot) {
      toast({ title: "Screenshot required", description: "Please upload payment screenshot", variant: "destructive" });
      return;
    }

    topupMutation.mutate({
      amount: topupAmount,
      paymentMethod: topupPaymentMethod,
      screenshotUrl: topupScreenshot,
      transactionId: topupTransactionId || undefined,
    });
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
      case "credit":
      case "refund":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "purchase":
      case "adjustment":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const selectedPaymentAccount = paymentAccounts.find(acc => acc.method === topupPaymentMethod);

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-store">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Wallet className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your wallet balance and transactions</p>
          </div>
        </div>

        <Card className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Store Credit Policy:</strong> Your wallet balance is store credit that can be used for purchases on this store. Withdrawals are not available - balance can only be used for shopping. For refunds on cancelled orders, the amount is credited back to your wallet.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Balance</p>
                <p className="text-4xl font-bold text-primary" data-testid="text-wallet-balance">
                  Rs. {parseFloat(wallet?.balance || "0").toLocaleString()}
                </p>
              </div>
              <Dialog open={topupDialogOpen} onOpenChange={setTopupDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2" data-testid="button-topup">
                    <Plus className="w-5 h-5" />
                    Top Up
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Top Up Wallet</DialogTitle>
                    <DialogDescription>Add funds to your wallet using any of our payment methods</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (Rs.)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount (min. Rs. 100)"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        min="100"
                        data-testid="input-topup-amount"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={topupPaymentMethod} onValueChange={setTopupPaymentMethod}>
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentAccounts.filter(acc => acc.isActive && acc.method !== 'cod').map((account) => (
                            <SelectItem key={account.id} value={account.method}>
                              {account.method === 'easypaisa' && 'EasyPaisa'}
                              {account.method === 'jazzcash' && 'JazzCash'}
                              {account.method === 'hbl' && 'HBL Bank Transfer'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPaymentAccount && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4 text-sm space-y-1">
                          <p className="font-medium">{selectedPaymentAccount.accountHolderName}</p>
                          <p className="font-mono">{selectedPaymentAccount.accountNumber}</p>
                          {selectedPaymentAccount.bankName && (
                            <p className="text-muted-foreground">{selectedPaymentAccount.bankName}</p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                      <Input
                        id="transactionId"
                        placeholder="Enter transaction reference"
                        value={topupTransactionId}
                        onChange={(e) => setTopupTransactionId(e.target.value)}
                        data-testid="input-transaction-id"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Screenshot</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          id="screenshot-upload"
                          data-testid="input-screenshot"
                        />
                        <label htmlFor="screenshot-upload" className="cursor-pointer">
                          {topupScreenshot ? (
                            <img src={topupScreenshot} alt="Screenshot" className="max-h-48 mx-auto rounded" />
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-500">Click to upload payment screenshot</p>
                              <p className="text-xs text-gray-400">Max 5MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleTopupSubmit}
                      disabled={topupMutation.isPending}
                      data-testid="button-submit-topup"
                    >
                      {topupMutation.isPending ? "Submitting..." : "Submit Top-up Request"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <History className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              <Clock className="w-4 h-4 mr-2" />
              Top-up Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`transaction-${tx.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                            {getTransactionIcon(tx.type)}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Top-up Requests</CardTitle>
                <CardDescription>Track your wallet top-up requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : topupRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No top-up requests yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => setTopupDialogOpen(true)}>
                      Make Your First Top-up
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topupRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`topup-request-${request.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">Rs. {parseFloat(request.amount).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">
                              via {request.paymentMethod} • {format(new Date(request.createdAt!), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
