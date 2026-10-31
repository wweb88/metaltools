"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, Globe, Loader2, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  fetchStreamersInfo,
  StreamerInfo,
  StreamerSocials,
} from "@/lib/data-service";

type SocialKey = keyof StreamerSocials;

interface SocialConfig {
  label: string;
  color: string;
  hoverBg: string;
  borderColor: string;
  icon: React.ReactNode;
}

const SOCIAL_CONFIG: Record<SocialKey, SocialConfig> = {
  twitch: {
    label: "Twitch",
    color: "#a970ff",
    hoverBg: "hover:bg-[#9146FF]/20",
    borderColor: "border-[#9146FF]/40 hover:border-[#9146FF]",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    color: "#ff4e4e",
    hoverBg: "hover:bg-[#FF0000]/20",
    borderColor: "border-[#FF0000]/40 hover:border-[#FF0000]",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    color: "#00f2fe",
    hoverBg: "hover:bg-[#00f2fe]/15",
    borderColor: "border-[#00f2fe]/40 hover:border-[#00f2fe]",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  kick: {
    label: "Kick",
    color: "#53FC18",
    hoverBg: "hover:bg-[#53FC18]/15",
    borderColor: "border-[#53FC18]/40 hover:border-[#53FC18]",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M1.333 0h8v5.333H12V2.667h2.667V0h8v8H20v2.667h-2.667v2.666H20V16h2.667v8h-8v-2.667H12v-2.666H9.333V24h-8Z" />
      </svg>
    ),
  },
  instagram: {
    label: "Instagram",
    color: "#f472b6",
    hoverBg: "hover:bg-pink-500/20",
    borderColor: "border-pink-500/40 hover:border-pink-400",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  twitter: {
    label: "X",
    color: "#e2e8f0",
    hoverBg: "hover:bg-white/15",
    borderColor: "border-white/25 hover:border-white",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  discord: {
    label: "Discord",
    color: "#7289da",
    hoverBg: "hover:bg-[#5865F2]/20",
    borderColor: "border-[#5865F2]/40 hover:border-[#5865F2]",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    color: "#3b82f6",
    hoverBg: "hover:bg-blue-500/20",
    borderColor: "border-blue-500/40 hover:border-blue-400",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  web: {
    label: "Web",
    color: "#00e5ff",
    hoverBg: "hover:bg-[var(--color-gaming-accent)]/20",
    borderColor: "border-[var(--color-gaming-accent)]/40 hover:border-[var(--color-gaming-accent)]",
    icon: <Globe className="w-4 h-4" />,
  },
};

function getFlagUrl(country?: string): string | null {
  if (!country) return null;
  const trimmed = country.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("http")) {
    return trimmed;
  }
  return `https://flagcdn.com/w40/${trimmed.toLowerCase()}.png`;
}

export function StreamersClient() {
  const { language, t } = useLanguage();
  const [streamers, setStreamers] = useState<StreamerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("#GQBGPM6");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchStreamersInfo();
      setStreamers(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[var(--color-gaming-accent)] animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
          {t.loading.title}...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* HERO HEADER */}
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f19] via-[#131b2e] to-[#0b0f19] p-8 md:p-14 text-center shadow-[0_0_50px_rgba(0,0,0,0.6)]">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[var(--color-gaming-accent)] opacity-15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-[350px] h-[200px] bg-[var(--color-gaming-secondary)] opacity-10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-gaming-accent)]/10 border border-[var(--color-gaming-accent)]/30 text-[var(--color-gaming-accent)] text-xs font-black uppercase tracking-[0.25em]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{t.streamersPage.badge}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_25px_rgba(0,229,255,0.25)]">
            {t.streamersPage.title}
          </h1>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            {t.streamersPage.subtitle}
          </p>
        </div>
      </header>

      {/* STREAMERS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {streamers.map((streamer, idx) => {
          const descriptionText =
            typeof streamer.description === "string"
              ? streamer.description
              : streamer.description[language] || streamer.description.es;

          const socialEntries = Object.entries(streamer.socials || {}).filter(
            ([key, url]) => Boolean(url) && key in SOCIAL_CONFIG
          ) as [SocialKey, string][];

          const flagUrl = getFlagUrl(streamer.country);

          return (
            <motion.article
              key={streamer.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group relative rounded-2xl glass-panel border border-white/10 hover:border-[var(--color-gaming-accent)]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.45)] hover:shadow-[0_0_30px_rgba(0,229,255,0.18)]"
            >
              {/* Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[var(--color-gaming-accent)] via-[#00ff9d] to-[var(--color-gaming-secondary)] opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 space-y-5 flex-1 flex flex-col">
                {/* Avatar + Identity */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--color-gaming-accent)]/50 shadow-[0_0_20px_rgba(0,229,255,0.25)] bg-black/60">
                        <img
                          src={streamer.avatar}
                          alt={streamer.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00ff9d] border-2 border-[#0b0f19] shadow-[0_0_8px_#00ff9d]"
                        title="Creator"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-white truncate group-hover:text-[var(--color-gaming-accent)] transition-colors">
                          {streamer.name}
                        </h2>
                        {flagUrl && (
                          <img
                            src={flagUrl}
                            alt={streamer.country || "Flag"}
                            title={streamer.country?.toUpperCase()}
                            className="w-6 h-4 object-cover rounded-[3px] border border-white/20 shadow-[0_0_8px_rgba(0,0,0,0.6)] shrink-0"
                          />
                        )}
                      </div>
                      {streamer.tag && (
                        <p className="text-xs font-bold tracking-wider text-gray-400 truncate">
                          {streamer.tag}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Language Pill */}
                  {streamer.language && (
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-[var(--color-gaming-accent)]">
                      {streamer.language}
                    </span>
                  )}
                </div>

                {/* Bio / Description */}
                <p className="text-gray-300 text-sm leading-relaxed flex-1">
                  {descriptionText}
                </p>

                {/* Social Links */}
                <div className="pt-4 border-t border-white/10 space-y-2.5">
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {t.streamersPage.socialsLabel}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {socialEntries.map(([network, url]) => {
                      const cfg = SOCIAL_CONFIG[network];
                      return (
                        <a
                          key={network}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: cfg.color }}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 border text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 ${cfg.borderColor} ${cfg.hoverBg}`}
                        >
                          {cfg.icon}
                          <span className="text-white">{cfg.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      {/* CALLOUT BANNER FOR NEW STREAMERS */}
      <div className="rounded-2xl glass-panel border border-[var(--color-gaming-accent)]/25 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-gaming-accent)]/15 border border-[var(--color-gaming-accent)]/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[var(--color-gaming-accent)]" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider text-white">
              {t.streamersPage.joinTitle}
            </h3>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              {t.streamersPage.joinSubtitle}{" "}
              <span className="text-white font-black">White</span>{" "}
              <span className="text-[var(--color-gaming-accent)] font-black">
                ( #GQBGPM6 )
              </span>
              .{" "}
              <span className="text-[#00ff9d] font-bold">
                {t.streamersPage.joinFreeNote}
              </span>
            </p>
          </div>
        </div>

        {/* In-game Contact Pill with Copy Button */}
        <button
          type="button"
          onClick={handleCopyCode}
          title={t.streamersPage.copyCode}
          className="shrink-0 group flex items-center gap-3 px-4 py-3 rounded-xl bg-black/50 border border-[var(--color-gaming-accent)]/40 hover:border-[var(--color-gaming-accent)] hover:bg-[var(--color-gaming-accent)]/10 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.12)]"
        >
          <div className="text-left">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
              {t.streamersPage.contactLabel}
            </span>
            <div className="flex items-center gap-2 text-sm font-black tracking-wider">
              <span className="text-white">White</span>
              <span className="text-[var(--color-gaming-accent)]">#GQBGPM6</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[var(--color-gaming-accent)] group-hover:text-black text-[var(--color-gaming-accent)] transition-colors">
            {copied ? (
              <Check className="w-4 h-4 text-[#00ff9d] group-hover:text-black" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
