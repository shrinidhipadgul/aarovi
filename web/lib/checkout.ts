import { createHmac } from "node:crypto";

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 999;

export interface CheckoutItem {
  price: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function calculateTotals(items: CheckoutItem[]): OrderTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
}

export interface AddressInput {
  fullName?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export function validateAddress(address: AddressInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!address.fullName || address.fullName.trim().length < 2) {
    errors.fullName = "Full name is required";
  }
  if (!address.phone || !/^[6-9]\d{9}$/.test(address.phone.trim())) {
    errors.phone = "Enter a valid 10-digit phone number";
  }
  if (!address.line1 || address.line1.trim().length < 5) {
    errors.line1 = "Address line is required";
  }
  if (!address.city || address.city.trim().length < 2) {
    errors.city = "City is required";
  }
  if (!address.state || address.state.trim().length < 2) {
    errors.state = "State is required";
  }
  if (!address.pincode || !/^\d{6}$/.test(address.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }

  return errors;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

const RAZORPAY_API = "https://api.razorpay.com/v1";

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
}

export async function createRazorpayOrder(
  amountInRupees: number,
): Promise<RazorpayOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured");
  }

  const amountInPaise = Math.round(amountInRupees * 100);

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed: ${text}`);
  }

  const data = (await res.json()) as RazorpayOrderResult;
  return data;
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expected = createHmac("sha256", keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  return expected === params.razorpaySignature;
}
