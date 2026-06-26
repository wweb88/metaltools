import { SquadToolClient } from "@/components/squad-tool/SquadToolClient";

export const metadata = {
  title: "Squad Tool - Metaltools",
  description: "Organiza tu escuadrón cruzando habilidades y niveles."
};

export default function SquadToolPage() {
  return (
    <main className="min-h-screen">
      <SquadToolClient />
    </main>
  );
}
