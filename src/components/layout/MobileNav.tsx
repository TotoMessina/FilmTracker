"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";

const MOBILE_ITEMS = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/search", label: "Descubrir", icon: Compass },
  { href: "/diary", label: "Diario", icon: BookOpen },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/chat", label: "Chat", icon: MessageSquare, hasBadge: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const { unreadMessagesCount } = useApp();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a12]/95 backdrop-blur-2xl border-t border-white/10 px-2 pt-2 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom, 0.65rem))" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2 xs:px-3 rounded-2xl min-h-[48px] transition-all duration-200 active:scale-90 ${
                isActive 
                  ? "text-red-500 font-bold bg-red-600/10 shadow-inner" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 text-red-500" : ""}`} />
                {item.hasBadge && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-red-600 text-[9px] font-black text-white flex items-center justify-center shadow">
                    {unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? "font-bold text-white" : "font-normal"}`}>
                {item.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <span className="absolute -top-1 w-5 h-0.5 rounded-full bg-red-500 shadow-[0_0_8px_#e50914]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
