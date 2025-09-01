import axios from "axios";

const BASE = process.env.NOOLOMAN_BASE_URL ?? "https://nooloman.dev/apiv2";
let cachedToken: string | null = null;

function pickResult<T = any>(data: any): T {
  // API sometimes returns "result" or "resulte"
  return (data?.result ?? data?.resulte) as T;
}

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const { data } = await axios.post(
    `${BASE}/client/token`,
    {
      phone: Number(process.env.NOOLOMAN_PHONE),
      password: process.env.NOOLOMAN_PASSWORD,
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const token = pickResult<{ api_token?: string }>(data)?.api_token;
  if (!token) throw new Error("Nooloman token missing");
  cachedToken = token;
  return token;
}

export type CreateShipmentPayload = {
  int_code: string; // your order number
  payment_type: 1 | 2; // 1=POSTPAID (COD), 2=PREPAID
  receiver_name: string;
  receiver_phone: number; // include country code
  sender_name: string;
  to_area_id: number;
  to_state_id: number;
  to_welaya_id: number;
  amount_to_be_collected: number; // 0 if prepaid
  breakable?: 0 | 1;
  more_info?: string;
  truecost?: number;
};

export async function createShipment(payload: CreateShipmentPayload) {
  try {
    const token = await getToken();
    console.log(
      "Nooloman createShipment payload:",
      JSON.stringify(payload, null, 2)
    );

    const requestData = { ...payload, token };
    console.log(
      "Nooloman API request data:",
      JSON.stringify(requestData, null, 2)
    );

    const { data } = await axios.post(`${BASE}/shipments/create`, requestData, {
      headers: { "Content-Type": "application/json" },
    });
    return pickResult(data); // { id, code, status_id, total_cost, ... }
  } catch (e: any) {
    console.error("Nooloman API Error Details:", {
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      data: e?.response?.data,
      config: {
        url: e?.config?.url,
        method: e?.config?.method,
        data: e?.config?.data,
      },
    });

    if (e?.response?.status === 401) {
      cachedToken = null;
      return createShipment(payload);
    }
    throw e;
  }
}
export async function getShipmentInfo(by: {
  id?: string;
  code?: string;
  integration_code?: string;
}) {
  const token = await getToken();
  // NOTE: docs specify POST body for getinfo
  const { data } = await axios.post(
    `${BASE}/shipments/getinfo`,
    { ...by, token },
    { headers: { "Content-Type": "application/json" } }
  );
  return pickResult(data); // single object
}

export async function listShipments(
  params: { page?: number; perpage?: number } = {}
) {
  const token = await getToken();
  const search = new URLSearchParams({ token });
  if (params.page) search.set("page", String(params.page));
  if (params.perpage) search.set("perpage", String(params.perpage));
  const { data } = await axios.get(
    `${BASE}/shipments/list?${search.toString()}`
  );
  return pickResult<any[]>(data); // array
}

export async function getTracking(id: string) {
  const token = await getToken();
  const search = new URLSearchParams({ id, token });
  const { data } = await axios.get(
    `${BASE}/shipments/tracking?${search.toString()}`
  );
  return pickResult<any[]>(data); // [{info: {...}}, {status_id, tracking_info, date_time}, ...]
}
