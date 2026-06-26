import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--color-gaming-accent)] opacity-20 blur-[50px] rounded-full"></div>
        <Loader2 className="w-16 h-16 text-[var(--color-gaming-accent)] animate-spin relative z-10" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gaming-accent)] to-[#00ff9d] animate-pulse">
          Cargando Base de Datos
        </h2>
        <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">
          Sincronizando información de pilotos...
        </p>
      </div>
    </div>
  );
}
