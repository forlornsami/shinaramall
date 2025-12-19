import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  Wallet, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Building,
  CreditCard,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ShoppingCart,
  Clock,
  XCircle,
  CheckCircle,
  FileText
} from "lucide-react";

type BalanceSheetData = {
  assets: {
    cashFromOrders: number;
    inventoryValue: number;
    pendingPayments: number;
    totalAssets: number;
  };
  liabilities: {
    customerWalletBalances: number;
    pendingRefunds: number;
    pendingTopups: number;
    totalLiabilities: number;
  };
  equity: {
    retainedEarnings: number;
    netProfit: number;
    totalEquity: number;
  };
  summary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    orderCount: number;
    completedOrderCount: number;
    pendingOrderCount: number;
    cancelledOrderCount: number;
  };
  periodComparison?: {
    previousPeriodProfit: number;
    profitChange: number;
    profitChangePercent: number;
  };
};

export default function BalanceSheet() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: balanceSheet, isLoading, refetch } = useQuery<BalanceSheetData>({
    queryKey: ['/api/admin/balance-sheet', startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await fetch(`/api/admin/balance-sheet?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch balance sheet');
      return response.json();
    },
  });

  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  const profitColor = (balanceSheet?.equity.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600';
  const marginColor = (balanceSheet?.summary.profitMargin || 0) >= 20 ? 'text-green-600' : (balanceSheet?.summary.profitMargin || 0) >= 10 ? 'text-yellow-600' : 'text-red-600';
  const changeColor = (balanceSheet?.periodComparison?.profitChange || 0) >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Balance Sheet
          </h2>
          <p className="text-muted-foreground">Financial overview of your store</p>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-muted-foreground">Start Date</Label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-40" 
              data-testid="input-balance-start-date" 
            />
          </div>
          <div>
            <Label className="text-muted-foreground">End Date</Label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-40" 
              data-testid="input-balance-end-date" 
            />
          </div>
          <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh-balance-sheet">
            <Calendar className="h-4 w-4 mr-2" />
            Apply Filter
          </Button>
        </div>
      </div>

      {balanceSheet?.periodComparison && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Period-over-Period Comparison</p>
                  <p className="font-semibold">Previous Period Profit: {formatCurrency(balanceSheet.periodComparison.previousPeriodProfit)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {balanceSheet.periodComparison.profitChange >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-red-600" />
                )}
                <div className="text-right">
                  <p className={`text-xl font-bold ${changeColor}`}>
                    {balanceSheet.periodComparison.profitChange >= 0 ? '+' : ''}{formatCurrency(balanceSheet.periodComparison.profitChange)}
                  </p>
                  <p className={`text-sm ${changeColor}`}>
                    {balanceSheet.periodComparison.profitChange >= 0 ? '+' : ''}{formatPercent(balanceSheet.periodComparison.profitChangePercent)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-balance-revenue">
              {formatCurrency(balanceSheet?.summary.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-balance-cost">
              {formatCurrency(balanceSheet?.summary.totalCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total cost of sold items</p>
          </CardContent>
        </Card>

        <Card data-testid="card-gross-profit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <Wallet className={`h-4 w-4 ${profitColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitColor}`} data-testid="text-balance-profit">
              {formatCurrency(balanceSheet?.summary.grossProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Revenue minus cost</p>
          </CardContent>
        </Card>

        <Card data-testid="card-profit-margin">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className={`h-4 w-4 ${marginColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${marginColor}`} data-testid="text-balance-margin">
              {formatPercent(balanceSheet?.summary.profitMargin || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(balanceSheet?.summary.profitMargin || 0) >= 20 ? 'Healthy' : (balanceSheet?.summary.profitMargin || 0) >= 10 ? 'Moderate' : 'Low'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 dark:border-green-800" data-testid="card-assets">
          <CardHeader className="bg-green-50 dark:bg-green-950 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Building className="h-5 w-5" />
              Assets
            </CardTitle>
            <CardDescription>What your business owns</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Cash from Orders</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.assets.cashFromOrders || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Inventory Value</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.assets.inventoryValue || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Pending Payments</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.assets.pendingPayments || 0)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="font-bold text-green-700 dark:text-green-300">Total Assets</span>
              <span className="font-bold text-lg text-green-700 dark:text-green-300">
                {formatCurrency(balanceSheet?.assets.totalAssets || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800" data-testid="card-liabilities">
          <CardHeader className="bg-red-50 dark:bg-red-950 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <TrendingDown className="h-5 w-5" />
              Liabilities
            </CardTitle>
            <CardDescription>What your business owes</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Customer Wallet Balances</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.liabilities.customerWalletBalances || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Pending Refunds</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.liabilities.pendingRefunds || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Pending Topups</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.liabilities.pendingTopups || 0)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="font-bold text-red-700 dark:text-red-300">Total Liabilities</span>
              <span className="font-bold text-lg text-red-700 dark:text-red-300">
                {formatCurrency(balanceSheet?.liabilities.totalLiabilities || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800" data-testid="card-equity">
          <CardHeader className="bg-blue-50 dark:bg-blue-950 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <TrendingUp className="h-5 w-5" />
              Equity
            </CardTitle>
            <CardDescription>Net worth of your business</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Retained Earnings</span>
                </div>
                <span className="font-semibold">{formatCurrency(balanceSheet?.equity.retainedEarnings || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${profitColor}`} />
                  <span className="text-sm">Net Profit</span>
                </div>
                <span className={`font-semibold ${profitColor}`}>{formatCurrency(balanceSheet?.equity.netProfit || 0)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="font-bold text-blue-700 dark:text-blue-300">Total Equity</span>
              <span className="font-bold text-lg text-blue-700 dark:text-blue-300">
                {formatCurrency(balanceSheet?.equity.totalEquity || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-order-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
          <CardDescription>Overview of orders in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{balanceSheet?.summary.orderCount || 0}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{balanceSheet?.summary.completedOrderCount || 0}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="text-center p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-3xl font-bold text-yellow-600">{balanceSheet?.summary.pendingOrderCount || 0}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-3xl font-bold text-red-600">{balanceSheet?.summary.cancelledOrderCount || 0}</p>
              <p className="text-sm text-red-600">Cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" data-testid="card-accounting-equation">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-3">Accounting Equation Verification</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm min-w-[150px]">
              <p className="text-sm text-muted-foreground">Assets</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(balanceSheet?.assets.totalAssets || 0)}</p>
            </div>
            <span className="text-2xl font-bold text-muted-foreground">=</span>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm min-w-[150px]">
              <p className="text-sm text-muted-foreground">Liabilities</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(balanceSheet?.liabilities.totalLiabilities || 0)}</p>
            </div>
            <span className="text-2xl font-bold text-muted-foreground">+</span>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm min-w-[150px]">
              <p className="text-sm text-muted-foreground">Equity</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(balanceSheet?.equity.totalEquity || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
