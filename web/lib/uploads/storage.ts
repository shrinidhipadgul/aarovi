export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

export function getPublicUrl(key: string): string {
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (base) {
    const cleanBase = base.replace(/\/+$/, "");
    return `${cleanBase}/${key}`;
  }
  const region = process.env.AWS_REGION ?? "us-east-1";
  const bucket = process.env.S3_BUCKET_NAME ?? "aarovi";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
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
