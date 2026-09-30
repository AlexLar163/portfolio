import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fontClasses } from "../fonts";
import { routing, type Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { SITE_URL } from "@/lib/site";
import "../globals.css";


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0D0F11",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // /cv/nada.pdf llega aquí con locale «cv»: sin metadatos propios (ni canonical a /cv).
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    applicationName: "Alex Largo — Portfolio",
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    keywords: [
      profile.name,
      "Fullstack & DevOps Engineer",
      "Fullstack Developer",
      "DevOps",
      "desarrollador fullstack",
      "Next.js",
      "WordPress",
      "Docker",
      "Caddy",
      "AWS",
      "n8n",
      "Cuenca, Ecuador",
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: { es: "/es", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: "Alex Largo",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    // Sin `robots`: index/follow es el valor por defecto, y declararlo contradecía
    // el noindex que Next agrega en las 404.
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "profile" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: t("role"),
    email: `mailto:${profile.email}`,
    url: SITE_URL,
    address: { "@type": "PostalAddress", addressLocality: "Cuenca", addressCountry: "EC" },
    sameAs: profile.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
    knowsAbout: skills.flatMap((c) => c.tools),
  };

  return (
    <html lang={locale} className={fontClasses}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Los componentes cliente reciben sus textos por props: no se envía el JSON entero. */}
        <NextIntlClientProvider messages={{}}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
