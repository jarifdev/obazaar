import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPayload } from "payload";
import config from "@/payload.config";
import { walletService } from "@/lib/wallet-service";

export async function POST(req: NextRequest) {
  try {
    const { orderID, orderData } = await req.json();

    const captureData = await capturePayPalOrder(orderID);

    if (captureData.status === "COMPLETED") {
      const payload = await getPayload({ config });

      // Find all orders with this PayPal order ID
      const orders = await payload.find({
        collection: "orders",
        depth: 1, // Include related product data
        where: {
          paypalOrderId: {
            equals: orderID,
          },
        },
      });

      console.log(
        `Found ${orders.docs.length} orders for PayPal order ${orderID}`
      );

      if (orders.docs.length > 0) {
        const captureId = captureData.purchase_units[0].payments.captures[0].id;

        // Update all orders with payment completion and process wallet earnings
        for (const order of orders.docs) {
          try {
            // Update order with payment completion
            await payload.update({
              collection: "orders",
              id: order.id,
              data: {
                paymentStatus: "completed",
                paypalCaptureId: captureId,
              },
            });

            console.log(`Updated order ${order.id} to completed status`);

            // Reduce inventory for the product if inventory tracking is enabled
            if (typeof order.product === "object" && order.product) {
              const product = order.product;
              if (product.trackInventory && typeof product.stock === "number") {
                const newStock = Math.max(
                  0,
                  product.stock - (order.quantity || 1)
                );

                await payload.update({
                  collection: "products",
                  id: product.id,
                  data: {
                    stock: newStock,
                  },
                });

                console.log(
                  `Reduced stock for product ${product.id} from ${product.stock} to ${newStock}`
                );
              }
            } else if (typeof order.product === "string") {
              // If product is just an ID, fetch it first
              const productData = await payload.findByID({
                collection: "products",
                id: order.product,
              });

              if (
                productData.trackInventory &&
                typeof productData.stock === "number"
              ) {
                const newStock = Math.max(
                  0,
                  productData.stock - (order.quantity || 1)
                );

                await payload.update({
                  collection: "products",
                  id: productData.id,
                  data: {
                    stock: newStock,
                  },
                });

                console.log(
                  `Reduced stock for product ${productData.id} from ${productData.stock} to ${newStock}`
                );
              }
            }

            // Process wallet earning for this order
            await walletService.processOrderEarning(order.id);
            console.log(`Processed wallet earning for order ${order.id}`);
          } catch (orderError) {
            console.error(`Error processing order ${order.id}:`, orderError);
            // Continue with other orders even if one fails
          }
        }
      } else {
        console.warn(`No orders found for PayPal order ID: ${orderID}`);
      }
    }

    return NextResponse.json(captureData);
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal payment" },
      { status: 500 }
    );
  }
}
