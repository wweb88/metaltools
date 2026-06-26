"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  fetchPlanesInfo, 
  fetchPlayersFromGoogleSheet, 
  extractGoogleSheetId,
  TIPOS_AVIONES,
  Jugador,
  PlaneInfo
} from "@/lib/data-service";
import { Search, Download, AlertCircle, Loader2, X, RefreshCw, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultadoTabla {
  id: string;
  tipo: string;
  imagenTipo: string;
  nombreCompleto: string;
  imagenAvion: string;
  imagenBig: string;
  jugador: string;
  nivel: number;
  specialSkill: number;
  passiveAbility: number;
  seleccionado: boolean;
}

export function SquadToolClient() {
  const [urlGoogle, setUrlGoogle] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [alerta, setAlerta] = useState("");
  
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [planesInfo, setPlanesInfo] = useState<PlaneInfo[]>([]);
  
  // Filtros
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | "">("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("");
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(TIPOS_AVIONES);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  
  const [seleccionados, setSeleccionados] = useState<ResultadoTabla[]>([]);

  useEffect(() => {
    fetchPlanesInfo().then(setPlanesInfo);
  }, []);

  const handleCargar = async () => {
    if (!urlGoogle.trim()) {
      setErrorMensaje("Por favor, ingresa una URL válida");
      return;
    }
    const spreadsheetId = extractGoogleSheetId(urlGoogle);
    if (!spreadsheetId) {
      setErrorMensaje("URL inválida. Asegúrate de que sea una URL válida de Google Sheets");
      return;
    }

    setErrorMensaje("");
    setCargando(true);
    try {
      const data = await fetchPlayersFromGoogleSheet(spreadsheetId);
      setJugadores(data);
    } catch (err) {
      setErrorMensaje("Error al cargar el archivo. Verifica la URL.");
    } finally {
      setCargando(false);
    }
  };

  const resultadosTabla = useMemo(() => {
    if (!nivelSeleccionado || tiposSeleccionados.length === 0) return [];
    
    const resultados: ResultadoTabla[] = [];
    const jugadoresAFiltrar = usuarioSeleccionado 
      ? jugadores.filter(j => j.jugador === usuarioSeleccionado)
      : jugadores;

    jugadoresAFiltrar.forEach(jugador => {
      // Si el jugador ya está seleccionado, no lo mostramos en disponibles
      if (seleccionados.find(s => s.jugador === jugador.jugador)) return;

      jugador.aviones.forEach(avion => {
        if (avion.nivel === Number(nivelSeleccionado)) {
          const planeInfo = planesInfo.find(p => 
            p.name.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name} ${p.subName}`.toLowerCase() === avion.nombre.toLowerCase() ||
            `${p.name}-${p.subName}`.toLowerCase() === avion.nombre.toLowerCase()
          );
          
          if (planeInfo && tiposSeleccionados.includes(planeInfo.type)) {
            resultados.push({
              id: `${planeInfo.name}-${planeInfo.subName}-${jugador.jugador}`,
              tipo: planeInfo.type,
              imagenTipo: `/files/role-icons/role-${planeInfo.type.toLowerCase().replace(' ', '-')}-bg.png`,
              nombreCompleto: `${planeInfo.name} ${planeInfo.subName}`,
              imagenAvion: planeInfo.image,
              imagenBig: planeInfo.imageBig ? encodeURI(`/assets/images/planes/${planeInfo.imageBig}`) : '',
              jugador: jugador.jugador,
              nivel: avion.nivel,
              specialSkill: avion.specialSkill,
              passiveAbility: avion.passiveAbility,
              seleccionado: false
            });
          }
        }
      });
    });

    resultados.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
    return resultados;
  }, [jugadores, planesInfo, nivelSeleccionado, usuarioSeleccionado, tiposSeleccionados, seleccionados]);

  const resultadosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return resultadosTabla;
    const term = terminoBusqueda.toLowerCase().trim();
    return resultadosTabla.filter(r => 
      r.nombreCompleto.toLowerCase().includes(term) ||
      r.jugador.toLowerCase().includes(term)
    );
  }, [resultadosTabla, terminoBusqueda]);

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
        mostrarAlerta(`Ya tienes un avión de tipo "${resultado.tipo}" en el equipo.`);
        return;
      }
      setSeleccionados([...seleccionados, { ...resultado, seleccionado: true }]);
    }
  };

  const generarEquipoAleatorio = () => {
    if (!nivelSeleccionado) return;
    const pool: ResultadoTabla[] = [];
    const jugadoresUsados = new Set<string>();

    jugadores.forEach(jugador => {
      jugador.aviones.forEach(avion => {
        if (avion.nivel === Number(nivelSeleccionado)) {
          const planeInfo = planesInfo.find(p => p.name.toLowerCase() === avion.nombre.toLowerCase() || `${p.name} ${p.subName}`.toLowerCase() === avion.nombre.toLowerCase());
          if (planeInfo) {
            pool.push({
              id: `${planeInfo.name}-${planeInfo.subName}-${jugador.jugador}`,
              tipo: planeInfo.type,
              imagenTipo: '',
              nombreCompleto: `${planeInfo.name} ${planeInfo.subName}`,
              imagenAvion: planeInfo.image,
              imagenBig: planeInfo.imageBig ? encodeURI(`/assets/images/planes/${planeInfo.imageBig}`) : '',
              jugador: jugador.jugador,
              nivel: avion.nivel,
              specialSkill: avion.specialSkill,
              passiveAbility: avion.passiveAbility,
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
      mostrarAlerta("No se pudo generar un equipo completo. No hay suficientes aviones en el nivel.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative">
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

      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
          Squad <span className="text-[var(--color-gaming-accent)]">Tool</span>
        </h1>
        <p className="text-gray-400 max-w-3xl text-lg">
          Carga tu inventario desde Google Sheets y organiza el mejor escuadrón cruzando habilidades y niveles.
        </p>
      </header>

      {/* Control Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">URL de Google Sheets</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={urlGoogle}
                onChange={(e) => setUrlGoogle(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)] focus:ring-1 focus:ring-[var(--color-gaming-accent)] transition-all"
              />
              <button 
                onClick={handleCargar}
                disabled={cargando}
                className="bg-[var(--color-gaming-accent)] text-black px-6 py-3 rounded-lg font-bold hover:bg-[var(--color-gaming-accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {cargando ? <Loader2 className="animate-spin w-5 h-5" /> : "Cargar"}
              </button>
            </div>
            {errorMensaje && <p className="text-red-400 text-sm font-semibold flex items-center gap-1 mt-2"><AlertCircle className="w-4 h-4" /> {errorMensaje}</p>}
          </div>
          
          <div className="flex flex-col justify-end space-y-2">
             <a href="/files/planificacion-base.xlsx" download className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-white font-semibold transition-colors justify-center">
                <Download className="w-4 h-4" /> Plantilla
             </a>
          </div>
        </div>

        {jugadores.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filtrar por Jugador</label>
              <select 
                value={usuarioSeleccionado} 
                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)]"
              >
                <option value="">Todos los jugadores</option>
                {jugadores.map(j => <option key={j.jugador} value={j.jugador}>{j.jugador}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Buscar Avión / Jugador</label>
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
            
            <div className="md:col-span-3 space-y-2">
               <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tipos de Avión</label>
               <div className="flex flex-wrap gap-3">
                 {TIPOS_AVIONES.map(tipo => {
                   const active = tiposSeleccionados.includes(tipo);
                   return (
                     <button 
                       key={tipo}
                       onClick={() => setTiposSeleccionados(prev => active ? prev.filter(t => t !== tipo) : [...prev, tipo])}
                       className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${active ? 'bg-[var(--color-gaming-accent)] border-[var(--color-gaming-accent)] text-black' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50'}`}
                     >
                       {tipo}
                     </button>
                   )
                 })}
               </div>
            </div>
            
            <div className="md:col-span-3 flex justify-between items-center pt-4">
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
          </motion.div>
        )}
      </div>

      {/* Results Section */}
      {nivelSeleccionado !== "" && (
        <div className="space-y-12">
          {/* SQUAD SELECCIONADO */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--color-gaming-accent)] flex items-center gap-2">
              <ShieldCheck className="w-7 h-7" /> Equipo Seleccionado
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
                        {item.imagenBig ? (
                          <img src={item.imagenBig} alt={item.nombreCompleto} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                        ) : (
                          <div className="w-full h-full bg-[#1a2235]"></div>
                        )}
                        <div className="absolute bottom-3 left-4 z-20">
                          <div className="inline-block text-[10px] font-black uppercase tracking-wider text-[var(--color-gaming-accent)] bg-black px-2 py-0.5 rounded mb-1">
                            {item.tipo}
                          </div>
                          <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{item.nombreCompleto}</h3>
                        </div>
                      </div>

                      <div className="relative z-20 p-4 pt-3 flex-1 flex flex-col justify-end border-t border-white/5 bg-[#0b0f19]/30">
                        <p className="text-gray-300 font-black text-lg uppercase tracking-wider truncate mb-3">{item.jugador}</p>
                        <div className="flex justify-between items-center pt-3 text-[16px] font-bold border-t border-white/10">
                           <span className="text-blue-400">SP: {item.specialSkill}</span>
                           <span className="text-green-400">PA: {item.passiveAbility}</span>
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
                      {item.imagenBig ? (
                        <img src={item.imagenBig} alt={item.nombreCompleto} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="absolute inset-0 bg-[#1a2235]"></div>
                      )}
                      
                      <div className="relative z-20 p-5 h-full flex flex-col justify-end min-h-[220px]">
                        <div className="absolute top-4 right-4">
                           <span className="bg-black/60 backdrop-blur text-white text-xs font-black px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                             Lvl {item.nivel}
                           </span>
                        </div>
                        
                        <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-gray-300 bg-black/60 px-3 py-1 rounded backdrop-blur">
                          {item.tipo}
                        </div>

                        <div className="mt-auto space-y-1">
                          <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider truncate">{item.jugador}</p>
                          <h3 className="text-2xl font-black text-white leading-tight">{item.nombreCompleto}</h3>
                          <div className="flex gap-4 pt-2 text-sm font-bold">
                             <span className="text-blue-400">SP: {item.specialSkill}</span>
                             <span className="text-green-400">PA: {item.passiveAbility}</span>
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
