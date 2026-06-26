import { LevelCalculatorClient } from "@/components/level-calculator/LevelCalculatorClient";

export const metadata = {
  title: "Calculadora por Nivel - Squad Metalstorm",
  description: "Calcula los recursos de nivel."
};

export default function LevelCalculatorPage() {
  return (
    <main className="min-h-screen pt-12">
      <LevelCalculatorClient />
    </main>
  );
}
