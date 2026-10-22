import { Metadata } from "next";
import { HangarClient } from "@/components/hangar/HangarClient";

export const metadata: Metadata = {
  title: "Hangar - Metaltools",
  description: "Catálogo completo de aeronaves disponibles en Metalstorm.",
};

export default function PublicHangarPage() {
  return (
    <main className="min-h-screen pt-6">
      <HangarClient />
    </main>
  );
}
