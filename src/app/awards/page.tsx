"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  CheckCircle,
  Circle,
  Plus,
  Sparkles,
  ExternalLink,
  Star,
  Film,
  Calendar,
  Share2,
  Copy,
  Check,
  Users,
  Medal,
  TrendingUp,
  Flame,
  X,
  ChevronRight,
  Info,
  Save,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useApp } from "@/lib/context/AppContext";
import { supabase } from "@/lib/supabase/client";
import { getMovieDetails, getImageUrl, TMDBMovie } from "@/lib/tmdb/client";
import AICoach from "@/components/awards/AICoach";
import { AwardsPrediction } from "@/lib/supabase/types";
import {
  getUserAwardsPrediction,
  saveUserAwardsPrediction,
  calculatePredictionScore,
  getSeasonLeaderboard,
  ScoreBreakdown,
  LeaderboardEntry,
} from "@/lib/services/awardsPredictions";

interface Nominee {
  tmdb_id: number;
  title: string;
  nominationDetails?: string;
  isWinner?: boolean;
}

interface AwardCategory {
  name: string;
  nominees: Nominee[];
}

interface SeasonEdition {
  year: number;
  edition: string;
  title: string;
  description: string;
  categories: AwardCategory[];
}

const OSCARS_EDITIONS: Record<number, SeasonEdition> = {
  2026: {
    year: 2026,
    edition: "98ª Edición",
    title: "Temporada de Premios 2026",
    description: "Monitorea tu progreso antes de la gran noche del cine y pronostica a tus favoritos en la Quiniela Oficial.",
    categories: [
      {
        name: "Mejor Película",
        nominees: [
          { tmdb_id: 1054867, title: "One Battle After Another", nominationDetails: "Paul Thomas Anderson" },
          { tmdb_id: 1233413, title: "Sinners", nominationDetails: "Ryan Coogler" },
          { tmdb_id: 858024, title: "Hamnet", nominationDetails: "Chloé Zhao" },
          { tmdb_id: 1062722, title: "Frankenstein", nominationDetails: "Guillermo del Toro" },
          { tmdb_id: 701387, title: "Bugonia", nominationDetails: "Yorgos Lanthimos" },
          { tmdb_id: 911430, title: "F1", nominationDetails: "Joseph Kosinski" },
          { tmdb_id: 1317288, title: "Marty Supreme", nominationDetails: "Josh Safdie" },
          { tmdb_id: 1220564, title: "The Secret Agent", nominationDetails: "Kleber Mendonça Filho" },
          { tmdb_id: 1124566, title: "Sentimental Value", nominationDetails: "Joachim Trier" },
          { tmdb_id: 1078605, title: "Weapons", nominationDetails: "Zach Cregger" },
        ],
      },
      {
        name: "Mejor Dirección",
        nominees: [
          { tmdb_id: 1054867, title: "Paul Thomas Anderson", nominationDetails: "One Battle After Another" },
          { tmdb_id: 1233413, title: "Ryan Coogler", nominationDetails: "Sinners" },
          { tmdb_id: 858024, title: "Chloé Zhao", nominationDetails: "Hamnet" },
          { tmdb_id: 1062722, title: "Guillermo del Toro", nominationDetails: "Frankenstein" },
          { tmdb_id: 701387, title: "Yorgos Lanthimos", nominationDetails: "Bugonia" },
        ],
      },
      {
        name: "Mejor Película Animada",
        nominees: [
          { tmdb_id: 1022787, title: "Elio", nominationDetails: "Pixar Animation Studios" },
          { tmdb_id: 1084242, title: "Zootopia 2", nominationDetails: "Walt Disney Animation Studios" },
          { tmdb_id: 1175942, title: "The Bad Guys 2", nominationDetails: "DreamWorks Animation" },
          { tmdb_id: 774370, title: "Dog Man", nominationDetails: "Universal Pictures / DreamWorks" },
        ],
      },
      {
        name: "Mejor Guion Original",
        nominees: [
          { tmdb_id: 1233413, title: "Sinners", nominationDetails: "Ryan Coogler" },
          { tmdb_id: 1078605, title: "Weapons", nominationDetails: "Zach Cregger" },
          { tmdb_id: 1124566, title: "Sentimental Value", nominationDetails: "Eskil Vogt, Joachim Trier" },
          { tmdb_id: 1220564, title: "The Secret Agent", nominationDetails: "Kleber Mendonça Filho" },
          { tmdb_id: 701387, title: "Bugonia", nominationDetails: "Will Tracy" },
        ],
      },
    ],
  },
  2025: {
    year: 2025,
    edition: "97ª Edición",
    title: "Oscars 2025",
    description: "Revive las grandes nominadas y ganadoras de las películas estrenadas en 2024.",
    categories: [
      {
        name: "Mejor Película",
        nominees: [
          { tmdb_id: 1064213, title: "Anora", nominationDetails: "Sean Baker", isWinner: true },
          { tmdb_id: 1276843, title: "The Brutalist", nominationDetails: "Brady Corbet" },
          { tmdb_id: 974576, title: "Conclave", nominationDetails: "Edward Berger" },
          { tmdb_id: 1241982, title: "Emilia Pérez", nominationDetails: "Jacques Audiard" },
          { tmdb_id: 1119494, title: "The Substance", nominationDetails: "Coralie Fargeat" },
          { tmdb_id: 1152748, title: "Wicked", nominationDetails: "Jon M. Chu" },
          { tmdb_id: 1225916, title: "A Complete Unknown", nominationDetails: "James Mangold" },
          { tmdb_id: 1028196, title: "Nickel Boys", nominationDetails: "RaMell Ross" },
          { tmdb_id: 693134, title: "Dune: Part Two", nominationDetails: "Denis Villeneuve" },
          { tmdb_id: 1156593, title: "I'm Still Here", nominationDetails: "Walter Salles" },
        ],
      },
      {
        name: "Mejor Dirección",
        nominees: [
          { tmdb_id: 1064213, title: "Sean Baker", nominationDetails: "Anora", isWinner: true },
          { tmdb_id: 1276843, title: "Brady Corbet", nominationDetails: "The Brutalist" },
          { tmdb_id: 1241982, title: "Jacques Audiard", nominationDetails: "Emilia Pérez" },
          { tmdb_id: 1119494, title: "Coralie Fargeat", nominationDetails: "The Substance" },
          { tmdb_id: 1225916, title: "James Mangold", nominationDetails: "A Complete Unknown" },
        ],
      },
      {
        name: "Mejor Película Animada",
        nominees: [
          { tmdb_id: 823219, title: "Flow", nominationDetails: "Gints Zilbalodis", isWinner: true },
          { tmdb_id: 1029575, title: "The Wild Robot", nominationDetails: "DreamWorks Animation" },
          { tmdb_id: 1195506, title: "Inside Out 2", nominationDetails: "Pixar Animation" },
          { tmdb_id: 1064486, title: "Memoir of a Snail", nominationDetails: "Adam Elliot" },
          { tmdb_id: 762441, title: "Wallace & Gromit: Vengeance Most Fowl", nominationDetails: "Aardman" },
        ],
      },
      {
        name: "Mejor Película Internacional",
        nominees: [
          { tmdb_id: 1156593, title: "I'm Still Here", nominationDetails: "Brasil", isWinner: true },
          { tmdb_id: 1241982, title: "Emilia Pérez", nominationDetails: "Francia" },
          { tmdb_id: 823219, title: "Flow", nominationDetails: "Letonia" },
          { tmdb_id: 1208668, title: "The Girl With the Needle", nominationDetails: "Dinamarca/Polonia" },
          { tmdb_id: 1278263, title: "The Seed of the Sacred Fig", nominationDetails: "Alemania" },
        ],
      },
      {
        name: "Mejor Guion Original",
        nominees: [
          { tmdb_id: 1064213, title: "Anora", nominationDetails: "Sean Baker", isWinner: true },
          { tmdb_id: 1197306, title: "A Real Pain", nominationDetails: "Jesse Eisenberg" },
          { tmdb_id: 1241982, title: "Emilia Pérez", nominationDetails: "Jacques Audiard" },
          { tmdb_id: 1111873, title: "September 5", nominationDetails: "Moritz Binder, Tim Fehlbaum" },
          { tmdb_id: 1119494, title: "The Substance", nominationDetails: "Coralie Fargeat" },
        ],
      },
    ],
  },
  2024: {
    year: 2024,
    edition: "96ª Edición",
    title: "Oscars 2024",
    description: "Revive las grandes nominadas y ganadoras de las películas estrenadas en 2023.",
    categories: [
      {
        name: "Mejor Película",
        nominees: [
          { tmdb_id: 872585, title: "Oppenheimer", nominationDetails: "Christopher Nolan", isWinner: true },
          { tmdb_id: 792307, title: "Poor Things", nominationDetails: "Yorgos Lanthimos" },
          { tmdb_id: 466420, title: "Killers of the Flower Moon", nominationDetails: "Martin Scorsese" },
          { tmdb_id: 915935, title: "Anatomy of a Fall", nominationDetails: "Justine Triet" },
          { tmdb_id: 93562, title: "The Zone of Interest", nominationDetails: "Jonathan Glazer" },
          { tmdb_id: 346698, title: "Barbie", nominationDetails: "Greta Gerwig" },
          { tmdb_id: 840430, title: "The Holdovers", nominationDetails: "Alexander Payne" },
          { tmdb_id: 666277, title: "Past Lives", nominationDetails: "Celine Song" },
        ],
      },
      {
        name: "Mejor Dirección",
        nominees: [
          { tmdb_id: 872585, title: "Christopher Nolan", nominationDetails: "Oppenheimer", isWinner: true },
          { tmdb_id: 792307, title: "Yorgos Lanthimos", nominationDetails: "Poor Things" },
          { tmdb_id: 466420, title: "Martin Scorsese", nominationDetails: "Killers of the Flower Moon" },
          { tmdb_id: 915935, title: "Justine Triet", nominationDetails: "Anatomy of a Fall" },
          { tmdb_id: 93562, title: "Jonathan Glazer", nominationDetails: "The Zone of Interest" },
        ],
      },
      {
        name: "Mejor Película Animada",
        nominees: [
          { tmdb_id: 508883, title: "The Boy and the Heron", nominationDetails: "Hayao Miyazaki", isWinner: true },
          { tmdb_id: 569094, title: "Spider-Man: Across the Spider-Verse", nominationDetails: "Sony Pictures Animation" },
          { tmdb_id: 940551, title: "Migration", nominationDetails: "Illumination" },
          { tmdb_id: 745376, title: "Elemental", nominationDetails: "Pixar" },
          { tmdb_id: 969681, title: "Robot Dreams", nominationDetails: "Pablo Berger" },
        ],
      },
      {
        name: "Mejor Película Internacional",
        nominees: [
          { tmdb_id: 93562, title: "The Zone of Interest", nominationDetails: "Reino Unido", isWinner: true },
          { tmdb_id: 976893, title: "Perfect Days", nominationDetails: "Japón" },
          { tmdb_id: 852096, title: "Society of the Snow", nominationDetails: "España" },
          { tmdb_id: 1034587, title: "Io Capitano", nominationDetails: "Italia" },
          { tmdb_id: 998846, title: "The Teachers' Lounge", nominationDetails: "Alemania" },
        ],
      },
    ],
  },
};

