import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Las fuentes en /public/media ya vienen en webp; Next sirve AVIF/WebP a la medida del slot.
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
