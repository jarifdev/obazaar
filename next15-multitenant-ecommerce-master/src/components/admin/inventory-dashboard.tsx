"use client";

import { useState } from "react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PackageIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface InventoryItemProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    trackInventory: boolean;
    lowStockThreshold: number;
    allowBackorders: boolean;
    image?: { url: string } | null;
  };
  onStockUpdate: (productId: string, newStock: number) => void;
}

const InventoryItem = ({ product, onStockUpdate }: InventoryItemProps) => {
  const [newStock, setNewStock] = useState(product.stock.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const isLowStock =
    product.trackInventory &&
    product.stock <= product.lowStockThreshold &&
    product.stock > 0;
  const isOutOfStock =
    product.trackInventory && product.stock === 0 && !product.allowBackorders;

  const handleStockUpdate = async () => {
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock number");
      return;
    }

    setIsUpdating(true);
    try {
      await onStockUpdate(product.id, stockValue);
      toast.success(`Stock updated for ${product.name}`);
    } catch (error) {
      toast.error("Failed to update stock");
      setNewStock(product.stock.toString()); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
          <div className="flex gap-2">
            {isOutOfStock && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangleIcon className="h-3 w-3" />
                Out of Stock
              </Badge>
            )}
            {isLowStock && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-orange-100 text-orange-800"
              >
                <TrendingDownIcon className="h-3 w-3" />
                Low Stock
              </Badge>
            )}
            {!isLowStock && !isOutOfStock && product.trackInventory && (
              <Badge
                variant="default"
                className="flex items-center gap-1 bg-green-100 text-green-800"
              >
                <TrendingUpIcon className="h-3 w-3" />
                In Stock
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Price</p>
            <p className="font-medium">{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-gray-600">Current Stock</p>
            <p className="font-medium">{product.stock}</p>
          </div>
        </div>

        {product.trackInventory && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="New stock quantity"
                className="flex-1"
              />
              <Button
                onClick={handleStockUpdate}
                disabled={isUpdating || newStock === product.stock.toString()}
                className="px-6"
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              <p>Low stock threshold: {product.lowStockThreshold}</p>
              {product.allowBackorders && <p>Backorders are allowed</p>}
            </div>
          </div>
        )}

        {!product.trackInventory && (
          <div className="text-sm text-gray-500 italic">
            Inventory tracking is disabled for this product
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const InventoryDashboard = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: products } = useSuspenseQuery(
    trpc.tenants.getMyProducts.queryOptions()
  );

  const updateStockMutation = useMutation({
    mutationFn: async ({
      productId,
      stock,
    }: {
      productId: string;
      stock: number;
    }) => {
      const response = await fetch("/api/admin/products/update-stock", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, stock }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.tenants.getMyProducts.queryOptions().queryKey,
      });
    },
  });

  const handleStockUpdate = async (productId: string, newStock: number) => {
    await updateStockMutation.mutateAsync({ productId, stock: newStock });
  };

  const trackingProducts = products?.docs.filter((p) => p.trackInventory) || [];
  const lowStockProducts = trackingProducts.filter(
    (p) =>
      p.lowStockThreshold != null &&
      p.stock <= p.lowStockThreshold &&
      p.stock > 0
  );
  const outOfStockProducts = trackingProducts.filter(
    (p) => p.stock === 0 && !p.allowBackorders
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your product inventory
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <PackageIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold">{products?.totalDocs || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tracking Inventory
              </p>
              <p className="text-2xl font-bold">{trackingProducts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingDownIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Inventory List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Product Inventory</h2>

        {products?.docs && products.docs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.docs.map((product) => (
              <InventoryItem
                key={product.id}
                product={{
                  ...product,
                  trackInventory: product.trackInventory ?? false,
                  lowStockThreshold: product.lowStockThreshold ?? 0,
                  allowBackorders: product.allowBackorders ?? false,
                  image: product.image
                    ? typeof product.image === "object" &&
                      "url" in product.image
                      ? { url: (product.image as any).url }
                      : null
                    : null,
                }}
                onStockUpdate={handleStockUpdate}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-gray-600">
                Create your first product to start managing inventory.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
