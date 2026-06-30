/**
 * Canonical site URL. Override with NEXT_PUBLIC_SITE_URL if it ever changes;
 * falls back to the custom domain so canonical, sitemap and OG tags are right.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://alexlargo.tech"
).replace(/\/$/, "");
