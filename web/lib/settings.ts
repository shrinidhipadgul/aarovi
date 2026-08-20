import { prisma } from "@/lib/prisma";
import { getPublicUrl } from "@/lib/uploads/storage";

export const DEFAULT_PAYMENT_QR_URL = getPublicUrl("settings/payment-qr.jpeg");
export const DEFAULT_UPI_ID = "";
export const DEFAULT_ACCOUNT_NAME = "Aarovi";
export const DEFAULT_PAYMENT_INSTRUCTIONS =
  "Scan the QR code using any UPI app (GPay, PhonePe, Paytm, Cred, BHIM) to complete the payment. After payment, enter your UPI Transaction / UTR ID or attach a screenshot.";

export interface PaymentSettings {
  qrCodeUrl: string;
  upiId: string;
  accountName: string;
  instructions: string;
}

export async function getSetting(
  key: string,
  defaultValue = "",
): Promise<string> {
  try {
    const record = await prisma.setting.findUnique({
      where: { key },
    });
    return record?.value ?? defaultValue;
  } catch (err) {
    console.error(`[settings] Failed to get setting "${key}":`, err);
    return defaultValue;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const records = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "payment_qr_url",
            "payment_upi_id",
            "payment_account_name",
            "payment_instructions",
          ],
        },
      },
    });

    const map = new Map(records.map((r) => [r.key, r.value]));
    const rawQr = map.get("payment_qr_url") || DEFAULT_PAYMENT_QR_URL;

    return {
      qrCodeUrl: getPublicUrl(rawQr),
      upiId: map.get("payment_upi_id") || DEFAULT_UPI_ID,
      accountName: map.get("payment_account_name") || DEFAULT_ACCOUNT_NAME,
      instructions:
        map.get("payment_instructions") || DEFAULT_PAYMENT_INSTRUCTIONS,
    };
  } catch (err) {
    console.error("[settings] Failed to get payment settings:", err);
    return {
      qrCodeUrl: DEFAULT_PAYMENT_QR_URL,
      upiId: DEFAULT_UPI_ID,
      accountName: DEFAULT_ACCOUNT_NAME,
      instructions: DEFAULT_PAYMENT_INSTRUCTIONS,
    };
  }
}
