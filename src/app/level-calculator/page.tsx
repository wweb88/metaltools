import { Metadata } from "next";
import { LevelCalculatorClient } from "@/components/level-calculator/LevelCalculatorClient";

export const metadata: Metadata = {
  title: "Calculadora por Nivel - Metaltools",
  description: "Calcula los recursos necesarios para subir el nivel de tus aviones.",
};

export default function LevelCalculatorPage() {
  return (
    <main className="min-h-screen pt-12">
      <LevelCalculatorClient />
    </main>
  );
}
