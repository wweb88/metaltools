"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Settings2, Target, Info } from "lucide-react";

const LEVEL_DATA = [
  { from: 1,  to: 2,  pieces: 25,   silver: 75    },
  { from: 2,  to: 3,  pieces: 50,   silver: 150   },
  { from: 3,  to: 4,  pieces: 75,   silver: 300   },
  { from: 4,  to: 5,  pieces: 150,  silver: 600   },
  { from: 5,  to: 6,  pieces: 225,  silver: 1000  },
  { from: 6,  to: 7,  pieces: 300,  silver: 1300  },
  { from: 7,  to: 8,  pieces: 375,  silver: 1625  },
  { from: 8,  to: 9,  pieces: 450,  silver: 2000  },
  { from: 9,  to: 10, pieces: 525,  silver: 2250  },
  { from: 10, to: 11, pieces: 600,  silver: 2600  },
  { from: 11, to: 12, pieces: 650,  silver: 2950  },
  { from: 12, to: 13, pieces: 725,  silver: 3250  },
  { from: 13, to: 14, pieces: 800,  silver: 3600  },
  { from: 14, to: 15, pieces: 875,  silver: 3900  },
  { from: 15, to: 16, pieces: 925,  silver: 4250  },
  { from: 16, to: 17, pieces: 1000, silver: 4550  },
  { from: 17, to: 18, pieces: 1075, silver: 4900  },
  { from: 18, to: 19, pieces: 1150, silver: 5200  },
  { from: 19, to: 20, pieces: 1225, silver: 5500  },
];

const SYSTEM_FIRST_DATA = [
  { from: 0, to: 1, silver: 400, systemParts: 200, advancedParts: 0 },
  { from: 1, to: 2, silver: 600, systemParts: 275, advancedParts: 0 },
  { from: 2, to: 3, silver: 800, systemParts: 350, advancedParts: 0 },
  { from: 3, to: 4, silver: 1100, systemParts: 500, advancedParts: 0 },
  { from: 4, to: 5, silver: 1500, systemParts: 675, advancedParts: 1 },
  { from: 5, to: 6, silver: 2000, systemParts: 900, advancedParts: 1 },
  { from: 6, to: 7, silver: 2600, systemParts: 1100, advancedParts: 1 },
  { from: 7, to: 8, silver: 3500, systemParts: 1500, advancedParts: 1 },
];

const SYSTEM_SECOND_DATA = [
  { from: 4, to: 5, silver: 400, systemParts: 170, advancedParts: 0 },
  { from: 5, to: 6, silver: 525, systemParts: 220, advancedParts: 0 },
  { from: 6, to: 7, silver: 675, systemParts: 260, advancedParts: 0 },
  { from: 7, to: 8, silver: 900, systemParts: 350, advancedParts: 0 },
];

