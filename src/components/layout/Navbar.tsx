"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Film, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { openLogModal, unreadMessagesCount, requireAuth } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0f]/85 backdrop-blur-xl transition-all pt-[env(safe-area-inset-top,0px)]">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        {/* Left: Mobile Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-white group-hover:text-red-400 transition-colors">
                Film<span className="text-red-500">Tracker</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form 
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-md mx-6"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar películas, directores, actores..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:bg-white/10 focus:ring-1 focus:ring-red-500/40 transition-all"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Search Button */}
          <Link
            href="/search"
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Buscar"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Quick Log Button */}
          <button
            onClick={() => {
              if (requireAuth("registrar películas en tu diario")) {
                router.push("/search");
              }
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/25 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar</span>
          </button>

          {/* Chat Icon with Badge */}
          <Link
            href="/chat"
            className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Mensajes"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-red-500/50 transition focus:outline-none"
                >
                  <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || "User")}&background=e50914&color=fff`}
                    alt={profile?.username || "Avatar"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl p-2 shadow-2xl z-50 text-sm animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="font-semibold text-white truncate">{profile?.username}</p>
                      <p className="text-xs text-zinc-400">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href={user ? `/profile/${user.id}` : "/auth"}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition"
                    >
                      <UserIcon className="w-4 h-4 text-red-400" />
                      <span>Mi Perfil</span>
                    </Link>

                    <Link
                      href="/awards"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Premios & Badges</span>
                    </Link>

                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition mt-1 border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/25 transition active:scale-95"
                >
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
