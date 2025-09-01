import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    if (!session.user) {
      return NextResponse.json(
        {
          error: "Please log in to complete your purchase",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const { amount, items, cartItems, tenantSlug, shippingData } =
      await req.json();

    console.log("PayPal Order Creation - Received data:", {
      amount,
      items: items?.length,
      cartItems: cartItems?.length,
      tenantSlug,
      shippingData: shippingData?.shipping
        ? "Has shipping data"
        : "No shipping data",
    });

    // Extract product IDs from cart items
    const productIds = cartItems.map((item: any) => item.productId);

    // Create quantity map for easy lookup
    const quantityMap = Object.fromEntries(
      cartItems.map((item: any) => [item.productId, item.quantity])
    );

    // Get tenant information
    const tenantsData = await payload.find({
      collection: "tenants",
      limit: 1,
      pagination: false,
      where: {
        slug: {
          equals: tenantSlug,
        },
      },
    });

    const tenant = tenantsData.docs[0];
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get products to verify they exist and belong to this tenant
    const products = await payload.find({
      collection: "products",
      where: {
        and: [
          {
            id: {
              in: productIds,
            },
          },
          {
            "tenant.slug": {
              equals: tenantSlug,
            },
          },
        ],
      },
    });

    if (products.totalDocs !== productIds.length) {
      return NextResponse.json({ error: "Invalid products" }, { status: 400 });
    }

    // Validate stock availability before creating order
    const stockErrors: string[] = [];
    for (const product of products.docs) {
      const requestedQuantity = quantityMap[product.id] || 1;
      if (product.trackInventory && !product.allowBackorders) {
        if ((product.stock || 0) < requestedQuantity) {
          stockErrors.push(
            `${product.name}: Only ${product.stock || 0} items available, but ${requestedQuantity} requested`
          );
        }
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          error: `Insufficient stock: ${stockErrors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create PayPal order with shipping data
    let paypalOrder;
    try {
      paypalOrder = await createPayPalOrder(amount, items, shippingData);
      console.log("PayPal order created:", paypalOrder.id);
    } catch (paypalError: any) {
      console.error("PayPal order creation failed:", paypalError);
      return NextResponse.json(
        {
          error: `PayPal API error: ${paypalError?.message || "Unknown error"}`,
        },
        { status: 500 }
      );
    }

    // Create order records in our database for each product
    const orderPromises = products.docs.map(async (product) => {
      const quantity = quantityMap[product.id] || 1;
      const totalPrice = product.price * quantity;

      // Calculate commission (5% platform fee)
      const platformCommission = totalPrice * 0.05;
      const vendorEarning = totalPrice - platformCommission;

      return payload.create({
        collection: "orders",
        data: {
          name: `Order for ${product.name} (x${quantity})`,
          user: session.user!.id,
          product: product.id,
          quantity: quantity,
          tenant: tenant.id,
          paypalOrderId: paypalOrder.id,
          paymentStatus: "pending",
          amountPaid: totalPrice,
          platformCommission,
          vendorEarning,
          walletTransactionProcessed: false,
          ...(shippingData?.shipping && {
            shipping: {
              name: shippingData.shipping.name,
              phone: shippingData.shipping.phone,
              stateId: shippingData.shipping.stateId,
              wilayaId: shippingData.shipping.wilayaId,
              areaId: shippingData.shipping.areaId,
              address: shippingData.shipping.address,
            },
          }),
        },
      });
    });

    await Promise.all(orderPromises);

    return NextResponse.json({
      id: paypalOrder.id,
      status: paypalOrder.status,
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
