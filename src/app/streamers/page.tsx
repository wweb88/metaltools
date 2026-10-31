import { Metadata } from "next";
import { StreamersClient } from "@/components/streamers/StreamersClient";

export const metadata: Metadata = {
  title: "Streamers - Metaltools",
  description: "Directorio de streamers y creadores de contenido de Metalstorm.",
};

export default function StreamersPage() {
  return (
    <main className="min-h-screen pt-4">
      <StreamersClient />
    </main>
  );
}
