"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Crosshair, Calculator, ScrollText, Home, Menu, X, User } from "lucide-react";
import styles from "./Navbar.module.scss";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Squad Tool", path: "/squad-tool", icon: Crosshair },
    { name: "Calculadora por Nivel", path: "/level-calculator", icon: Calculator },
    { name: "Reglamentos", path: "/reglamentos", icon: ScrollText },
    { name: "Hangar", path: "/dashboard", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`flex items-center justify-center transform group-hover:scale-110 transition-transform mix-blend-screen ${styles.logoContainer}`}>
            <img src="/assets/images/wrench_icon_only.png" alt="MetalTools Icon" className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center transform group-hover:translate-x-1 transition-transform py-2">
            <span className="text-2xl md:text-3xl font-black tracking-widest uppercase flex items-center">
              <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">METAL</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gaming-accent)] to-[#00ff9d] drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">TOOLS</span>
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300",
                  isActive 
                    ? "text-[var(--color-gaming-accent)] bg-white/5 shadow-[inset_0_-2px_0_var(--color-gaming-accent)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 hover:scale-105"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "animate-pulse" : "")} />
                {item.name}
              </Link>
            );
          })}
        </div>
        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300",
                  isActive 
                    ? "text-[var(--color-gaming-accent)] bg-white/10 border-l-2 border-[var(--color-gaming-accent)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "animate-pulse" : "")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
