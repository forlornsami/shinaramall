import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, TrendingDown, ShoppingBag, Package, BarChart3, Calendar } from "lucide-react";
import type { Product } from "@shared/schema";

type ProfitAnalytics = {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  orderCount: number;
  topProfitProducts: { product: Product; profit: number; quantity: number }[];
};

export default function ProfitAnalytics() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: analytics, isLoading, refetch } = useQuery<ProfitAnalytics>({
    queryKey: ['/api/admin/profit-analytics', startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await fetch(`/api/admin/profit-analytics?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const { data: inventorySummary } = useQuery<{
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
    totalCostValue: number;
  }>({
    queryKey: ['/api/admin/inventory/summary'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/inventory/summary', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch inventory summary');
      return response.json();
    },
  });

  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  const profitColor = (analytics?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600';
  const marginColor = (analytics?.margin || 0) >= 20 ? 'text-green-600' : (analytics?.margin || 0) >= 10 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <Label className="text-muted-foreground">Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" data-testid="input-start-date" />
        </div>
        <div>
          <Label className="text-muted-foreground">End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" data-testid="input-end-date" />
        </div>
        <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh-analytics">
          <Calendar className="h-4 w-4 mr-2" />
          Apply Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">
              {formatCurrency(analytics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From {analytics?.orderCount || 0} orders</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-total-cost">
              {formatCurrency(analytics?.totalCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cost of goods sold</p>
          </CardContent>
        </Card>

        <Card data-testid="card-profit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className={`h-4 w-4 ${profitColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitColor}`} data-testid="text-profit">
              {formatCurrency(analytics?.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Revenue minus cost</p>
          </CardContent>
        </Card>

        <Card data-testid="card-margin">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className={`h-4 w-4 ${marginColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${marginColor}`} data-testid="text-margin">
              {formatPercent(analytics?.margin || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(analytics?.margin || 0) >= 20 ? 'Healthy margin' : (analytics?.margin || 0) >= 10 ? 'Moderate margin' : 'Low margin'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-inventory-value">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Retail Value</p>
                  <p className="text-xl font-bold">{formatCurrency(inventorySummary?.totalValue || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost Value</p>
                  <p className="text-xl font-bold">{formatCurrency(inventorySummary?.totalCostValue || 0)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">{inventorySummary?.totalProducts || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">{inventorySummary?.totalStock || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                  <p className="text-2xl font-bold text-yellow-600">{inventorySummary?.lowStockCount || 0}</p>
                  <p className="text-sm text-yellow-600">Low Stock</p>
                </div>
                <div className="text-center p-3 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950">
                  <p className="text-2xl font-bold text-red-600">{inventorySummary?.outOfStockCount || 0}</p>
                  <p className="text-sm text-red-600">Out of Stock</p>
                </div>
              </div>
              {inventorySummary && inventorySummary.totalValue > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">Potential Profit in Inventory</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(inventorySummary.totalValue - inventorySummary.totalCostValue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margin: {formatPercent(((inventorySummary.totalValue - inventorySummary.totalCostValue) / inventorySummary.totalValue) * 100)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-top-products">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Top Profit Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!analytics?.topProfitProducts || analytics.topProfitProducts.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales data for this period</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Sold</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topProfitProducts.slice(0, 10).map((item, index) => (
                    <TableRow key={item.product.id} data-testid={`row-top-product-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>
                          <span className="font-medium truncate max-w-[180px]">{item.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(item.profit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-profit-breakdown">
        <CardHeader>
          <CardTitle>Profit Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Revenue from Sales</span>
              <span className="text-green-600 font-bold">{formatCurrency(analytics?.totalRevenue || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Cost of Goods Sold</span>
              <span className="text-orange-600 font-bold">- {formatCurrency(analytics?.totalCost || 0)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                <span className="font-bold text-lg">Gross Profit</span>
                <span className={`text-2xl font-bold ${profitColor}`}>{formatCurrency(analytics?.profit || 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
