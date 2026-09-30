import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

/** Cualquier ruta desconocida bajo /es o /en cae en el not-found del idioma. */
export default async function CatchAll({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
