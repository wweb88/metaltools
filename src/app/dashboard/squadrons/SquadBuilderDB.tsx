'use client';

import { useState, useMemo } from "react";
import { Search, X, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Airplane = {
  id: string;
  name: string;
  sub_name: string | null;
  class: string;
  image_url: string;
};

type SquadronData = {
  id: string;
  name: string;
  pilots: { id: string; username: string; role: string; is_active?: boolean }[];
};

type ProfileData = {
  id: string;
  username: string;
  role: string;
  squadron_id: string | null;
  is_active?: boolean;
  activePlanesCount?: number;
  pilotAirplanes?: any[];
};

interface SquadBuilderDBProps {
  squadrons: SquadronData[];
  allProfiles: ProfileData[];
  airplanes: Airplane[];
}

const TIPOS_AVIONES = [
  "Light Fighter",
  "Medium Fighter",
  "Heavy Fighter",
  "Interceptor",
  "Attack"
];

const getClassColor = (planeClass: string) => {
  const c = planeClass.toLowerCase();
  if (c.includes('light fighter')) return '#9252E1';
  if (c.includes('medium fighter')) return '#CC7A31';
  if (c.includes('heavy fighter')) return '#C24740';
  if (c.includes('interceptor')) return '#2A8FCD';
  if (c.includes('attack')) return '#29A292';
  return 'var(--color-gaming-secondary)';
};

interface ResultadoTabla {
  id: string;
  tipo: string;
  nombreCompleto: string;
  imagenAvion: string;
  fallbackImagen?: string;
  jugador: string;
  nivel: number;
  specialSkill: number;
  passiveAbility: number;
  seleccionado: boolean;
}

export function SquadBuilderDB({ squadrons, allProfiles, airplanes }: SquadBuilderDBProps) {
  const [alerta, setAlerta] = useState("");
  
  // Filtros
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | "">("");
  const [squadronSeleccionado, setSquadronSeleccionado] = useState<string | "ALL">("ALL");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("");
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(TIPOS_AVIONES);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  
  const [seleccionados, setSeleccionados] = useState<ResultadoTabla[]>([]);

  // Creamos un mapa de aviones para acceso rápido
  const planesMap = useMemo(() => {
    return new Map<string, Airplane>(airplanes.map(p => [p.id, p]));
  }, [airplanes]);

  // Lista de perfiles válidos (excluir inactivos)
  const validProfiles = useMemo(() => {
    return allProfiles.filter(p => p.is_active !== false);
  }, [allProfiles]);

  const resultadosTabla = useMemo(() => {
    if (!nivelSeleccionado || tiposSeleccionados.length === 0) return [];
    
    const resultados: ResultadoTabla[] = [];
    
    let profilesAFiltrar = validProfiles;
    if (squadronSeleccionado !== "ALL") {
      profilesAFiltrar = profilesAFiltrar.filter(p => p.squadron_id === squadronSeleccionado);
    }
    if (usuarioSeleccionado) {
      profilesAFiltrar = profilesAFiltrar.filter(p => p.id === usuarioSeleccionado);
    }

    profilesAFiltrar.forEach(profile => {
      // Si el jugador ya está seleccionado en el escuadrón, omitir sus otros aviones en disponibles
      if (seleccionados.find(s => s.jugador === profile.username)) return;

      const userPlanes = profile.pilotAirplanes || [];
      userPlanes.forEach((avion: any) => {
        if (avion.is_unlocked && avion.level === Number(nivelSeleccionado)) {
          const planeInfo = planesMap.get(avion.airplane_id);
          
          if (planeInfo && tiposSeleccionados.includes(planeInfo.class)) {
            resultados.push({
              id: `${planeInfo.id}-${profile.id}`,
              tipo: planeInfo.class,
              nombreCompleto: planeInfo.sub_name ? `${planeInfo.name} ${planeInfo.sub_name}` : planeInfo.name,
              imagenAvion: `/assets/images/planes/${planeInfo.name === 'JF-17' ? 'Jf-17' : planeInfo.name.replace(/\//g, '')}.png`,
              fallbackImagen: planeInfo.image_url,
              jugador: profile.username,
              nivel: avion.level,
              specialSkill: avion.special_ability_level,
              passiveAbility: avion.passive_ability_level,
              seleccionado: false
            });
          }
        }
      });
    });

    resultados.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
    return resultados;
  }, [validProfiles, planesMap, nivelSeleccionado, squadronSeleccionado, usuarioSeleccionado, tiposSeleccionados, seleccionados]);

  const resultadosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return resultadosTabla;
    const term = terminoBusqueda.toLowerCase().trim();
    return resultadosTabla.filter(r => 
      r.nombreCompleto.toLowerCase().includes(term) ||
      r.jugador.toLowerCase().includes(term)
    );
  }, [resultadosTabla, terminoBusqueda]);

  // Jugadores dinámicos para el selector (según escuadrón)
  const jugadoresSelector = useMemo(() => {
    let list = validProfiles;
    if (squadronSeleccionado !== "ALL") {
      list = list.filter(p => p.squadron_id === squadronSeleccionado);
    }
    return list.sort((a, b) => a.username.localeCompare(b.username));
  }, [validProfiles, squadronSeleccionado]);

  const mostrarAlerta = (msg: string) => {
    setAlerta(msg);
    setTimeout(() => setAlerta(""), 4000);
  };

  const toggleSeleccion = (resultado: ResultadoTabla) => {
    const exists = seleccionados.find(s => s.id === resultado.id);
    if (exists) {
      setSeleccionados(seleccionados.filter(s => s.id !== resultado.id));
    } else {
      const tipoYaSeleccionado = seleccionados.some(s => s.tipo === resultado.tipo);
      if (tipoYaSeleccionado) {
        mostrarAlerta(`Ya tienes un avión de clase "${resultado.tipo}" en el equipo.`);
        return;
      }
      setSeleccionados([...seleccionados, { ...resultado, seleccionado: true }]);
    }
  };

  const generarEquipoAleatorio = () => {
    if (!nivelSeleccionado) return;
    const pool: ResultadoTabla[] = [];
    const jugadoresUsados = new Set<string>();

    let profilesAFiltrar = validProfiles;
    if (squadronSeleccionado !== "ALL") {
      profilesAFiltrar = profilesAFiltrar.filter(p => p.squadron_id === squadronSeleccionado);
    }

    profilesAFiltrar.forEach(profile => {
      const userPlanes = profile.pilotAirplanes || [];
      userPlanes.forEach((avion: any) => {
        if (avion.is_unlocked && avion.level === Number(nivelSeleccionado)) {
          const planeInfo = planesMap.get(avion.airplane_id);
          if (planeInfo) {
            pool.push({
              id: `${planeInfo.id}-${profile.id}`,
              tipo: planeInfo.class,
              nombreCompleto: planeInfo.sub_name ? `${planeInfo.name} ${planeInfo.sub_name}` : planeInfo.name,
              imagenAvion: `/assets/images/planes/${planeInfo.name === 'JF-17' ? 'Jf-17' : planeInfo.name.replace(/\//g, '')}.png`,
              fallbackImagen: planeInfo.image_url,
              jugador: profile.username,
              nivel: avion.level,
              specialSkill: avion.special_ability_level,
              passiveAbility: avion.passive_ability_level,
              seleccionado: true
            });
          }
        }
      });
    });

    const equipoAleatorio: ResultadoTabla[] = [];
    for (const tipo of TIPOS_AVIONES) {
      const candidatos = pool.filter(r => r.tipo === tipo && !jugadoresUsados.has(r.jugador));
      if (candidatos.length > 0) {
        const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
        jugadoresUsados.add(elegido.jugador);
        equipoAleatorio.push(elegido);
      }
    }

    if (equipoAleatorio.length === TIPOS_AVIONES.length) {
      setSeleccionados(equipoAleatorio);
    } else {
      mostrarAlerta("No se pudo generar un equipo completo. No hay suficientes pilotos con aviones de este nivel en los roles faltantes.");
    }
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {alerta && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] backdrop-blur"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold">{alerta}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-panel p-6 rounded-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nivel Requerido</label>
            <select 
              value={nivelSeleccionado} 
              onChange={(e) => setNivelSeleccionado(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)]"
            >
              <option value="">Selecciona Nivel...</option>
              {Array.from({length: 20}, (_, i) => i + 1).map(n => <option key={n} value={n}>Nivel {n}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filtro por Escuadrón</label>
            <select 
              value={squadronSeleccionado} 
              onChange={(e) => {
                setSquadronSeleccionado(e.target.value);
                setUsuarioSeleccionado(""); // Reset user when squadron changes
              }}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)]"
            >
              <option value="ALL">Todos los escuadrones</option>
              {squadrons.map(sq => <option key={sq.id} value={sq.id}>{sq.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filtro por Piloto</label>
            <select 
              value={usuarioSeleccionado} 
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)]"
            >
              <option value="">Todos los pilotos</option>
              {jugadoresSelector.map(j => <option key={j.id} value={j.id}>{j.username}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Buscar Avión / Piloto</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)]"
              />
            </div>
          </div>
          
          <div className="md:col-span-4 space-y-2">
             <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tipos de Avión</label>
             <div className="flex flex-wrap gap-3">
               {TIPOS_AVIONES.map(tipo => {
                 const active = tiposSeleccionados.includes(tipo);
                 return (
                   <button 
                     key={tipo}
                     onClick={() => setTiposSeleccionados(prev => active ? prev.filter(t => t !== tipo) : [...prev, tipo])}
                     className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${active ? 'text-white' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50'}`}
                     style={active ? { backgroundColor: getClassColor(tipo), borderColor: getClassColor(tipo) } : {}}
                   >
                     {tipo}
                   </button>
                 )
               })}
             </div>
          </div>
          
          <div className="md:col-span-4 flex justify-between items-center pt-4">
            <button 
              onClick={generarEquipoAleatorio}
              className="flex items-center gap-2 text-[var(--color-gaming-accent)] hover:text-white transition-colors font-bold uppercase tracking-wider text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Equipo Aleatorio
            </button>
            
            <button 
              onClick={() => setSeleccionados([])}
              className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-sm"
            >
              Limpiar Selección
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {nivelSeleccionado !== "" && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* SQUAD SELECCIONADO */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--color-gaming-accent)] flex items-center gap-2">
              <ShieldCheck className="w-7 h-7" /> Escuadrón Estratégico
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {TIPOS_AVIONES.map(tipo => {
                const item = seleccionados.find(s => s.tipo === tipo);
                
                if (item) {
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={tipo}
                      className="relative group overflow-hidden rounded-xl border-2 border-[var(--color-gaming-accent)] shadow-[0_0_20px_rgba(0,229,255,0.3)] bg-[#151a2d] min-h-[240px] flex flex-col"
                    >
                      <button 
                        onClick={() => toggleSeleccion(item)} 
                        className="absolute top-3 right-3 z-40 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-2 transition-colors shadow-lg"
                        title="Remover"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="w-full relative flex items-center justify-center min-h-[160px] bg-gradient-to-b from-[#0b0f19]/50 to-transparent">
                        <img 
                          src={item.imagenAvion} 
                          alt={item.nombreCompleto} 
                          className="max-w-[80%] max-h-full object-contain drop-shadow-2xl" 
                          onError={(e) => {
                            if (item.fallbackImagen) (e.target as HTMLImageElement).src = item.fallbackImagen;
                          }}
                        />
                        <div className="absolute bottom-3 left-4 z-20">
                          <div 
                            className="inline-block text-[10px] font-black uppercase tracking-wider bg-black px-2 py-0.5 rounded mb-1"
                            style={{ color: getClassColor(item.tipo) }}
                          >
                            {item.tipo}
                          </div>
                          <h3 className="text-xl font-black text-white leading-tight drop-shadow-md truncate max-w-[200px]" title={item.nombreCompleto}>{item.nombreCompleto}</h3>
                        </div>
                      </div>

                      <div className="relative z-20 p-4 pt-3 flex-1 flex flex-col justify-end border-t border-white/5 bg-[#0b0f19]/30">
                        <p className="text-gray-300 font-black text-lg uppercase tracking-wider truncate mb-3">{item.jugador}</p>
                        <div className="flex justify-between items-center pt-3 text-[16px] font-bold border-t border-white/10">
                           <span className="text-yellow-500">SP: {item.specialSkill === 0 ? '-' : item.specialSkill}</span>
                           <span className="text-[var(--color-gaming-secondary)]">PA: {item.passiveAbility === 0 ? '-' : item.passiveAbility}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <div key={tipo} className="flex flex-col items-center justify-center min-h-[240px] rounded-xl border-2 border-dashed border-white/10 bg-white/5 text-gray-500 hover:border-white/30 transition-colors">
                       <span className="text-xs font-black uppercase tracking-widest mb-1 opacity-50">{tipo}</span>
                       <span className="text-sm font-semibold">Vacío</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* DISPONIBLES */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4">
              Aviones Disponibles
            </h2>
            
            {resultadosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {resultadosFiltrados.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={item.id}
                      onClick={() => toggleSeleccion(item)}
                      className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-white/5 hover:border-[var(--color-gaming-accent)] bg-[#151a2d]/50 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent z-10"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-110 pb-12">
                        <img 
                          src={item.imagenAvion} 
                          alt={item.nombreCompleto} 
                          className="w-[80%] object-contain" 
                          onError={(e) => {
                            if (item.fallbackImagen) (e.target as HTMLImageElement).src = item.fallbackImagen;
                          }}
                        />
                      </div>
                      
                      <div className="relative z-20 p-5 h-full flex flex-col justify-end min-h-[220px]">
                        <div className="absolute top-4 right-4">
                           <span className="bg-black/60 backdrop-blur text-white text-xs font-black px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                             Lvl {item.nivel}
                           </span>
                        </div>
                        
                        <div 
                          className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1 rounded backdrop-blur"
                          style={{ color: getClassColor(item.tipo) }}
                        >
                          {item.tipo}
                        </div>

                        <div className="mt-auto space-y-1">
                          <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider truncate">{item.jugador}</p>
                          <h3 className="text-2xl font-black text-white leading-tight truncate">{item.nombreCompleto}</h3>
                          <div className="flex gap-4 pt-2 text-sm font-bold border-t border-white/10 mt-2">
                             <span className="text-yellow-500">SP: {item.specialSkill === 0 ? '-' : item.specialSkill}</span>
                             <span className="text-[var(--color-gaming-secondary)]">PA: {item.passiveAbility === 0 ? '-' : item.passiveAbility}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
               <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10 text-gray-500 font-bold text-lg uppercase tracking-widest">
                 No hay aviones disponibles para estos filtros.
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
