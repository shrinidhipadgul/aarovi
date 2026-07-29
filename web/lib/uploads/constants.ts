export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"] as const;

export const MAX_SIZE = 5 * 1024 * 1024;

export const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable";
