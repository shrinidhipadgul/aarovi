import { requireAdmin } from "@/lib/api-require-admin";
import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getPaymentSettings, setSetting } from "@/lib/settings";

const getSettings = async () => {
  const payment = await getPaymentSettings();
  return successResponse({
    payment,
  });
};

const updateSettings = async (req: Request) => {
  const body = (await req.json()) as {
    payment_qr_url?: string;
    payment_upi_id?: string;
    payment_account_name?: string;
    payment_instructions?: string;
  };

  if (body.payment_qr_url !== undefined) {
    await setSetting("payment_qr_url", body.payment_qr_url.trim());
  }
  if (body.payment_upi_id !== undefined) {
    await setSetting("payment_upi_id", body.payment_upi_id.trim());
  }
  if (body.payment_account_name !== undefined) {
    await setSetting("payment_account_name", body.payment_account_name.trim());
  }
  if (body.payment_instructions !== undefined) {
    await setSetting("payment_instructions", body.payment_instructions.trim());
  }

  const payment = await getPaymentSettings();
  return successResponse({
    payment,
    message: "Settings updated successfully",
  });
};

export const GET = requireAdmin(withErrorHandler(getSettings));
export const PUT = requireAdmin(withErrorHandler(updateSettings));
