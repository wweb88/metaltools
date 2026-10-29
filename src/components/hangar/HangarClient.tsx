"use client";
import { useState, useEffect, useMemo } from "react";
import { Plane, Loader2, Images, X, ZoomIn, ZoomOut, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  fetchPlanesInfo,
  fetchModsInfo,
  fetchModsGamesInfo,
  PlaneInfo,
  ModInfo,
  ModGameInfo,
} from "@/lib/data-service";

export type PlaneRole =
  | "Light Fighter"
  | "Medium Fighter"
  | "Heavy Fighter"
  | "Interceptor"
  | "Attack";

const ROLE_ORDER: PlaneRole[] = [
  "Light Fighter",
  "Medium Fighter",
  "Heavy Fighter",
  "Interceptor",
  "Attack",
];

const ROLE_COLORS: Record<PlaneRole, string> = {
  "Light Fighter": "#9252E1",
  "Medium Fighter": "#CC7A31",
  "Heavy Fighter": "#C24740",
  Interceptor: "#2A8FCD",
  Attack: "#29A292",
};

const ROLE_ICONS: Record<PlaneRole, string> = {
  "Light Fighter": "/assets/planes/roles/role-light-fighter-bg.png",
  "Medium Fighter": "/assets/planes/roles/role-medium-fighter-bg.png",
  "Heavy Fighter": "/assets/planes/roles/role-heavy-fighter-bg.png",
  Interceptor: "/assets/planes/roles/role-interceptor-bg.png",
  Attack: "/assets/planes/roles/role-attack-bg.png",
};

function RoleIcon({ role, className = "w-6 h-6" }: { role: PlaneRole; className?: string }) {
  return (
    <img
      src={ROLE_ICONS[role]}
      alt={role}
      className={cn("object-contain", className)}
    />
  );
}

