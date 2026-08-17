import type { NextConfig } from "next";

function buildRemotePatterns() {
  const patterns: { protocol: "http" | "https"; hostname: string; pathname?: string }[] = [
    { protocol: "http" as const, hostname: "localhost" },
    { protocol: "https" as const, hostname: "localhost" },
  ];

  const bucket =
    process.env.S3_BUCKET_NAME || process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const region =
    process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION;
  const baseUrl =
    process.env.S3_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL;

  if (baseUrl) {
    try {
      const hostname = new URL(baseUrl).hostname;
      patterns.push({ protocol: "https" as const, hostname });
    } catch {
      // invalid URL, skip
    }
  }

  if (bucket) {
    patterns.push(
      { protocol: "https" as const, hostname: `${bucket}.s3.amazonaws.com` },
    );
    if (region) {
      patterns.push(
        { protocol: "https" as const, hostname: `${bucket}.s3.${region}.amazonaws.com` },
        { protocol: "https" as const, hostname: `${bucket}.s3-${region}.amazonaws.com` },
      );
    }
  }

  patterns.push(
    { protocol: "https" as const, hostname: "*.s3.amazonaws.com" },
    { protocol: "https" as const, hostname: "*.s3.*.amazonaws.com" },
    { protocol: "https" as const, hostname: "*.amazonaws.com" },
  );

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildRemotePatterns(),
    localPatterns: [
      {
        pathname: "/api/uploads/**",
      },
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
