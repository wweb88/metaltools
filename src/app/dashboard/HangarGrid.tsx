'use client';

import { useState, useTransition } from 'react';
import { togglePlane, updatePlaneLevel } from './actions';
import { cn } from '@/lib/utils';
import { Lock, Unlock, ShieldAlert, Zap, Cpu } from 'lucide-react';

type Airplane = {
  id: string;
  name: string;
  sub_name: string | null;
  class: string;
  image_url: string;
};

type PilotAirplane = {
  airplane_id: string;
  is_unlocked: boolean;
  level: number;
  special_ability_level: number;
  passive_ability_level: number;
};

interface HangarGridProps {
  airplanes: Airplane[];
  pilotAirplanes: PilotAirplane[];
}

export function HangarGrid({ airplanes, pilotAirplanes }: HangarGridProps) {
  const [isPending, startTransition] = useTransition();

  // Crear un mapa para acceso rápido
  const pilotPlanesMap = new Map<string, PilotAirplane>(
    pilotAirplanes.map(p => [p.airplane_id, p])
  );

  const handleToggle = (airplaneId: string, currentlyUnlocked: boolean) => {
    startTransition(() => {
      togglePlane(airplaneId, !currentlyUnlocked);
    });
  };

  const handleLevelChange = (airplaneId: string, field: 'level' | 'special_ability_level' | 'passive_ability_level', value: number) => {
    startTransition(() => {
      updatePlaneLevel(airplaneId, field, value);
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {airplanes.map(plane => {
        const ownedData = pilotPlanesMap.get(plane.id);
        const isUnlocked = ownedData?.is_unlocked || false;

        return (
          <div 
            key={plane.id} 
            className={cn(
              "relative glass-panel rounded-2xl overflow-hidden border transition-all duration-300",
              isUnlocked 
                ? "border-[var(--color-gaming-accent)]/50 shadow-[0_0_30px_rgba(0,229,255,0.1)]" 
                : "border-white/5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
            )}
          >
            {/* Cabecera / Info del Avión */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-white tracking-wider uppercase">{plane.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{plane.sub_name}</p>
                <span className="inline-block mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--color-gaming-secondary)] rounded-md">
                  {plane.class}
                </span>
              </div>
              
              <button
                onClick={() => handleToggle(plane.id, isUnlocked)}
                disabled={isPending}
                className={cn(
                  "p-3 rounded-xl flex items-center justify-center transition-all",
                  isUnlocked 
                    ? "bg-[var(--color-gaming-accent)]/20 text-[var(--color-gaming-accent)] shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
                    : "bg-white/5 text-gray-500 hover:text-white"
                )}
              >
                {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </button>
            </div>

            {/* Imagen del Avión */}
            <div className="relative h-40 w-full flex items-center justify-center p-4">
              <img 
                src={plane.image_url} 
                alt={plane.name} 
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Controles de Nivel (Solo si está desbloqueado) */}
            {isUnlocked && ownedData && (
              <div className="bg-black/60 p-4 border-t border-white/5 space-y-4">
                {/* Nivel General */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Nivel de Avión</span>
                  </div>
                  <select
                    value={ownedData.level}
                    onChange={(e) => handleLevelChange(plane.id, 'level', parseInt(e.target.value))}
                    disabled={isPending}
                    className="bg-black/80 border border-white/20 text-white rounded-lg px-3 py-1 text-sm font-bold focus:border-[var(--color-gaming-accent)] focus:outline-none"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>Nvl. {n}</option>
                    ))}
                  </select>
                </div>

                {/* Habilidad Especial */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Hab. Especial</span>
                  </div>
                  <select
                    value={ownedData.special_ability_level}
                    onChange={(e) => handleLevelChange(plane.id, 'special_ability_level', parseInt(e.target.value))}
                    disabled={isPending}
                    className="bg-black/80 border border-white/20 text-yellow-500 rounded-lg px-3 py-1 text-sm font-bold focus:border-yellow-500 focus:outline-none"
                  >
                    {Array.from({ length: 4 }, (_, i) => i).map(n => (
                      <option key={n} value={n}>{n === 0 ? 'Bloqueada' : `Nvl. ${n}`}</option>
                    ))}
                  </select>
                </div>

                {/* Habilidad Pasiva */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[var(--color-gaming-secondary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Hab. Pasiva</span>
                  </div>
                  <select
                    value={ownedData.passive_ability_level}
                    onChange={(e) => handleLevelChange(plane.id, 'passive_ability_level', parseInt(e.target.value))}
                    disabled={isPending}
                    className="bg-black/80 border border-white/20 text-[var(--color-gaming-secondary)] rounded-lg px-3 py-1 text-sm font-bold focus:border-[var(--color-gaming-secondary)] focus:outline-none"
                  >
                    {Array.from({ length: 6 }, (_, i) => i).map(n => (
                      <option key={n} value={n}>{n === 0 ? 'Bloqueada' : `Nvl. ${n}`}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
