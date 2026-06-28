/**
 * Canonical site URL. Override with NEXT_PUBLIC_SITE_URL when you wire up a
 * custom domain; falls back to the current Vercel production alias.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://portfolio-rose-psi-8qtm646lcc.vercel.app"
).replace(/\/$/, "");
