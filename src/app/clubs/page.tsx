"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users2,
  Plus,
  Search,
  Film,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { Cineclub } from "@/lib/supabase/types";
import { getCineclubs, createCineclub } from "@/lib/services/cineclubs";
import { getBackdropUrl, getImageUrl } from "@/lib/tmdb/client";

export default function CineclubsIndexPage() {
  const { user, profile, isGuest } = useAuth();
  const { triggerConfetti } = useApp();

  const [clubs, setClubs] = useState<Cineclub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  // Create Club Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubDesc, setNewClubDesc] = useState("");
  const [newClubCover, setNewClubCover] = useState("");
  const [newClubDeadline, setNewClubDeadline] = useState("");
  const [creating, setCreating] = useState(false);

  const currentUserId = user?.id || (isGuest ? "guest-user-123" : "");

  const loadClubs = async () => {
    setLoading(true);
    try {
      const data = await getCineclubs();
      setClubs(data);
    } catch (err) {
      console.warn("Error cargando cineclubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();

    const handleUpdate = () => loadClubs();
    window.addEventListener("filmtracker_cineclubs_updated", handleUpdate);
    return () => {
      window.removeEventListener("filmtracker_cineclubs_updated", handleUpdate);
    };
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    setCreating(true);
    try {
      const creatorProfile = profile
        ? {
            id: profile.id,
            username: profile.username || "Mi Usuario",
            avatar_url: profile.avatar_url || null,
          }
        : {
            id: currentUserId || "guest-user-123",
            username: isGuest ? "Invitado Cinéfilo" : "Mi Usuario",
            avatar_url: null,
          };

      await createCineclub(
        {
          name: newClubName.trim(),
          description: newClubDesc.trim() || undefined,
          cover_url: newClubCover.trim() || undefined,
          discussion_date: newClubDeadline || undefined,
        },
        creatorProfile
      );

      triggerConfetti();
      setIsCreateOpen(false);
      setNewClubName("");
      setNewClubDesc("");
      setNewClubCover("");
      setNewClubDeadline("");
      loadClubs();
    } catch (err) {
      console.error("Error creando cineclub:", err);
    } finally {
      setCreating(false);
    }
  };

  // Filter clubs
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (club.current_movie && club.current_movie.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "my") {
      const isMember = (club.members || []).some((m) => m.user_id === currentUserId);
      return isMember || club.creator_id === currentUserId;
    }

    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-[#181126] to-[#120f1d] border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Users2 className="w-4 h-4" />
              <span>Comunidad & Clubes Virtuales</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Clubes de Cine
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Elegí una película por semana o mes en grupo, votá en encuestas democráticas, marcá cuando ya la viste y participá en debates apasionados <strong className="text-amber-400 font-bold">sin spoilers</strong>.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Club</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[#11111a] border border-white/5">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Todos los Clubes ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "my"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Mis Clubes
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, temática o película..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
          <p className="text-xs text-zinc-400">Cargando clubes de cine...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredClubs.length === 0 && (
        <div className="p-12 rounded-3xl bg-[#101018] border border-white/5 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
            <Users2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No se encontraron clubes</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {activeTab === "my"
              ? "Aún no sos miembro de ningún cineclub. Unite a uno de la lista o creá el tuyo propio para ver cine con amigos."
              : "Probá con otra búsqueda o sé el primero en fundar un nuevo cineclub."}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Club</span>
          </button>
        </div>
      )}

      {/* Cineclubs Grid */}
      {!loading && filteredClubs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const memberCount = (club.members || []).length;
            const watchedCount = (club.members || []).filter((m) => m.has_watched).length;
            const isMember = (club.members || []).some((m) => m.user_id === currentUserId);
            const userWatched = (club.members || []).some((m) => m.user_id === currentUserId && m.has_watched);

            return (
              <div
                key={club.id}
                className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#151522] to-[#0e0e17] overflow-hidden shadow-xl hover:border-red-500/40 hover:shadow-red-950/20 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cover Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={club.cover_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"}
                    alt={club.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151522] via-[#151522]/60 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-extrabold text-white flex items-center gap-1.5 shadow">
                      <Users2 className="w-3 h-3 text-red-400" />
                      <span>{memberCount} miembros</span>
                    </span>

                    {isMember && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                        Miembro
                      </span>
                    )}
                  </div>

                  {/* Title & Creator on Cover bottom */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-black text-white tracking-tight drop-shadow truncate">
                      {club.name}
                    </h3>
                    {club.creator && (
                      <span className="text-[11px] text-zinc-300 font-medium">
                        Por @{club.creator.username}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                    {club.description || "Un club cinéfilo para compartir debates, votaciones y buen cine."}
                  </p>

                  {/* Current Active Movie Widget */}
                  {club.current_movie && (
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        <span className="flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          Película Activa
                        </span>
                        {club.discussion_date && (
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(club.discussion_date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                          {club.current_movie.poster_path ? (
                            <Image
                              src={getImageUrl(club.current_movie.poster_path, "w185")}
                              alt={club.current_movie.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Film className="w-4 h-4 text-zinc-500 m-auto" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">
                            {club.current_movie.title}
                          </h4>
                          {club.current_movie.release_date && (
                            <span className="text-[10px] text-zinc-400 block">
                              {club.current_movie.release_date.split("-")[0]} • {club.current_movie.runtime ? `${club.current_movie.runtime} min` : "Film"}
                            </span>
                          )}

                          {/* Progress bar */}
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                                style={{ width: `${memberCount > 0 ? (watchedCount / memberCount) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 shrink-0">
                              {watchedCount}/{memberCount} listos
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Action Link */}
                  <div className="pt-2">
                    <Link
                      href={`/clubs/${club.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition flex items-center justify-between group-hover:border-red-500/40"
                    >
                      <span>{isMember ? "Entrar al Club" : "Ver Club & Unirme"}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-red-400 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Nuevo Club */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setIsCreateOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#181524] to-[#0f0e17] p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                  <Users2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">Crear Nuevo Cineclub</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Nombre del Club *
                </label>
                <input
                  type="text"
                  required
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="Ej: Club Scorsese, Cronenberg Fans, Cine de Oro..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Descripción o Manifiesto
                </label>
                <textarea
                  rows={3}
                  value={newClubDesc}
                  onChange={(e) => setNewClubDesc(e.target.value)}
                  placeholder="¿Cuál es la temática del club? ¿Cada cuánto se elige película y debaten?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Imagen de Portada (URL opcional)
                </label>
                <input
                  type="url"
                  value={newClubCover}
                  onChange={(e) => setNewClubCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Fecha del Próximo Debate (opcional)
                </label>
                <input
                  type="date"
                  value={newClubDeadline}
                  onChange={(e) => setNewClubDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newClubName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Fundar Club"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
