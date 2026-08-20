export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

export function getPublicUrl(key: string): string {
  if (!key) return "";
  if (
    key.startsWith("blob:") ||
    key.startsWith("/api/uploads/file") ||
    key.startsWith("/images/") ||
    key.startsWith("/uploads/")
  ) {
    return key;
  }

  const base =
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? process.env.S3_PUBLIC_BASE_URL;

  // If it's a full http/https URL
  if (key.startsWith("http://") || key.startsWith("https://")) {
    if (base && key.startsWith(base)) {
      return key;
    }
    // If it's a direct AWS S3 URL and no public CDN base is configured, proxy it
    if (
      key.includes(".s3.") ||
      key.includes(".s3-") ||
      key.includes(".amazonaws.com")
    ) {
      const extracted = extractKey(key);
      if (extracted) {
        return `/api/uploads/file?key=${encodeURIComponent(extracted)}`;
      }
    }
    return key;
  }

  const cleanKey = key.replace(/^\/+/, "");
  if (base) {
    const cleanBase = base.replace(/\/+$/, "");
    return `${cleanBase}/${cleanKey}`;
  }
  return `/api/uploads/file?key=${encodeURIComponent(cleanKey)}`;
}

export function extractKey(url?: string): string | null {
  if (!url) return null;

  try {
    const u = url.startsWith("http://") || url.startsWith("https://")
      ? new URL(url)
      : new URL(url, "http://localhost");

    if (u.searchParams.has("key")) {
      const k = u.searchParams.get("key");
      return k ? k.replace(/^\/+/, "") : null;
    }
    const path = u.pathname.replace(/^\/+/, "");
    return path || null;
  } catch {
    return url.replace(/^\/+/, "") || null;
  }
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
