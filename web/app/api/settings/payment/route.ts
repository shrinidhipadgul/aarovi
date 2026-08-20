import { withErrorHandler } from "@/lib/with-error-handler";
import { successResponse } from "@/lib/api-response";
import { getPaymentSettings } from "@/lib/settings";

export const GET = withErrorHandler(async () => {
  const settings = await getPaymentSettings();
  return successResponse(settings);
});
