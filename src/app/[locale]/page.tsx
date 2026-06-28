import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { Hud } from "@/components/Hud";
import { Hero } from "@/components/Hero";
import { Inventory } from "@/components/Inventory";
import { Quests } from "@/components/Quests";
import { Levels } from "@/components/Levels";
import { WorldMap } from "@/components/WorldMap";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ArcadeLayer } from "@/components/ArcadeLayer";
import { EditorialApp } from "@/components/editorial/EditorialApp";
import { InterfaceGate } from "@/components/InterfaceGate";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const initialMode =
    cookieStore.get("ui")?.value === "pixel" ? "pixel" : "editorial";

  return (
    <main>
      <InterfaceGate
        initialMode={initialMode}
        pixel={
          <div className="pixel-root">
            <div className="wrap">
              <Hud />
              <Hero />
              <Inventory />
              <Quests />
              <Levels />
              <WorldMap />
              <Contact />
            </div>
            <Footer />
            <ArcadeLayer />
          </div>
        }
        editorial={<EditorialApp />}
      />
    </main>
  );
}
