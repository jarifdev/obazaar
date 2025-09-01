import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { isSuperAdmin } from "@/lib/access";
import { createShipment, getShipmentInfo } from "@/lib/nooloman";

// --- helpers ---
function normalizePhone(raw: string | number | null | undefined): number {
  const s = String(raw ?? "");
  const digits = s.replace(/\D/g, "");
  return Number(digits.startsWith("968") ? digits : `968${digits}`);
}

const shipOnPaid: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Only act when status flips to "paid"
  const wasPaid = previousDoc?.paymentStatus === "completed";
  const isPaid = doc?.paymentStatus === "completed";
  if (wasPaid && isPaid) return;
  if (!wasPaid && isPaid) {
    // Process Nooloman shipment creation asynchronously to avoid write conflicts
    setTimeout(async () => {
      try {
        const int_code = String(doc.orderNumber ?? doc.id);

        // If shipment already exists remotely by our integration code, reuse it
        let remote: any = null;
        try {
          remote = await getShipmentInfo({ integration_code: int_code });
        } catch {}

        if (!remote) {
          const to_state_id = Number(doc?.shipping?.stateId);
          const to_welaya_id = Number(doc?.shipping?.wilayaId);
          const to_area_id = Number(doc?.shipping?.areaId);

          console.log("Shipping data from order:", {
            stateId: doc?.shipping?.stateId,
            wilayaId: doc?.shipping?.wilayaId,
            areaId: doc?.shipping?.areaId,
            name: doc?.shipping?.name,
            phone: doc?.shipping?.phone,
            converted_state_id: to_state_id,
            converted_welaya_id: to_welaya_id,
            converted_area_id: to_area_id,
            normalized_phone: normalizePhone(doc?.shipping?.phone),
          });

          // Make sure address IDs are numeric (Nooloman requires numeric IDs)
          if (![to_state_id, to_welaya_id, to_area_id].every(Number.isFinite)) {
            console.warn(
              `Order ${doc.id}: invalid address IDs, skipping shipment creation`
            );
            return;
          }

          console.log("Creating Nooloman shipment for order:", doc.id);
          remote = await createShipment({
            int_code,
            payment_type: 2, // PREPAID since PayPal is prepaid
            receiver_name: doc?.shipping?.name,
            receiver_phone: normalizePhone(doc?.shipping?.phone),
            sender_name: "Obazaar", // or pull from a settings collection
            to_state_id,
            to_welaya_id,
            to_area_id,
            amount_to_be_collected: 0, // 0 for prepaid orders
            breakable: 0, // default to not breakable
            more_info: doc?.name ?? "",
          });
          console.log("Nooloman shipment created:", remote);
        }

        // Save shipment mapping back into the document - retry with delay to avoid conflicts
        const updateShipmentData = async (retryCount = 0): Promise<void> => {
          try {
            await req.payload.update({
              collection: "orders",
              id: doc.id,
              data: {
                shipment: {
                  shipment_id: remote?.id,
                  public_code: remote?.code,
                  integration_code: int_code,
                  status_id: remote?.status_id,
                  total_cost: remote?.total_cost,
                  last_synced_at: new Date().toISOString(),
                },
              },
            });
            console.log("Shipment data saved to order:", doc.id);
          } catch (updateError: any) {
            if (updateError.code === 112 && retryCount < 5) {
              // Write conflict, wait longer and retry
              console.log(
                `Write conflict updating order ${doc.id}, retrying in ${(retryCount + 1) * 2}s...`
              );
              setTimeout(
                () => updateShipmentData(retryCount + 1),
                (retryCount + 1) * 2000
              );
            } else {
              console.error(
                "Failed to update order with shipment data after retries:",
                updateError
              );
            }
          }
        };

        await updateShipmentData();
      } catch (error) {
        console.error("Error in Nooloman shipment creation:", error);
      }
    }, 2000); // Delay by 2 seconds to let the order processing complete
  }
};

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    // Shipping Information for Nooloman Delivery
    {
      name: "shipping",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: "Receiver Name",
        },
        {
          name: "phone",
          type: "text",
          required: true,
          label: "Receiver Phone",
        },
        {
          name: "stateId",
          type: "number",
          required: true,
          label: "State ID",
        },
        {
          name: "wilayaId",
          type: "number",
          required: true,
          label: "Wilaya ID",
        },
        {
          name: "areaId",
          type: "number",
          required: true,
          label: "Area ID",
        },
        {
          name: "address",
          type: "textarea",
          label: "Full Address",
        },
      ],
    },
    {
      name: "deliveryNotes",
      type: "textarea",
      label: "Delivery Notes",
      admin: {
        description: "Special delivery instructions",
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      hasMany: false,
    },
    {
      name: "quantity",
      type: "number",
      required: true,
      min: 1,
      defaultValue: 1,
      admin: {
        description: "Number of items purchased",
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      hasMany: false,
      admin: {
        description: "Tenant/vendor who owns the product",
      },
    },
    // PayPal fields
    {
      name: "paypalOrderId",
      type: "text",
      admin: {
        description: "PayPal Order ID",
      },
    },
    {
      name: "paypalCaptureId",
      type: "text",
      admin: {
        description: "PayPal Capture ID (transaction ID)",
      },
    },
    {
      name: "paymentStatus",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
      defaultValue: "pending",
      required: true,
    },
    {
      name: "amountPaid",
      type: "number",
      admin: {
        description: "Amount paid in USD",
      },
    },
    {
      name: "platformCommission",
      type: "number",
      admin: {
        description: "Platform commission amount in USD",
      },
    },
    {
      name: "vendorEarning",
      type: "number",
      admin: {
        description: "Vendor earning after commission in USD",
      },
    },
    {
      name: "walletTransactionProcessed",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Whether wallet transaction has been created for this order",
      },
    },
    // Nooloman shipment tracking
    {
      name: "shipment",
      type: "group",
      fields: [
        {
          name: "shipment_id",
          type: "text",
          admin: {
            description: "Nooloman shipment ID",
          },
        },
        {
          name: "public_code",
          type: "text",
          admin: {
            description: "Public tracking code",
          },
        },
        {
          name: "integration_code",
          type: "text",
          admin: {
            description: "Integration code (our order ID)",
          },
        },
        {
          name: "status_id",
          type: "number",
          admin: {
            description: "Nooloman status ID",
          },
        },
        {
          name: "total_cost",
          type: "number",
          admin: {
            description: "Total shipping cost",
          },
        },
        {
          name: "last_synced_at",
          type: "date",
          admin: {
            description: "Last sync with Nooloman API",
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [shipOnPaid],
  },
};