export function LevelCalculatorClient() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(2);

  const [sysCurrentLevel, setSysCurrentLevel] = useState<number>(0);
  const [sysTargetLevel, setSysTargetLevel] = useState<number>(1);
  const [systemCount, setSystemCount] = useState<number>(1);
  const [secondaryBranchCount, setSecondaryBranchCount] = useState<number>(0);

  const planeCurrentOptions = Array.from({ length: 19 }, (_, i) => i + 1);
  const planeTargetOptions = Array.from({ length: 20 - currentLevel }, (_, i) => i + currentLevel + 1);
  
  const sysCurrentOptions = Array.from({ length: 8 }, (_, i) => i);
  const sysTargetOptions = Array.from({ length: 8 - sysCurrentLevel }, (_, i) => i + sysCurrentLevel + 1);

  const { totalPieces, totalPlaneSilver } = useMemo(() => {
    const steps = LEVEL_DATA.filter(s => s.from >= currentLevel && s.to <= targetLevel);
    const pieces = steps.reduce((sum, s) => sum + s.pieces, 0);
    const silver = steps.reduce((sum, s) => sum + s.silver, 0);
    return { totalPieces: pieces, totalPlaneSilver: silver };
  }, [currentLevel, targetLevel]);

  const { sysSilver, sysParts, advParts } = useMemo(() => {
    let silver = 0;
    let parts = 0;
    let adv = 0;

    const firstSteps = SYSTEM_FIRST_DATA.filter(s => s.from >= sysCurrentLevel && s.to <= sysTargetLevel);
    firstSteps.forEach(s => {
      silver += s.silver * systemCount;
      parts += s.systemParts * systemCount;
      adv += s.advancedParts * systemCount;
    });

    const secondSteps = SYSTEM_SECOND_DATA.filter(s => s.from >= sysCurrentLevel && s.to <= sysTargetLevel);
    secondSteps.forEach(s => {
      silver += s.silver * secondaryBranchCount;
      parts += s.systemParts * secondaryBranchCount;
      adv += s.advancedParts * secondaryBranchCount;
    });

    return { sysSilver: silver, sysParts: parts, advParts: adv };
  }, [sysCurrentLevel, sysTargetLevel, systemCount, secondaryBranchCount]);

  const handlePlaneCurrentChange = (val: number) => {
    setCurrentLevel(val);
    if (targetLevel <= val) setTargetLevel(val + 1);
  };

  const handleSysCurrentChange = (val: number) => {
    setSysCurrentLevel(val);
    if (sysTargetLevel <= val) setSysTargetLevel(val + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-16">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gaming-accent)] to-[#00ff9d]">
          Calculadoras de Mejora
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Calcula exactamente los recursos que necesitas para subir de nivel tus aviones y sistemas.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Target className="w-8 h-8 text-[var(--color-gaming-accent)]" />
          <h2 className="text-3xl font-bold uppercase tracking-wider text-white">Nivel del Avión</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          <div className="glass-panel p-8 rounded-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-[var(--color-gaming-accent)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nivel Actual</label>
                <select 
                  value={currentLevel}
                  onChange={(e) => handlePlaneCurrentChange(Number(e.target.value))}
                  className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
                >
                  {planeCurrentOptions.map(n => <option key={n} value={n}>Nivel {n}</option>)}
                </select>
              </div>

              <div className="flex justify-center">
                <div className="bg-white/5 p-3 rounded-full">
                  <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 md:rotate-0" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nivel Deseado</label>
                <select 
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(Number(e.target.value))}
                  className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-4 text-xl font-black text-[var(--color-gaming-accent)] focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
                >
                  {planeTargetOptions.map(n => <option key={n} value={n}>Nivel {n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute bottom-0 left-0 p-32 bg-[#00ff9d] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h3 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/10 pb-4 text-center">Costo del Avión</h3>
            
            <div className="space-y-6">
              <motion.div key={totalPieces + "p"} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/40 border border-white/5 p-6 rounded-xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                    <img src="/assets/images/pieces.png" alt="Piezas" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Piezas</p>
                    <p className="text-3xl font-black text-white">{totalPieces.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div key={totalPlaneSilver + "s"} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/40 border border-white/5 p-6 rounded-xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                    <img src="/assets/images/silver.png" alt="Plata" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Plata</p>
                    <p className="text-3xl font-black text-white">{totalPlaneSilver.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Settings2 className="w-8 h-8 text-[var(--color-gaming-secondary)]" />
          <h2 className="text-3xl font-bold uppercase tracking-wider text-white">Sistemas del Avión</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          <div className="glass-panel p-8 rounded-2xl space-y-6 relative">
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-0 right-0 p-32 bg-[var(--color-gaming-secondary)] opacity-5 blur-[100px] rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 relative group w-fit">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider cursor-help">Pestañas / Sistemas</label>
                  <Info className="w-4 h-4 text-gray-500 cursor-help" />
                  <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block w-64 p-3 bg-[#0b0f19] border border-[var(--color-gaming-secondary)] rounded-lg text-xs text-gray-300 z-50 shadow-2xl">
                    Número total de sistemas principales que tiene el avión (Fuselaje, Motores, Aviónica, Cañones, etc.). No cuentes la primera pestaña "Aeronave" porque no usa piezas de sistema.
                  </div>
                </div>
                <select value={systemCount} onChange={(e) => {
                  const newCount = Number(e.target.value);
                  setSystemCount(newCount);
                  if (secondaryBranchCount > newCount) setSecondaryBranchCount(newCount);
                }} className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-[var(--color-gaming-secondary)] transition-colors">
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 relative group w-fit">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider cursor-help">Ramas Sec. (Nvl 5+)</label>
                  <Info className="w-4 h-4 text-gray-500 cursor-help" />
                  <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block w-64 p-3 bg-[#0b0f19] border border-[var(--color-gaming-secondary)] rounded-lg text-xs text-gray-300 z-50 shadow-2xl">
                    Cantidad de armas secundarias (usualmente misiles) que tiene tu avión. Estas mejoras aparecen a partir del Nivel 5 del avión y tienen un costo de recursos ligeramente distinto.
                  </div>
                </div>
                <select value={secondaryBranchCount} onChange={(e) => setSecondaryBranchCount(Number(e.target.value))} className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white focus:outline-none focus:border-[var(--color-gaming-secondary)] transition-colors">
                  {Array.from({ length: systemCount + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nivel Actual</label>
              <select value={sysCurrentLevel} onChange={(e) => handleSysCurrentChange(Number(e.target.value))} className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-4 text-xl font-black text-white focus:outline-none focus:border-[var(--color-gaming-secondary)] transition-colors">
                {sysCurrentOptions.map(n => <option key={n} value={n}>Nivel {n}</option>)}
              </select>
            </div>

            <div className="flex justify-center py-2">
              <div className="bg-white/5 p-3 rounded-full">
                <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 md:rotate-0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nivel Deseado</label>
              <select value={sysTargetLevel} onChange={(e) => setSysTargetLevel(Number(e.target.value))} className="w-full bg-black/60 border-2 border-white/10 rounded-xl px-4 py-4 text-xl font-black text-[var(--color-gaming-secondary)] focus:outline-none focus:border-[var(--color-gaming-secondary)] transition-colors">
                {sysTargetOptions.map(n => <option key={n} value={n}>Nivel {n}</option>)}
              </select>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-6 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute bottom-0 left-0 p-32 bg-[var(--color-gaming-secondary)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h3 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/10 pb-4 text-center">Costo de Sistemas</h3>
            
            <div className="space-y-4">
              <motion.div key={sysParts + "sp"} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/40 border border-white/5 p-5 rounded-xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                    <img src="/assets/images/system-parts.webp" alt="System Parts" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider">System Parts</p>
                    <p className="text-2xl md:text-3xl font-black text-white">{sysParts.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div key={advParts + "ap"} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/40 border border-white/5 p-5 rounded-xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                    <img src="/assets/images/advanced-parts.webp" alt="Advanced Parts" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider">Advanced Parts</p>
                    <p className="text-2xl md:text-3xl font-black text-[var(--color-gaming-secondary)]">{advParts.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div key={sysSilver + "ss"} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/40 border border-white/5 p-5 rounded-xl flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                    <img src="/assets/images/silver.png" alt="Plata" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider">Plata (Sistemas)</p>
                    <p className="text-2xl md:text-3xl font-black text-white">{sysSilver.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
