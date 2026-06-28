import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Press_Start_2P, VT323 } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { SITE_URL } from "@/lib/site";
import "../globals.css";
import "../editorial.css";

const pixelHeading = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const pixelBody = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-body",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
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
      "Fullstack Developer",
      "desarrollador fullstack",
      ...profile.core,
      "portfolio",
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
        "x-default": "/es",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: title,
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
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
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const ui =
    cookieStore.get("ui")?.value === "pixel" ? "pixel" : "editorial";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role[locale as Locale] ?? profile.role.es,
    email: `mailto:${profile.email}`,
    url: SITE_URL,
    sameAs: profile.socials
      .filter((s) => s.href.startsWith("http"))
      .map((s) => s.href),
    knowsAbout: skills.flatMap((c) => c.tools),
  };

  return (
    <html
      lang={locale}
      className={`${pixelHeading.variable} ${pixelBody.variable}`}
      data-ui={ui}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
