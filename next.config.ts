import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Las fuentes en /public/media ya vienen en webp; Next sirve AVIF/WebP a la medida del slot.
    formats: ["image/avif", "image/webp"],
  },
  // Un solo host canónico: www → apex, permanente (308). Corre antes del proxy de next-intl.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.alexlargo.tech" }],
        destination: "https://alexlargo.tech/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
