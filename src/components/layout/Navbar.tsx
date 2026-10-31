"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Crosshair,
  Calculator,
  ScrollText,
  Home,
  Menu,
  X,
  User,
  Globe,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const STORAGE_KEY = "metaltools_sidebar_collapsed";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const navItems = [
    { name: t.nav.home, path: "/", icon: Home },
    // { name: t.nav.squadTool, path: "/squad-tool", icon: Crosshair },
    { name: t.nav.levelCalculator, path: "/level-calculator", icon: Calculator },
    // { name: t.nav.rules, path: "/reglamentos", icon: ScrollText },
    { name: t.nav.hangar, path: "/hangar", icon: User },
    { name: t.nav.streamers, path: "/streamers", icon: Radio },
  ];

  return (
    <>
      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        className={cn(
          "hidden md:flex flex-col justify-between sticky top-0 h-screen shrink-0 z-40 glass-panel border-r border-white/10 transition-[width] duration-300 ease-in-out select-none relative",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Collapse / Expand Floating Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          title={isCollapsed ? t.nav.expand : t.nav.collapse}
          aria-label={isCollapsed ? t.nav.expand : t.nav.collapse}
          className="absolute -right-3.5 top-7 z-50 w-7 h-7 rounded-full bg-[#151a2d] border border-[var(--color-gaming-accent)]/40 text-[var(--color-gaming-accent)] hover:bg-[var(--color-gaming-accent)] hover:text-black flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.35)] transition-all cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Top Brand / Logo */}
        <div className="p-4 border-b border-white/5 flex items-center justify-center">
          <Link
            href="/"
            className={cn(
              "flex items-center group min-w-0 transition-all",
              isCollapsed ? "justify-center" : "gap-2.5 w-full px-1"
            )}
          >
            <div className="w-11 h-11 shrink-0 flex items-center justify-center transform group-hover:scale-110 transition-transform mix-blend-screen">
              <img
                src="/assets/images/wrench_icon_only.png"
                alt="MetalTools Icon"
                className="h-full w-full object-contain"
              />
            </div>

            {!isCollapsed && (
              <div className="flex items-center overflow-hidden">
                <span className="text-xl font-black tracking-widest uppercase flex items-center whitespace-nowrap">
                  <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                    METAL
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gaming-accent)] to-[#00ff9d] drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
                    TOOLS
                  </span>
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-2 flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "group/nav relative flex items-center rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200",
                  isCollapsed
                    ? "justify-center p-3"
                    : "gap-3.5 px-3.5 py-3",
                  isActive
                    ? "text-[var(--color-gaming-accent)] bg-[var(--color-gaming-accent)]/10 border border-[var(--color-gaming-accent)]/30 shadow-[0_0_15px_rgba(0,229,255,0.12)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                {/* Active neon bar indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--color-gaming-accent)] shadow-[0_0_8px_var(--color-gaming-accent)]" />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110",
                    isActive ? "animate-pulse text-[var(--color-gaming-accent)]" : ""
                  )}
                />

                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-[#0b0f19]/95 border border-[var(--color-gaming-accent)]/40 text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap shadow-[0_0_20px_rgba(0,229,255,0.25)] z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Language Switcher */}
        <div className="p-3 border-t border-white/10">
          <div
            className={cn(
              "bg-black/40 border border-white/10 rounded-xl p-1.5 flex items-center",
              isCollapsed ? "flex-col gap-1" : "justify-between gap-2 px-2.5"
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4 text-[var(--color-gaming-accent)]" />
                <span>{t.nav.language}</span>
              </div>
            )}

            <div className={cn("flex items-center gap-1", isCollapsed && "flex-col w-full")}>
              <button
                type="button"
                onClick={() => setLanguage("es")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  isCollapsed && "w-full text-center",
                  language === "es"
                    ? "bg-[var(--color-gaming-accent)] text-black shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                    : "text-gray-400 hover:text-white"
                )}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  isCollapsed && "w-full text-center",
                  language === "en"
                    ? "bg-[var(--color-gaming-accent)] text-black shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                    : "text-gray-400 hover:text-white"
                )}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-50 glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center mix-blend-screen">
            <img
              src="/assets/images/wrench_icon_only.png"
              alt="MetalTools Icon"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-widest uppercase flex items-center">
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              METAL
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gaming-accent)] to-[#00ff9d] drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
              TOOLS
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLanguage("es")}
              className={cn(
                "px-2 py-1 rounded text-xs font-black uppercase tracking-wider transition-all",
                language === "es"
                  ? "bg-[var(--color-gaming-accent)] text-black"
                  : "text-gray-400 hover:text-white"
              )}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2 py-1 rounded text-xs font-black uppercase tracking-wider transition-all",
                language === "en"
                  ? "bg-[var(--color-gaming-accent)] text-black"
                  : "text-gray-400 hover:text-white"
              )}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            aria-label={t.nav.menu}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#0b0f19]/95 border-r border-white/10 flex flex-col justify-between p-5 shadow-[10px_0_40px_rgba(0,0,0,0.9)]">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center mix-blend-screen">
                    <img
                      src="/assets/images/wrench_icon_only.png"
                      alt="MetalTools Icon"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-lg font-black tracking-widest uppercase flex items-center">
                    <span className="text-white">METAL</span>
                    <span className="text-[var(--color-gaming-accent)]">TOOLS</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all",
                        isActive
                          ? "text-[var(--color-gaming-accent)] bg-[var(--color-gaming-accent)]/10 border-l-2 border-[var(--color-gaming-accent)]"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon
                        className={cn("w-5 h-5 shrink-0", isActive ? "animate-pulse" : "")}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4 text-[var(--color-gaming-accent)]" />
                <span>{t.nav.language}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLanguage("es")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider transition-all",
                    language === "es"
                      ? "bg-[var(--color-gaming-accent)] text-black"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider transition-all",
                    language === "en"
                      ? "bg-[var(--color-gaming-accent)] text-black"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
