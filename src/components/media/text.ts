import { getTranslations } from "next-intl/server";

/** Textos comunes de media (alt, botones de reproducir) ya resueltos en el servidor. */
export async function mediaText() {
  const c = await getTranslations("common");
  return {
    alt: {
      alt: (name: string) => c("alt", { name }),
      altView: (name: string, n: number) => c("altView", { name, n }),
      altMobile: (name: string) => c("altMobile", { name }),
    },
    // Crudos: el cliente reemplaza {name}.
    labels: { play: c.raw("play") as string, pause: c.raw("pause") as string },
    captures: c("captures"),
    newTab: c("newTab"),
  };
}