export function HangarClient() {
  const { t } = useLanguage();
  const [planes, setPlanes] = useState<PlaneInfo[]>([]);
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [modsGames, setModsGames] = useState<ModGameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<PlaneRole | "ALL">("ALL");
  const [selectedGameMode, setSelectedGameMode] = useState<number>(2);
  const [activeGalleryPlane, setActiveGalleryPlane] = useState<PlaneInfo | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    Promise.all([fetchPlanesInfo(), fetchModsInfo(), fetchModsGamesInfo()])
      .then(([planesData, modsData, modsGamesData]) => {
        setPlanes(planesData);
        setMods(modsData);
        setModsGames(modsGamesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const modsMap = useMemo(() => {
    return new Map(mods.map((mod) => [mod.id, mod.image]));
  }, [mods]);

  const sortedAirplanes = useMemo(() => {
    return [...planes].sort((a, b) => a.name.localeCompare(b.name));
  }, [planes]);

  const filteredAirplanes = useMemo(() => {
    if (selectedRole === "ALL") return sortedAirplanes;
    return sortedAirplanes.filter((plane) => plane.type === selectedRole);
  }, [sortedAirplanes, selectedRole]);

  const openGallery = (plane: PlaneInfo) => {
    setActiveGalleryPlane(plane);
    setIsZoomed(false);
  };

  const closeGallery = () => {
    setActiveGalleryPlane(null);
    setIsZoomed(false);
  };

  const activeTacticalImage = useMemo(() => {
    if (!activeGalleryPlane) return "";
    const entry = activeGalleryPlane.modsGame?.find(
      (m) => m.idModsGame === selectedGameMode
    );
    return entry?.tacticalImage?.trim() || "";
  }, [activeGalleryPlane, selectedGameMode]);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Plane className="w-7 h-7 text-[var(--color-gaming-secondary)] shrink-0" />
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider">
              {t.hangarPage.title}
            </h1>
            <p className="text-gray-400 text-sm md:text-base flex flex-wrap items-center gap-1.5">
              <span>{t.hangarPage.subtitlePart1}</span>
              <span className="inline-flex items-center justify-center p-1.5 bg-black/60 text-[var(--color-gaming-accent)] rounded-lg border border-[var(--color-gaming-accent)]/50">
                <Images className="w-4 h-4" />
              </span>
              <span>{t.hangarPage.subtitlePart2}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#1c222b]/80 border-l-4 border-l-amber-400 border border-white/10 p-4 rounded-xl flex items-start gap-3 shadow-lg backdrop-blur-md">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            <strong className="text-amber-400 font-bold uppercase tracking-wider mr-2 text-xs md:text-sm">
              {t.hangarPage.noticeTitle}:
            </strong>
            {t.hangarPage.notice}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Panel lateral de Filtro de Rol (Idéntico a la imagen del juego) */}
        <aside className="w-full lg:w-72 shrink-0 bg-[#1c222b]/95 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-md">
          <h2 className="text-xl font-black italic uppercase tracking-wider text-white mb-1">
            {t.hangarPage.filterAndSort}
          </h2>
          <p className="text-sm font-extrabold uppercase tracking-wider text-gray-300 mb-4">
            {t.hangarPage.roleFilter}
          </p>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedRole("ALL")}
              className={cn(
                "w-full text-left px-3.5 py-2.5 rounded-lg font-extrabold uppercase tracking-wider text-sm transition-all cursor-pointer",
                selectedRole === "ALL"
                  ? "bg-black/60 text-white border border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                  : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {t.hangarPage.allAircraft}
            </button>

            {ROLE_ORDER.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-extrabold uppercase tracking-wider text-sm transition-all cursor-pointer",
                    isSelected
                      ? "bg-black/60 text-white border border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <RoleIcon role={role} className="w-6 h-6 shrink-0" />
                  <span>{t.hangarPage.roles[role]}</span>
                </button>
              );
            })}
          </div>

          {modsGames.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-sm font-extrabold uppercase tracking-wider text-gray-300 mb-4">
                {t.hangarPage.gameModeFilter}
              </p>
              <div className="flex flex-col gap-1.5">
                {modsGames.map((mode) => {
                  const isSelected = selectedGameMode === mode.id;
                  const modeLabel =
                    t.hangarPage.gameModes[
                      mode.id as keyof typeof t.hangarPage.gameModes
                    ] || `Mode ${mode.id}`;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedGameMode(mode.id)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-extrabold uppercase tracking-wider text-sm transition-all cursor-pointer text-left",
                        isSelected
                          ? "bg-black/60 text-white border border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                          : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <img
                        src={mode.image}
                        alt={modeLabel}
                        className="w-6 h-6 object-contain shrink-0"
                      />
                      <span>{modeLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Grilla de Aviones (mismo diseño de tarjetas de las secciones administrables) */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[var(--color-gaming-accent)] animate-spin" />
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
            >
              {filteredAirplanes.map((plane) => {
                const role = (plane.type as PlaneRole) in ROLE_COLORS
                  ? (plane.type as PlaneRole)
                  : "Light Fighter";
                const modeModsEntry = plane.modsGame?.find(
                  (entry) => entry.idModsGame === selectedGameMode
                );
                const tacticalImage = modeModsEntry?.tacticalImage?.trim() || "";
                const activeModIds = modeModsEntry?.mods || plane.mods || [];
                const planeMods = activeModIds
                  .map((modId) => {
                    const image = modsMap.get(modId);
                    return image ? { id: modId, image } : null;
                  })
                  .filter((mod): mod is ModInfo => mod !== null);

                return (
                  <div
                    key={plane.name}
                    className="relative glass-panel rounded-2xl overflow-hidden border transition-all duration-300 border-[var(--color-gaming-accent)]/50 shadow-[0_0_30px_rgba(0,229,255,0.1)] hover:border-[var(--color-gaming-accent)] hover:shadow-[0_0_35px_rgba(0,229,255,0.2)]"
                  >
                    {/* Cabecera / Info del Avión */}
                    <div className="p-4 flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-white tracking-wider uppercase">
                          {plane.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          {plane.subName}
                        </p>
                        <span
                          className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded-md"
                          style={{ color: ROLE_COLORS[role] }}
                        >
                          <RoleIcon role={role} className="w-3.5 h-3.5" />
                          {t.hangarPage.roles[role]}
                        </span>
                      </div>
                    </div>

                    {/* Imagen del Avión */}
                    <div className="relative h-40 w-full flex items-center justify-center p-4">
                      {tacticalImage && (
                        <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
                          <button
                            type="button"
                            onClick={() => openGallery(plane)}
                            className="p-2 bg-black/60 hover:bg-[var(--color-gaming-accent)] text-[var(--color-gaming-accent)] hover:text-black rounded-lg backdrop-blur border border-[var(--color-gaming-accent)]/50 transition-colors flex items-center justify-center relative cursor-pointer"
                            title={t.hangarPage.tacticalGuides}
                          >
                            <Images className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <img
                        src={`/assets/images/planes/${plane.imageBig}`}
                        alt={plane.name}
                        className="max-h-full max-w-full object-contain drop-shadow-2xl scale-[2] z-[-1]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = plane.image;
                        }}
                      />

                      {planeMods.length > 0 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-[4px] z-20">
                          {planeMods.map((mod, idx) => (
                            <img
                              key={`${mod.id}-${idx}`}
                              src={mod.image}
                              alt={`Mod ${mod.id}`}
                              className="w-[36px] h-auto object-contain drop-shadow-md pointer-events-none"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Imágenes Tácticas (solo imagen, sin comentarios) */}
      {activeGalleryPlane && activeTacticalImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={closeGallery}
          />
          <div className="bg-[#151a2d] border border-white/10 rounded-3xl w-full max-w-5xl shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  {t.hangarPage.tacticalGuides} - {activeGalleryPlane.name}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-gray-400 hover:text-[var(--color-gaming-accent)] transition-colors bg-white/5 p-2 rounded-xl cursor-pointer"
                >
                  {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
                </button>
                <button
                  type="button"
                  onClick={closeGallery}
                  className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl hover:bg-red-500 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div
              className={cn(
                "flex-1 relative bg-black/50 rounded-2xl border border-white/5",
                isZoomed
                  ? "overflow-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                  : "overflow-hidden flex items-center justify-center"
              )}
            >
              <img
                key={activeTacticalImage}
                src={activeTacticalImage}
                alt={`${activeGalleryPlane.name} Tactical Guide`}
                className={cn(
                  "animate-in fade-in duration-300",
                  isZoomed
                    ? "w-full h-auto cursor-zoom-out"
                    : "max-w-full max-h-full object-contain cursor-zoom-in"
                )}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
