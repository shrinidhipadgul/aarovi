export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function trackingUrl(orderId: string): string {
  return `${siteUrl()}/status/${orderId}`;
}