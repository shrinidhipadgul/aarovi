export const adminEmail = process.env.ADMIN_EMAIL ?? "";
export const adminPassword = process.env.ADMIN_PASSWORD ?? "";

export function isAdminConfigured(): boolean {
  return Boolean(adminEmail && adminPassword);
}

let warned = false;

export function warnIfAdminNotConfigured(): void {
  if (warned || isAdminConfigured()) return;
  warned = true;
  if (!adminEmail) {
    console.warn(
      "[admin] ADMIN_EMAIL is not set — admin routes will be inaccessible.",
    );
  }
  if (!adminPassword) {
    console.warn(
      "[admin] ADMIN_PASSWORD is not set — the admin user cannot be provisioned.",
    );
  }
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email || !adminEmail) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}