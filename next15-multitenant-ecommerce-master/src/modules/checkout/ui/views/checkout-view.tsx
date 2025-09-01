"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InboxIcon, LoaderIcon, CircleXIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import {
  ShippingForm,
  type ShippingFormData,
} from "@/components/shipping-form";
import { useTRPC } from "@/trpc/client";
import { generateTenantURL, formatCurrency } from "@/lib/utils";

import { useCart } from "../../hooks/use-cart";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { useCheckoutStates } from "../../hooks/use-checkout-states";

declare global {
  interface Window {
    paypal: any;
  }
}

interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {
  const router = useRouter();
  const [states, setStates] = useCheckoutStates();
  const [isPayPalReady, setIsPayPalReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<"shipping" | "payment">(
    "shipping"
  );
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(
    null
  );
  const { items, removeProduct, updateQuantity, clearCart } =
    useCart(tenantSlug);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Check if user is logged in
  const session = useQuery(trpc.auth.session.queryOptions());

  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      items: items,
    })
  );

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart cleared");
    }
  }, [error, clearCart]);

  // Redirect to sign-in if user is not logged in and has items in cart
  useEffect(() => {
    if (session.data !== undefined && !session.data?.user && items.length > 0) {
      toast.error("Please log in to complete your purchase");
      try {
        router.push("/sign-in");
      } catch (error) {
        console.error("Navigation failed:", error);
        window.location.href = "/sign-in";
      }
    }
  }, [session.data, items.length, router]);

  // Render PayPal buttons when SDK is ready and we have products and user is authenticated and shipping data
  useEffect(() => {
    if (
      isPayPalReady &&
      window.paypal &&
      data &&
      data.totalDocs > 0 &&
      session.data?.user &&
      currentStep === "payment" &&
      shippingData
    ) {
      const container = document.getElementById("paypal-button-container");
      if (container) {
        container.innerHTML = "";

        window.paypal
          .Buttons({
            createOrder: async () => {
              try {
                const orderData = {
                  totalAmount: data.totalPrice,
                  products: data.docs.map((product) => ({
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                  })),
                };

                const response = await fetch(
                  "/api/payment/paypal/create-order",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      amount: orderData.totalAmount,
                      items: orderData.products,
                      cartItems: items, // Send cart items with quantities
                      tenantSlug: tenantSlug,
                      shippingData: shippingData, // Include shipping data
                    }),
                  }
                );

                const paypalOrder = await response.json();

                if (!response.ok) {
                  // Check if it's an authentication error
                  if (response.status === 401 && paypalOrder.requiresAuth) {
                    toast.error(
                      paypalOrder.error ||
                        "Please log in to complete your purchase"
                    );
                    try {
                      router.push("/sign-in");
                    } catch (error) {
                      console.error("Navigation failed:", error);
                      window.location.href = "/sign-in";
                    }
                    return;
                  }

                  throw new Error(
                    paypalOrder.error || "Failed to create PayPal order"
                  );
                }

                return paypalOrder.id;
              } catch (error) {
                console.error("Error creating PayPal order:", error);
                toast.error("Failed to create payment order");
                throw error;
              }
            },
            onApprove: async (data: any) => {
              try {
                setIsProcessing(true);

                const captureResponse = await fetch(
                  "/api/payment/paypal/capture-order",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orderID: data.orderID,
                    }),
                  }
                );

                const captureResult = await captureResponse.json();

                if (captureResult.status === "COMPLETED") {
                  setStates({ success: true, cancel: false });
                  clearCart();
                  queryClient.invalidateQueries(
                    trpc.library.getMany.infiniteQueryFilter()
                  );
                  toast.success("Payment successful!");

                  // Robust navigation to home page after successful payment
                  try {
                    router.replace("/");
                    // Fallback if router doesn't work
                    setTimeout(() => {
                      if (window.location.pathname !== "/") {
                        window.location.href = "/";
                      }
                    }, 100);
                  } catch (error) {
                    console.error("Router navigation failed:", error);
                    window.location.href = "/";
                  }
                } else {
                  throw new Error("Payment capture failed");
                }
              } catch (error) {
                console.error("Payment capture error:", error);
                toast.error("Payment failed. Please try again.");
                setIsProcessing(false);
              }
            },
            onCancel: () => {
              setIsProcessing(false);
              setStates({ success: false, cancel: true });
              toast.info("Payment cancelled");
            },
            onError: (err: any) => {
              console.error("PayPal error:", err);
              toast.error("Payment failed. Please try again.");
              setIsProcessing(false);
            },
          })
          .render("#paypal-button-container");
      }
    }
  }, [
    isPayPalReady,
    data,
    session.data?.user,
    currentStep,
    shippingData,
    clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
    items,
    tenantSlug,
  ]);

  if (isLoading) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load PayPal SDK */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        onLoad={() => setIsPayPalReady(true)}
        strategy="lazyOnload"
      />

      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="border rounded-md overflow-hidden bg-white">
              {data?.docs.map((product, index) => {
                const maxQuantity = product.trackInventory
                  ? product.allowBackorders
                    ? 999
                    : Math.max(0, product.stock || 0)
                  : 999;

                return (
                  <CheckoutItem
                    key={product.id}
                    isLast={index === data.docs.length - 1}
                    imageUrl={product.image?.url}
                    name={product.name}
                    productUrl={`${generateTenantURL(product.tenant.slug)}/products/${product.id}`}
                    tenantUrl={generateTenantURL(product.tenant.slug)}
                    tenantName={product.tenant.name}
                    price={product.price}
                    quantity={product.quantity}
                    maxQuantity={maxQuantity}
                    onRemove={() => removeProduct(product.id)}
                    onQuantityChange={(quantity) =>
                      updateQuantity(product.id, quantity)
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Shipping and Payment */}
            <div className="border rounded-md overflow-hidden bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-medium text-lg">Total</h4>
                <p className="font-medium text-lg">
                  {formatCurrency(data?.totalPrice || 0)}
                </p>
              </div>

              {!session.data?.user ? (
                // Show login prompt if user is not authenticated
                <div className="text-center space-y-4 p-4">
                  <p className="text-gray-600">
                    Please log in to complete your purchase
                  </p>
                  <Button
                    onClick={() => {
                      try {
                        router.push("/sign-in");
                      } catch (error) {
                        console.error("Navigation failed:", error);
                        window.location.href = "/sign-in";
                      }
                    }}
                    className="w-full bg-[#1c476f] hover:bg-[#0f2c47] text-white"
                    size="lg"
                  >
                    Log In to Checkout
                  </Button>
                </div>
              ) : (
                <>
                  {/* Step indicator */}
                  <div className="flex items-center justify-center space-x-4 p-4 border-b bg-gray-50">
                    <div
                      className={`flex items-center space-x-2 ${currentStep === "shipping" ? "text-blue-600" : shippingData ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === "shipping" ? "bg-blue-600 text-white" : shippingData ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}
                      >
                        1
                      </div>
                      <span className="text-sm font-medium">Shipping</span>
                    </div>
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div
                      className={`flex items-center space-x-2 ${currentStep === "payment" ? "text-blue-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === "payment" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
                      >
                        2
                      </div>
                      <span className="text-sm font-medium">Payment</span>
                    </div>
                  </div>

                  <div className="p-4">
                    {currentStep === "shipping" ? (
                      <div className="space-y-4">
                        <h5 className="font-medium text-lg mb-4">
                          Shipping Information
                        </h5>
                        <ShippingForm
                          onSubmit={(data) => {
                            setShippingData(data);
                            setCurrentStep("payment");
                          }}
                          defaultValues={shippingData || undefined}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Shipping summary */}
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium">Shipping To:</h6>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep("shipping")}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </Button>
                          </div>
                          {shippingData && (
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="font-medium">{shippingData.shipping.name}</p>
                              <p>{shippingData.shipping.phone}</p>
                              <p>{shippingData.shipping.address}</p>
                              <p>
                                {shippingData.shipping.areaId}, {shippingData.shipping.wilayaId}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* PayPal payment */}
                        <div>
                          <h5 className="font-medium text-lg mb-4">Payment</h5>
                          <div id="paypal-button-container"></div>
                          {!isPayPalReady && (
                            <div className="text-center text-gray-500">
                              Loading PayPal...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {states.cancel && (
                <div className="p-4 flex justify-center items-center border-t">
                  <div className="bg-red-100 border border-red-400 font-medium px-4 py-3 rounded flex items-center w-full">
                    <div className="flex items-center">
                      <CircleXIcon className="size-6 mr-2 fill-red-500 text-red-100" />
                      <span>Checkout cancelled.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
