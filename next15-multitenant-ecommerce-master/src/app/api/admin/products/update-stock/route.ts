import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, stock } = await req.json();

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json(
        { error: "Invalid stock value" },
        { status: 400 }
      );
    }

    // Find the product and verify ownership
    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 1,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user owns this product through their tenant
    const userTenants = session.user.tenants;
    const productTenant =
      typeof product.tenant === "object" ? product.tenant : null;

    if (
      !productTenant ||
      !userTenants?.some(
        (ut: any) =>
          (typeof ut.tenant === "object" ? ut.tenant.id : ut.tenant) ===
          productTenant.id
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the product stock
    const updatedProduct = await payload.update({
      collection: "products",
      id: productId,
      data: {
        stock: stock,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Stock update error:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
