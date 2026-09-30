"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderPlus, 
  Layers, 
  Film, 
  Plus, 
  Trash2, 
  Edit3, 
  Share2, 
  Check, 
  X, 
  Search, 
  Star, 
  Calendar,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { UserCollection, CollectionMovie, Log, WatchlistItem } from "@/lib/supabase/types";
import { getUserCollections, saveUserCollection, deleteUserCollection } from "@/lib/services/collections";
import { getImageUrl, searchMovies } from "@/lib/tmdb/client";

interface ProfileCollectionsProps {
  userId: string;
  isMe: boolean;
  userLogs: Log[];
  userWatchlist: WatchlistItem[];
}

export function ProfileCollections({
  userId,
  isMe,
  userLogs,
  userWatchlist,
}: ProfileCollectionsProps) {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeCollection, setActiveCollection] = useState<UserCollection | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);

  // Editor form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMovies, setFormMovies] = useState<CollectionMovie[]>([]);
  const [addSourceTab, setAddSourceTab] = useState<"logs" | "watchlist" | "search">("logs");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<CollectionMovie[]>([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load collections
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getUserCollections(userId);
        setCollections(data);
      } catch (err) {
        console.error("Error loading collections:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  // Open editor for new collection
  const handleOpenNew = () => {
    setEditingCollectionId(null);
    setFormTitle("");
    setFormDescription("");
    setFormMovies([]);
    setTmdbQuery("");
    setTmdbResults([]);
    setAddSourceTab("logs");
    setIsEditorOpen(true);
  };

  // Open editor for existing collection
  const handleOpenEdit = (col: UserCollection) => {
    setEditingCollectionId(col.id);
    setFormTitle(col.title);
    setFormDescription(col.description || "");
    setFormMovies([...col.movies]);
    setTmdbQuery("");
    setTmdbResults([]);
    setAddSourceTab("logs");
    setIsEditorOpen(true);
    setActiveCollection(null);
  };

  // Search TMDB
  const handleTmdbSearch = async () => {
    if (!tmdbQuery.trim()) return;
    setIsSearchingTmdb(true);
    try {
      const res = await searchMovies(tmdbQuery.trim(), 1);
      const mapped: CollectionMovie[] = (res.results || []).slice(0, 10).map((m) => ({
        tmdb_id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
        vote_average: m.vote_average,
      }));
      setTmdbResults(mapped);
    } catch (err) {
      console.warn("TMDB search error:", err);
    } finally {
      setIsSearchingTmdb(false);
    }
  };

  // Add movie to current editor collection
  const handleAddMovie = (movie: CollectionMovie) => {
    if (formMovies.some((m) => m.tmdb_id === movie.tmdb_id)) return;
    setFormMovies((prev) => [...prev, movie]);
  };

  // Remove movie from editor collection
  const handleRemoveMovie = (tmdbId: number) => {
    setFormMovies((prev) => prev.filter((m) => m.tmdb_id !== tmdbId));
  };

  // Save collection
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const colId = editingCollectionId || `col_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const cover = formMovies.length > 0 ? formMovies[0].poster_path : null;

    const newCol: UserCollection = {
      id: colId,
      user_id: userId,
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      cover_poster_path: cover,
      movies: formMovies,
      created_at: new Date().toISOString(),
    };

    try {
      await saveUserCollection(newCol);
      // Update local state
      setCollections((prev) => {
        const idx = prev.findIndex((c) => c.id === colId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newCol;
          return copy;
        }
        return [newCol, ...prev];
      });

      setSaveStatus("¡Colección guardada con éxito!");
      setTimeout(() => {
        setSaveStatus(null);
        setIsEditorOpen(false);
      }, 1000);
    } catch (err) {
      console.error("Error saving collection:", err);
    }
  };

  // Delete collection
  const handleDeleteCollection = async (collectionId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta colección?")) return;
    try {
      await deleteUserCollection(collectionId, userId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      if (activeCollection?.id === collectionId) {
        setActiveCollection(null);
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
    }
  };

  // Share collection link
  const handleShare = (col: UserCollection) => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/profile/${userId}?collection=${col.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-zinc-400 flex items-center justify-center gap-2">
        <Layers className="w-5 h-5 animate-pulse text-red-500" />
        <span className="text-sm">Cargando colecciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#141420] border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h2 className="text-base sm:text-lg font-black text-white">Colecciones Temáticas</h2>
            <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
              {collections.length}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Listas personalizadas y selecciones curadas de películas para compartir.
          </p>
        </div>

        {isMe && (
          <button
            onClick={handleOpenNew}
            className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Crear Colección</span>
          </button>
        )}
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-[#141420]/60 border border-white/5 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-500">
            <Layers className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Sin colecciones todavía</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-5">
            {isMe
              ? "Crea listas temáticas como 'Películas de culto', 'Joyas de terror' o 'Para ver en pareja' y compártelas con tus seguidores."
              : "Este usuario aún no ha creado colecciones públicas de películas."}
          </p>
          {isMe && (
            <button
              onClick={handleOpenNew}
              className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-red-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primera colección</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {collections.map((col) => {
            const previewPosters = col.movies.slice(0, 4);
            return (
              <div
                key={col.id}
                onClick={() => setActiveCollection(col)}
                className="group cursor-pointer rounded-3xl bg-[#141420] border border-white/5 hover:border-white/20 transition-all duration-300 p-4 flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                {/* Visual Poster Collage */}
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 relative mb-4">
                  {previewPosters.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                      <Film className="w-8 h-8 mb-1" />
                      <span className="text-[11px]">Colección vacía</span>
                    </div>
                  ) : previewPosters.length === 1 ? (
                    <img
                      src={getImageUrl(previewPosters[0].poster_path, "w500")}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-0.5 group-hover:scale-105 transition duration-500">
                      {previewPosters.map((m, idx) => (
                        <div key={idx} className="overflow-hidden bg-zinc-900">
                          <img
                            src={getImageUrl(m.poster_path, "w342")}
                            alt={m.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Badge with count */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-black text-white flex items-center gap-1 shadow-lg">
                    <Film className="w-3 h-3 text-red-500" />
                    <span>{col.movies.length}</span>
                  </div>
                </div>

                {/* Collection Meta */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-white text-base group-hover:text-red-400 transition line-clamp-1">
                    {col.title}
                  </h3>
                  {col.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                  <span>{new Date(col.created_at).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}</span>
                  <span className="font-bold text-red-400 group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                    Ver colección →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: View Collection Details */}
      {activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141420] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl sm:text-2xl font-black text-white">{activeCollection.title}</h2>
                  <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                    {activeCollection.movies.length} películas
                  </span>
                </div>
                {activeCollection.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                    {activeCollection.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(activeCollection)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition"
                  title="Copiar enlace"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedLink ? "¡Copiado!" : "Compartir"}</span>
                </button>

                {isMe && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(activeCollection)}
                      className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition"
                      title="Editar colección"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(activeCollection.id)}
                      className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-1.5 transition"
                      title="Eliminar colección"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveCollection(null)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Movie Grid */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeCollection.movies.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  Esta colección aún no tiene películas agregadas.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {activeCollection.movies.map((m) => {
                    const year = m.release_date ? new Date(m.release_date).getFullYear() : null;
                    return (
                      <Link
                        key={m.tmdb_id}
                        href={`/movie/${m.tmdb_id}`}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-black/40 border border-white/5 hover:border-white/20 transition shadow-lg"
                      >
                        <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                          <img
                            src={getImageUrl(m.poster_path, "w500")}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-red-400 transition">
                            {m.title}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                            {year && <span>{year}</span>}
                            {m.vote_average ? (
                              <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{m.vote_average.toFixed(1)}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Collection (Only for isMe) */}
      {isEditorOpen && isMe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141420] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-black text-white">
                  {editingCollectionId ? "Editar Colección" : "Nueva Colección de Películas"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form & Selection Body */}
            <form onSubmit={handleSaveCollection} className="flex-1 overflow-y-auto p-6 space-y-6">
              {saveStatus && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
                  {saveStatus}
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Título de la Colección *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. Joyas Ocultas del Cine Sci-Fi, Maratón Fin de Semana..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500/50 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Descripción / De qué trata la lista (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Escribe brevemente por qué seleccionaste estas películas o qué tienen en común..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-red-500/50 transition resize-none"
                  />
                </div>
              </div>

              {/* Selected Movies Preview Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Películas en la Colección ({formMovies.length})
                  </span>
                  {formMovies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormMovies([])}
                      className="text-[11px] text-rose-400 hover:text-rose-300 transition"
                    >
                      Vaciar todas
                    </button>
                  )}
                </div>

                {formMovies.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-zinc-500">
                    Aún no has agregado películas a esta colección. Selecciona abajo desde tu diario, watchlist o búscala en TMDB.
                  </div>
                ) : (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {formMovies.map((m) => (
                      <div
                        key={m.tmdb_id}
                        className="relative w-20 shrink-0 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group"
                      >
                        <img
                          src={getImageUrl(m.poster_path, "w185")}
                          alt={m.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMovie(m.tmdb_id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-white transition shadow"
                          title="Quitar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1">
                          <p className="text-[10px] text-white font-bold truncate">{m.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Movies Section */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Añadir Películas
                  </span>

                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setAddSourceTab("logs")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        addSourceTab === "logs" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      De mi Diario ({userLogs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddSourceTab("watchlist")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        addSourceTab === "watchlist" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      De mi Watchlist ({userWatchlist.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddSourceTab("search")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        addSourceTab === "search" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Buscar TMDB
                    </button>
                  </div>
                </div>

                {/* Source Tab 1: Diario */}
                {addSourceTab === "logs" && (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {userLogs.length === 0 ? (
                      <div className="text-xs text-zinc-500 py-4 text-center">No hay películas en tu diario.</div>
                    ) : (
                      userLogs.map((log) => {
                        const isAdded = formMovies.some((m) => m.tmdb_id === log.tmdb_id);
                        return (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(log.custom_poster_path || log.movie?.poster_path, "w92")}
                                alt={log.movie?.title || "Película"}
                                className="w-9 h-13 object-cover rounded-lg bg-zinc-900"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-white line-clamp-1">{log.movie?.title}</h4>
                                <span className="text-[11px] text-zinc-400">
                                  {log.rating ? `★ ${log.rating}/10` : "Sin calificar"}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                handleAddMovie({
                                  tmdb_id: log.tmdb_id,
                                  title: log.movie?.title || "Película",
                                  poster_path: log.custom_poster_path || log.movie?.poster_path || null,
                                  release_date: log.movie?.release_date || null,
                                  vote_average: log.movie?.vote_average || null,
                                });
                              }}
                              disabled={isAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                isAdded
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                  : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Agregada</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Añadir</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Source Tab 2: Watchlist */}
                {addSourceTab === "watchlist" && (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {userWatchlist.length === 0 ? (
                      <div className="text-xs text-zinc-500 py-4 text-center">Tu watchlist está vacía.</div>
                    ) : (
                      userWatchlist.map((item) => {
                        const isAdded = formMovies.some((m) => m.tmdb_id === item.tmdb_id);
                        return (
                          <div
                            key={item.tmdb_id}
                            className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(item.movie?.poster_path, "w92")}
                                alt={item.title || "Película"}
                                className="w-9 h-13 object-cover rounded-lg bg-zinc-900"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                                <span className="text-[11px] text-zinc-400">En tu lista de pendientes</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                handleAddMovie({
                                  tmdb_id: item.tmdb_id,
                                  title: item.title || item.movie?.title || "Película",
                                  poster_path: item.movie?.poster_path || null,
                                  release_date: item.movie?.release_date || null,
                                  vote_average: item.movie?.vote_average || null,
                                });
                              }}
                              disabled={isAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                isAdded
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                  : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Agregada</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Añadir</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Source Tab 3: TMDB Live Search */}
                {addSourceTab === "search" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={tmdbQuery}
                          onChange={(e) => setTmdbQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleTmdbSearch();
                            }
                          }}
                          placeholder="Buscar cualquier película en el catálogo global de TMDB..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-red-500/50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTmdbSearch}
                        disabled={isSearchingTmdb}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition disabled:opacity-50"
                      >
                        {isSearchingTmdb ? "Buscando..." : "Buscar"}
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {tmdbResults.map((movie) => {
                        const isAdded = formMovies.some((m) => m.tmdb_id === movie.tmdb_id);
                        return (
                          <div
                            key={movie.tmdb_id}
                            className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(movie.poster_path, "w92")}
                                alt={movie.title}
                                className="w-9 h-13 object-cover rounded-lg bg-zinc-900"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-white line-clamp-1">{movie.title}</h4>
                                <span className="text-[11px] text-zinc-400">
                                  {movie.release_date ? movie.release_date.split("-")[0] : ""}
                                  {movie.vote_average ? ` • ★ ${movie.vote_average.toFixed(1)}` : ""}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddMovie(movie)}
                              disabled={isAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                isAdded
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                  : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Agregada</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Añadir</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formTitle.trim()}
                  className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Colección</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileCollections;
