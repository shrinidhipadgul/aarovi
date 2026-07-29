export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

export function getPublicUrl(key: string): string {
  if (!key) return "";
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("blob:") ||
    key.startsWith("/")
  ) {
    return key;
  }
  const base =
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? process.env.S3_PUBLIC_BASE_URL;
  if (base) {
    const cleanBase = base.replace(/\/+$/, "");
    return `${cleanBase}/${key}`;
  }
  return `/api/uploads/file?key=${encodeURIComponent(key)}`;
}

export function extractKey(url?: string): string | null {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const u = new URL(url);
      const path = u.pathname.replace(/^\//, "");
      return path || null;
    } catch {
      return null;
    }
  }

  return url.replace(/^\//, "");
}

export function buildS3Key({
  namespace,
  fileName,
  ext,
}: {
  namespace: string;
  fileName?: string;
  ext?: string;
}): string {
  const prefix = (process.env.S3_KEY_PREFIX ?? "").replace(/\/+$/, "");
  const ts = Date.now();
  const nonce = crypto.randomUUID().slice(0, 8);

  const resolvedExt =
    ext ?? (fileName ? fileName.split(".").pop() : "bin");

  const safeName =
    fileName
      ?.replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 64) ?? nonce;

  return `${prefix ? `${prefix}/` : ""}${namespace}/${ts}-${nonce}-${safeName}.${resolvedExt}`;
}
