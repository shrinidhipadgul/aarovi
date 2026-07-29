import type { NextConfig } from "next";

function buildRemotePatterns() {
  const patterns: { protocol: "http" | "https"; hostname: string }[] = [
    { protocol: "http" as const, hostname: "localhost" },
  ];

  const baseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (baseUrl) {
    try {
      const hostname = new URL(baseUrl).hostname;
      patterns.push({ protocol: "https" as const, hostname });
    } catch {
      // invalid URL, skip
    }
  } else {
    patterns.push(
      { protocol: "https" as const, hostname: "*.s3.amazonaws.com" },
      { protocol: "https" as const, hostname: "*.s3.*.amazonaws.com" },
    );
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;
