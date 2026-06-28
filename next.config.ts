import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Sprites are pixel-art; keep them crisp instead of optimizing.
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
