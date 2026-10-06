"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Bookmark,
  BarChart3,
  Users2,
  Globe2,
  Trophy,
  Swords,
  Users,
  MessageSquare,
  Sparkles,
  Bot,
  Clapperboard,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Descubrir", icon: Compass },
  { href: "/diary", label: "Diario", icon: BookOpen },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/connections", label: "Conexiones", icon: Users2 },
  { href: "/map", label: "Cine-Traveler", icon: Globe2 },
  { href: "/awards", label: "Premios", icon: Trophy },
  { href: "/tournament", label: "Mundial Cine", icon: Swords },
  { href: "/social", label: "Comunidad", icon: Users },
  { href: "/chat", label: "Mensajes", icon: MessageSquare, hasBadge: true },
  { href: "/ai-chat", label: "CineBuddy IA", icon: Bot, isBeta: true, isDividerBefore: true },
  { href: "/wrapped", label: "Cine Wrapped", icon: Clapperboard, badge: "2026" },
];

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { profile, isGuest } = useAuth();
  const { unreadMessagesCount } = useApp();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-white/5 bg-[#0e0e17] select-none">
      {/* Navigation section */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Navegación
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <React.Fragment key={item.href}>
              {item.isDividerBefore && (
                <div className="border-t border-zinc-800 my-2 mx-1" />
              )}
              <Link
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-red-600/20 to-transparent text-white border-l-4 border-red-600 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-red-500" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.hasBadge && unreadMessagesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                    {unreadMessagesCount}
                  </span>
                )}

                {item.isBeta && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    BETA
                  </span>
                )}

                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-white/5 m-3 rounded-2xl bg-gradient-to-br from-red-950/30 to-amber-950/20 border">
        <div className="flex items-center gap-2 mb-1.5 text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide uppercase">FilmTracker v2</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {profile?.username ? (
            <span>Conectado como <strong className="text-zinc-200">{profile.username}</strong></span>
          ) : (
            <span>Explorando en modo de alta velocidad Next.js</span>
          )}
        </p>
      </div>
    </aside>
  );
}