type AwardsTab = "tracker" | "prode" | "leaderboard";

export default function AwardsPage() {
  const { user, profile, isGuest } = useAuth();
  const { openLogModal, triggerConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<AwardsTab>("tracker");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [watchedTmdbIds, setWatchedTmdbIds] = useState<Set<number>>(new Set());
  const [watchlistTitles, setWatchlistTitles] = useState<string[]>([]);
  const [movieDetails, setMovieDetails] = useState<Record<number, Partial<TMDBMovie>>>({});
  const [loading, setLoading] = useState(true);

  // Prode / Quiniela State
  const [userPredictions, setUserPredictions] = useState<Record<string, number>>({});
  const [savedPrediction, setSavedPrediction] = useState<AwardsPrediction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Share Card Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeSeason = OSCARS_EDITIONS[selectedYear] || OSCARS_EDITIONS[2026];

  const currentUserId = user?.id || (isGuest ? "guest-user-123" : "guest-user-123");
  const currentUsername = profile?.username || (isGuest ? "Invitado Cinéfilo" : "Mi Usuario");

  // Read URL query params on mount if specified
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const yearParam = params.get("year");
      const tabParam = params.get("tab");
      if (yearParam && (yearParam === "2026" || yearParam === "2025" || yearParam === "2024")) {
        setSelectedYear(parseInt(yearParam, 10));
      }
      if (tabParam === "prode" || tabParam === "leaderboard" || tabParam === "tracker") {
        setActiveTab(tabParam as AwardsTab);
      }
    }
  }, []);

  // 1. Load user logs to know which movies are already watched
  useEffect(() => {
    async function loadWatchedIds() {
      setLoading(true);
      try {
        if (user) {
          const [{ data: logsData }, { data: wlData }] = await Promise.all([
            supabase.from("logs").select("tmdb_id").eq("user_id", user.id),
            supabase.from("watchlist").select("title, movie:movies(title)").eq("user_id", user.id),
          ]);

          if (logsData) {
            setWatchedTmdbIds(new Set(logsData.map((d) => d.tmdb_id)));
          }
          if (wlData) {
            setWatchlistTitles(
              wlData.map((item: any) => item.title || item.movie?.title).filter(Boolean)
            );
          }
        } else if (isGuest) {
          const guestLogs = JSON.parse(localStorage.getItem("filmtracker_guest_logs") || "[]");
          setWatchedTmdbIds(new Set(guestLogs.map((l: any) => l.tmdb_id)));
          const guestWl = JSON.parse(localStorage.getItem("filmtracker_guest_watchlist") || "[]");
          setWatchlistTitles(guestWl.map((w: any) => w.title).filter(Boolean));
        }
      } catch (err) {
        console.warn("Awards error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWatchedIds();
  }, [user, isGuest]);

  // 2. Fetch live TMDB details (posters, ratings) dynamically
  useEffect(() => {
    let isCancelled = false;

    async function fetchNomineesTMDB() {
      const nomineeIds = new Set<number>();
      activeSeason.categories.forEach((cat) => {
        cat.nominees.forEach((n) => nomineeIds.add(n.tmdb_id));
      });

      const promises = Array.from(nomineeIds).map(async (id) => {
        if (movieDetails[id]) return null;
        try {
          const details = await getMovieDetails(id);
          return { id, details };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      if (!isCancelled) {
        setMovieDetails((prev) => {
          const next = { ...prev };
          results.forEach((item) => {
            if (item) {
              next[item.id] = item.details;
            }
          });
          return next;
        });
      }
    }

    fetchNomineesTMDB();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear]);

  // 3. Load user's predictions & leaderboard for the active season
  useEffect(() => {
    let isCancelled = false;

    async function loadPredictionsAndLeaderboard() {
      setLoadingLeaderboard(true);
      try {
        const pred = await getUserAwardsPrediction(selectedYear, currentUserId);
        if (!isCancelled) {
          setSavedPrediction(pred);
          if (pred && pred.predictions) {
            setUserPredictions(pred.predictions);
            setHasUnsavedChanges(false);
          } else {
            setUserPredictions({});
            setHasUnsavedChanges(false);
          }
        }

        const lb = await getSeasonLeaderboard(
          selectedYear,
          activeSeason.categories,
          currentUserId,
          pred
        );
        if (!isCancelled) {
          setLeaderboard(lb);
        }
      } catch (err) {
        console.warn("Error loading predictions/leaderboard:", err);
      } finally {
        if (!isCancelled) {
          setLoadingLeaderboard(false);
        }
      }
    }

    loadPredictionsAndLeaderboard();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear, currentUserId]);

  // Calculate score breakdown for current predictions
  const scoreBreakdown: ScoreBreakdown = calculatePredictionScore(
    userPredictions,
    activeSeason.categories
  );

  // Category counts
  const totalCategories = activeSeason.categories.length;
  const predictedCategoriesCount = Object.keys(userPredictions).length;
  const isAllCategoriesPredicted = predictedCategoriesCount === totalCategories;

  // Track unique nominees seen for the active season
  const allNomineeIds = new Set<number>();
  activeSeason.categories.forEach((cat) => {
    cat.nominees.forEach((n) => allNomineeIds.add(n.tmdb_id));
  });
  const totalNominees = allNomineeIds.size;
  const seenNomineesCount = Array.from(allNomineeIds).filter((id) => watchedTmdbIds.has(id)).length;
  const progressPercent = totalNominees > 0 ? Math.round((seenNomineesCount / totalNominees) * 100) : 0;

  // Handle selecting a winner in a category
  const handleSelectNominee = (categoryName: string, tmdbId: number) => {
    setUserPredictions((prev) => {
      const next = { ...prev };
      if (next[categoryName] === tmdbId) {
        // Toggle off if desired, or keep selected
        delete next[categoryName];
      } else {
        next[categoryName] = tmdbId;
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Handle saving predictions
  const handleSavePredictions = async () => {
    if (Object.keys(userPredictions).length === 0) return;
    setIsSaving(true);
    try {
      const profileData = profile
        ? {
            id: profile.id,
            username: profile.username || currentUsername,
            avatar_url: profile.avatar_url || null,
          }
        : {
            id: currentUserId,
            username: currentUsername,
            avatar_url: null,
          };

      const saved = await saveUserAwardsPrediction(
        selectedYear,
        userPredictions,
        scoreBreakdown.score,
        profileData
      );

      setSavedPrediction(saved);
      setHasUnsavedChanges(false);
      setSaveSuccessMsg(true);
      triggerConfetti();

      // Refresh leaderboard with new score
      const lb = await getSeasonLeaderboard(
        selectedYear,
        activeSeason.categories,
        currentUserId,
        saved
      );
      setLeaderboard(lb);

      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } catch (err) {
      console.error("Error guardando predicciones:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy share text (for WhatsApp / social media)
  const handleCopyShareText = () => {
    const lines = [
      `🏆 Mis Predicciones para los ${activeSeason.title} (${activeSeason.edition}) en FilmTracker:`,
      "",
    ];

    activeSeason.categories.forEach((cat) => {
      const chosenId = userPredictions[cat.name];
      const nominee = cat.nominees.find((n) => n.tmdb_id === chosenId);
      if (nominee) {
        lines.push(`• ${cat.name}: ${nominee.title} 🏆`);
      }
    });

    lines.push("");
    lines.push("¿Podés superar mis aciertos? Armá tu quiniela en FilmTracker:");
    lines.push(
      typeof window !== "undefined"
        ? `${window.location.origin}/awards?year=${selectedYear}&tab=prode`
        : "https://filmtracker.app/awards"
    );

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Copy shareable link
  const handleCopyShareLink = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/awards?year=${selectedYear}&tab=prode`
        : "https://filmtracker.app/awards";

    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>
            {activeSeason.title} • {activeSeason.edition}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Oscars & Quiniela de Premios
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Monitorea tu progreso, jugá tu quiniela eligiendo a los ganadores y competí en el
          ranking comunitario con 10 puntos por acierto.
        </p>

        {/* Edition Selector Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedYear(2026)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              selectedYear === 2026
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oscars 2026 (Actual)</span>
          </button>
          <button
            onClick={() => setSelectedYear(2025)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              selectedYear === 2025
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Oscars 2025</span>
          </button>
          <button
            onClick={() => setSelectedYear(2024)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              selectedYear === 2024
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Oscars 2024</span>
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab("tracker")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === "tracker"
                  ? "bg-white/15 text-white shadow-md border border-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab("prode")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 relative ${
                activeTab === "prode"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Mi Quiniela</span>
              {predictedCategoriesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeTab === "prode"
                      ? "bg-black text-amber-300"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {predictedCategoriesCount}/{totalCategories}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === "leaderboard"
                  ? "bg-white/15 text-white shadow-md border border-white/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Medal className="w-4 h-4 text-yellow-400" />
              <span>Ranking</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRACKER & PROGRESS */}
      {/* ========================================================================= */}
      {activeTab === "tracker" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Progress Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1a1712] via-[#161420] to-[#12111c] border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tu Progreso en {activeSeason.edition}</span>
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {seenNomineesCount} de {totalNominees}{" "}
                  <span className="text-lg text-zinc-400 font-normal">películas vistas</span>
                </div>
              </div>

              <div className="text-4xl font-black text-amber-400">{progressPercent}%</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-lg shadow-amber-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-6">
            {activeSeason.categories.map((category) => (
              <div
                key={category.name}
                className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">{category.name}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {category.nominees.map((nominee) => {
                    const isSeen = watchedTmdbIds.has(nominee.tmdb_id);
                    const details = movieDetails[nominee.tmdb_id];
                    const posterUrl = getImageUrl(details?.poster_path, "w185");

                    return (
                      <div
                        key={`${category.name}-${nominee.tmdb_id}-${nominee.title}`}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSeen
                            ? "bg-[#181710] border-amber-500/40 shadow-md shadow-amber-950/20"
                            : "bg-white/5 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Movie Poster thumbnail */}
                          <Link
                            href={`/movie/${nominee.tmdb_id}`}
                            className="w-11 h-16 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10 relative group"
                          >
                            <img
                              src={posterUrl}
                              alt={nominee.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              loading="lazy"
                            />
                          </Link>

                          {/* Movie Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                href={`/movie/${nominee.tmdb_id}`}
                                className="font-bold text-sm text-white hover:text-amber-400 transition truncate max-w-[200px] block"
                              >
                                {nominee.title}
                              </Link>
                              {nominee.isWinner && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-black shrink-0">
                                  🏆 GANADORA
                                </span>
                              )}
                            </div>

                            {nominee.nominationDetails && (
                              <span className="text-xs text-zinc-400 block truncate">
                                {nominee.nominationDetails}
                              </span>
                            )}

                            {details?.vote_average ? (
                              <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span>{details.vote_average.toFixed(1)}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isSeen ? (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>VISTA</span>
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                openLogModal({
                                  id: nominee.tmdb_id,
                                  title: nominee.title,
                                  poster_path: details?.poster_path,
                                })
                              }
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Log</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* AI Awards Coach (Solo para usuarios autenticados) */}
          {user && (
            <div className="pt-2">
              <AICoach
                awardsName={`${activeSeason.title} (${activeSeason.edition})`}
                categories={activeSeason.categories}
                userWatchedIds={watchedTmdbIds}
                watchlistTitles={watchlistTitles}
                progressPercent={progressPercent}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MI QUINIELA (PRODE DE PREMIOS) */}
      {/* ========================================================================= */}
      {activeTab === "prode" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Banner Resumen Quiniela */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1f1910] via-[#171422] to-[#13111d] border border-amber-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tu Boleta de Votación</span>
                  </span>
                  {selectedYear === 2026 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Votación Abierta</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Resultados Oficiales Computados
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Predecí los Ganadores de los Oscars {selectedYear}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  Seleccioná tu candidato a ganar la estatuilla dorada en cada rubro. Sumás{" "}
                  <strong className="text-amber-400">10 puntos por cada acierto</strong> oficial en
                  la gala.
                </p>

                {/* Status breakdown pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>
                      {predictedCategoriesCount} de {totalCategories} pronosticadas
                    </span>
                  </div>

                  {scoreBreakdown.hits > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>
                        {scoreBreakdown.score} Puntos ({scoreBreakdown.hits} Aciertos)
                      </span>
                    </div>
                  )}

                  {saveSuccessMsg && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-bounce">
                      <Check className="w-4 h-4 text-emerald-400" />
                      ¡Predicciones guardadas con éxito!
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción principales */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={handleSavePredictions}
                  disabled={isSaving || predictedCategoriesCount === 0}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-xl ${
                    hasUnsavedChanges
                      ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30 scale-105 ring-2 ring-amber-300"
                      : "bg-amber-500/90 hover:bg-amber-400 text-black shadow-amber-500/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? "Guardando..."
                      : hasUnsavedChanges
                      ? "Confirmar y Guardar Cambios"
                      : "Guardar Predicciones"}
                  </span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  disabled={predictedCategoriesCount === 0}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Compartir Quiniela</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categorías con selector interactivo */}
          <div className="space-y-6">
            {activeSeason.categories.map((category) => {
              const chosenTmdbId = userPredictions[category.name];
              const officialWinner = category.nominees.find((n) => n.isWinner);

              return (
                <div
                  key={category.name}
                  className="p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {category.name}
                      </h3>
                    </div>

                    <div className="text-xs">
                      {chosenTmdbId ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>
                            Voto:{" "}
                            {category.nominees.find((n) => n.tmdb_id === chosenTmdbId)?.title ||
                              "Seleccionado"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">Sin predicción elegida aún</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {category.nominees.map((nominee) => {
                      const isSelected = chosenTmdbId === nominee.tmdb_id;
                      const details = movieDetails[nominee.tmdb_id];
                      const posterUrl = getImageUrl(details?.poster_path, "w185");
                      const isWinner = Boolean(nominee.isWinner);
                      const isHit = isSelected && isWinner;
                      const isMiss = isSelected && officialWinner && !isWinner;

                      return (
                        <div
                          key={`${category.name}-${nominee.tmdb_id}`}
                          onClick={() => handleSelectNominee(category.name, nominee.tmdb_id)}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative group ${
                            isSelected
                              ? "bg-[#1f1910] border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-950/40"
                              : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Poster */}
                            <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10 relative">
                              <img
                                src={posterUrl}
                                alt={nominee.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                loading="lazy"
                              />
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition line-clamp-1">
                                {nominee.title}
                              </h4>
                              {nominee.nominationDetails && (
                                <p className="text-xs text-zinc-400 truncate mt-0.5">
                                  {nominee.nominationDetails}
                                </p>
                              )}

                              {details?.vote_average ? (
                                <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span>{details.vote_average.toFixed(1)}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Evaluation / Official winner indicators */}
                          {isWinner && (
                            <div className="pt-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-black flex items-center gap-1 w-fit">
                                <Trophy className="w-3 h-3" />
                                <span>GANADORA OFICIAL</span>
                              </span>
                            </div>
                          )}

                          {isHit && (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>¡Acertaste! +10 puntos</span>
                            </span>
                          )}

                          {isMiss && (
                            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                              <X className="w-3.5 h-3.5" />
                              <span>No acertó</span>
                            </span>
                          )}

                          {/* Selector Button */}
                          <div className="pt-1 flex items-center justify-end">
                            {isSelected ? (
                              <button
                                type="button"
                                className="w-full py-1.5 px-3 rounded-xl text-xs font-black bg-amber-500 text-black flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                              >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>Mi Voto a Ganador 🏆</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-white/5 group-hover:bg-white/15 text-zinc-300 group-hover:text-white transition flex items-center justify-center gap-1.5 border border-white/5"
                              >
                                <Circle className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Votar como Ganador</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Persistent Save & Share Bar at bottom */}
          {hasUnsavedChanges && (
            <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-gradient-to-r from-[#1f1910] to-[#141420] border border-amber-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slideUp">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  Tenés cambios sin guardar en tu Quiniela ({predictedCategoriesCount} de{" "}
                  {totalCategories} categorías elegidas)
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSavePredictions}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Guardando..." : "Confirmar y Guardar"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEADERBOARD / RANKING */}
      {/* ========================================================================= */}
      {activeTab === "leaderboard" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Rules & Points Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171420] via-[#141424] to-[#12111c] border border-yellow-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Medal className="w-4 h-4 text-yellow-400" />
                  <span>Tabla de Posiciones • Quiniela {selectedYear}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Ranking Oficial de la Comunidad
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
                  Regla de puntuación: Cada categoría acertada otorga{" "}
                  <strong className="text-amber-400">10 puntos</strong>. En caso de empate, se
                  prioriza la mayor cantidad de aciertos y la fecha de envío.
                </p>
              </div>

              {selectedYear === 2026 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 max-w-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Gala 2026 Pendiente</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Los puntos oficiales se computarán automáticamente una vez entregadas las
                    estatuillas doradas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Podio Top 3 */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* 2º PUESTO (Plata) */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-zinc-800/40 to-black/40 border border-zinc-400/30 shadow-xl flex flex-col items-center text-center space-y-3 order-2 sm:order-1">
                <div className="relative">
                  <img
                    src={
                      leaderboard[1].avatarUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={leaderboard[1].username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-400 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-1 text-xl">🥈</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {leaderboard[1].username}
                    {leaderboard[1].isCurrentUser && " (Vos)"}
                  </h4>
                  <span className="text-xs text-zinc-400">2º Lugar</span>
                </div>
                <div className="text-2xl font-black text-zinc-200">{leaderboard[1].score} pts</div>
                <span className="text-[11px] text-zinc-400 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {leaderboard[1].hits} aciertos
                </span>
              </div>

              {/* 1º PUESTO (Oro) */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-black/40 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 flex flex-col items-center text-center space-y-3 sm:-translate-y-3 order-1 sm:order-2">
                <div className="relative">
                  <img
                    src={
                      leaderboard[0].avatarUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={leaderboard[0].username}
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/30"
                  />
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
                  <span className="absolute -bottom-2 -right-1 text-2xl">🥇</span>
                </div>
                <div>
                  <h4 className="font-black text-white text-base">
                    {leaderboard[0].username}
                    {leaderboard[0].isCurrentUser && " (Vos)"}
                  </h4>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Campeón Cinéfilo
                  </span>
                </div>
                <div className="text-3xl font-black text-amber-400">{leaderboard[0].score} pts</div>
                <span className="text-xs text-amber-300 font-bold bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  {leaderboard[0].hits} aciertos
                </span>
              </div>

              {/* 3º PUESTO (Bronce) */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-900/30 to-black/40 border border-amber-700/30 shadow-xl flex flex-col items-center text-center space-y-3 order-3">
                <div className="relative">
                  <img
                    src={
                      leaderboard[2].avatarUrl ||
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={leaderboard[2].username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-1 text-xl">🥉</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {leaderboard[2].username}
                    {leaderboard[2].isCurrentUser && " (Vos)"}
                  </h4>
                  <span className="text-xs text-zinc-400">3º Lugar</span>
                </div>
                <div className="text-2xl font-black text-amber-600">{leaderboard[2].score} pts</div>
                <span className="text-[11px] text-zinc-400 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {leaderboard[2].hits} aciertos
                </span>
              </div>
            </div>
          )}

          {/* Tabla de Posiciones Completa */}
          <div className="p-6 rounded-3xl bg-[#141420] border border-white/5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <div className="flex items-center gap-6">
                <span className="w-8 text-center">#</span>
                <span>Usuario</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="hidden sm:inline">Pronosticadas</span>
                <span>Aciertos</span>
                <span className="w-16 text-right">Puntos</span>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-3">
                <Trophy className="w-10 h-10 text-amber-500/40 mx-auto" />
                <p className="text-sm font-bold text-white">Aún no hay predicciones registradas para esta edición</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  ¡Sé el primero en enviar tu Quiniela en la pestaña "Mi Quiniela" y liderar la tabla de posiciones!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.userId}-${entry.rank}`}
                    className={`py-3.5 px-3 rounded-2xl flex items-center justify-between transition-colors ${
                      entry.isCurrentUser
                        ? "bg-amber-500/15 border border-amber-500/30 text-white font-bold"
                        : "hover:bg-white/5 text-zinc-300"
                    }`}
                  >
                  {/* Posición & Avatar & Nombre */}
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-8 text-center font-black text-sm text-zinc-400">
                      {entry.rank === 1
                        ? "🥇"
                        : entry.rank === 2
                        ? "🥈"
                        : entry.rank === 3
                        ? "🥉"
                        : `#${entry.rank}`}
                    </span>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img
                          src={
                            entry.avatarUrl ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                          }
                          alt={entry.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="text-sm font-bold text-white block truncate">
                          {entry.username}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                            Tu Quiniela
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas & Puntaje */}
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="hidden sm:inline text-xs text-zinc-400">
                      {entry.predictionsCount}/{totalCategories}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {entry.hits} {entry.hits === 1 ? "acierto" : "aciertos"}
                    </span>
                    <span className="w-16 text-right text-base font-black text-amber-400">
                      {entry.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* CTA si el usuario aún no tiene quiniela guardada */}
          {!savedPrediction && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">
                  ¿Todavía no dejaste tu pronóstico de los Oscars {selectedYear}?
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Armá tu quiniela en 2 minutos y competí contra los demás cinéfilos por el primer
                  lugar.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("prode")}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 text-black hover:bg-amber-400 transition shrink-0 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Armar Mi Quiniela</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE COMPARTIR: TARJETA VISUAL & ENLACE COMPARTIBLE */}
      {/* ========================================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#12111a] border border-amber-500/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative space-y-6 p-6 sm:p-8">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tarjeta Visual Compartible</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Mis Predicciones Oscars {selectedYear}
              </h3>
            </div>

            {/* TARJETA VISUAL ESTILO BOLETO / PASAPORTE DE GALA */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1c1810] via-[#121118] to-[#0a0a0f] border-2 border-amber-500/50 shadow-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Encabezado de la tarjeta */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black text-xs">
                    FT
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      FILMTRACKER QUINIELA
                    </span>
                    <span className="text-xs font-bold text-white">{activeSeason.edition}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 block">USUARIO</span>
                  <span className="text-xs font-black text-amber-300">{currentUsername}</span>
                </div>
              </div>

              {/* Lista de ganadores pronosticados */}
              <div className="space-y-2.5">
                {activeSeason.categories.map((cat) => {
                  const chosenId = userPredictions[cat.name];
                  const nominee = cat.nominees.find((n) => n.tmdb_id === chosenId);

                  return (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-xs py-1 border-b border-white/5"
                    >
                      <span className="text-zinc-400 font-medium">{cat.name}:</span>
                      <span className="font-bold text-amber-300 text-right">
                        {nominee ? nominee.title : "—"} 🏆
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pie de la tarjeta */}
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-zinc-400">
                <span>filmtracker.app/awards</span>
                <span className="text-amber-400 font-mono font-bold tracking-widest uppercase">
                  VOTO VERIFICADO
                </span>
              </div>
            </div>

            {/* Acciones de Copiado / Compartir */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyShareText}
                  className="py-3 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Texto (WhatsApp)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition flex items-center justify-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>Copiar Enlace Directo</span>
                    </>
                  )}
                </button>
              </div>

              {(copiedText || copiedLink) && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-400 animate-fadeIn">
                  🎉 ¡Copiado al portapapeles! Listo para pegar en tus redes o chats.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
