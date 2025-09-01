"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";

interface WalletData {
  balance: {
    available: number;
    pending: number;
    total: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    createdAt: string;
  }>;
  pendingPayouts: Array<{
    id: string;
    amount: number;
    status: string;
    requestedAt: string;
  }>;
}

export const WalletDashboard = () => {
  const [payoutAmount, setPayoutAmount] = useState("");
  const queryClient = useQueryClient();

  const {
    data: walletData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wallet"],
    queryFn: async (): Promise<WalletData> => {
      const response = await fetch("/api/wallet");
      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }
      return response.json();
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch("/api/wallet/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to request payout");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Payout request submitted successfully!");
      setPayoutAmount("");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const releaseFundsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/wallet/release-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to release funds");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Held funds released successfully");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handlePayout = () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!walletData || amount > walletData.balance.available) {
      toast.error("Insufficient available balance");
      return;
    }

    payoutMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <XCircleIcon className="mx-auto h-12 w-12 mb-4" />
              <p>Failed to load wallet data. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earning":
        return <DollarSignIcon className="h-4 w-4 text-green-600" />;
      case "payout":
        return <DollarSignIcon className="h-4 w-4 text-red-600" />;
      case "hold_release":
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      processing: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(walletData?.balance.available || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Balance
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(walletData?.balance.pending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Being held for security
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(walletData?.balance.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request */}
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              min="0"
              step="0.01"
              className="flex-1"
            />
            <Button
              onClick={handlePayout}
              disabled={
                payoutMutation.isPending || !walletData?.balance.available
              }
            >
              {payoutMutation.isPending ? "Processing..." : "Request Payout"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Available for withdrawal:{" "}
            {formatCurrency(walletData?.balance.available || 0)}
          </p>
          <p className="text-sm text-yellow-600">
            ⚠️ Make sure your PayPal email is set in the admin panel under
            Tenants before requesting payouts.
          </p>
        </CardContent>
      </Card>

      {/* Release Funds (Admin Only) */}
      <Card>
        <CardHeader>
          <CardTitle>Release Held Funds (Testing)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => releaseFundsMutation.mutate()}
            disabled={releaseFundsMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {releaseFundsMutation.isPending
              ? "Releasing..."
              : "Release All Eligible Funds"}
          </Button>
          <p className="text-sm text-muted-foreground">
            This will release any funds that have passed their hold period
            (currently 1 minute for testing).
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {walletData?.transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {walletData?.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Payouts */}
      {walletData?.pendingPayouts && walletData.pendingPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletData.pendingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Payout Request #{payout.id.slice(-6)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested on{" "}
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(payout.amount)}
                    </p>
                    {getStatusBadge(payout.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
