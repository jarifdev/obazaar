import axios from "axios";

const PAYPAL_API_URL =
  process.env.PAYPAL_MODE === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Get PayPal access token
export async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    `${PAYPAL_API_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

// Create PayPal order
export async function createPayPalOrder(
  amount: number,
  items: any[],
  shippingFormData?: {
    shipping: {
      name: string;
      phone: string;
      stateId: number;
      wilayaId: number;
      areaId: number;
      address: string;
    };
    deliveryNotes?: string;
  }
) {
  const accessToken = await getPayPalAccessToken();

  const purchaseUnit: any = {
    amount: {
      currency_code: "USD", // Change to OMR if needed
      value: amount.toFixed(2),
      breakdown: {
        item_total: {
          currency_code: "USD",
          value: amount.toFixed(2),
        },
      },
    },
    items: items.map((item) => ({
      name: item.name,
      unit_amount: {
        currency_code: "USD",
        value: item.price.toFixed(2),
      },
      quantity: item.quantity ? item.quantity.toString() : "1",
    })),
  };

  // Add shipping information if provided
  if (shippingFormData?.shipping) {
    const shipping = shippingFormData.shipping;
    purchaseUnit.shipping = {
      name: {
        full_name: shipping.name,
      },
      address: {
        address_line_1: shipping.address,
        address_line_2: "",
        admin_area_2: `Area ${shipping.areaId}`, // Use area ID as fallback
        admin_area_1: `Wilaya ${shipping.wilayaId}`, // Use wilaya ID as fallback
        postal_code: "100",
        country_code: "OM",
      },
    };
  }

  const order = {
    intent: "CAPTURE",
    purchase_units: [purchaseUnit],
    application_context: {
      brand_name: "Obazaar Marketplace",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      shipping_preference: shippingFormData?.shipping
        ? "SET_PROVIDED_ADDRESS"
        : "GET_FROM_FILE",
    },
  };

  const response = await axios.post(
    `${PAYPAL_API_URL}/v2/checkout/orders`,
    order,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("PayPal order created successfully:", response.data);
  return response.data;
}

// Capture PayPal order
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.post(
    `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

// Send PayPal payout to vendor
export async function createPayPalPayout(
  recipientEmail: string,
  amount: number,
  note: string = "Marketplace payout"
) {
  const accessToken = await getPayPalAccessToken();

  const payout = {
    sender_batch_header: {
      sender_batch_id: `payout_${Date.now()}`,
      email_subject: "You have a payment from Obazaar Marketplace",
      email_message:
        "You have received a payment from Obazaar Marketplace. Thank you for your business!",
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: {
          value: amount.toFixed(2),
          currency: "USD",
        },
        receiver: recipientEmail,
        note: note,
        sender_item_id: `item_${Date.now()}`,
      },
    ],
  };

  const response = await axios.post(
    `${PAYPAL_API_URL}/v1/payments/payouts`,
    payout,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

// Get payout status
export async function getPayPalPayoutStatus(payoutBatchId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await axios.get(
    `${PAYPAL_API_URL}/v1/payments/payouts/${payoutBatchId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
