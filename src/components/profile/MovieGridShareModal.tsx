"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  Share2, 
  X, 
  Sparkles, 
  Film, 
  Smartphone, 
  Square, 
  Check, 
  Layers, 
  Eye,
  RefreshCw,
  Star
} from "lucide-react";
import { getImageUrl } from "@/lib/tmdb/client";

export interface MovieGridItem {
  title: string;
  poster_path?: string | null;
  rating?: number;
}

interface MovieGridShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  username?: string;
  movies: MovieGridItem[];
}

type AspectRatioMode = "story" | "square";
type GridCountMode = 4 | 9;

export function MovieGridShareModal({
  isOpen,
  onClose,
  title = "Mis Películas Favoritas",
  subtitle,
  username = "Cinéfilo",
  movies = [],
}: MovieGridShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("story");
  const [gridCount, setGridCount] = useState<GridCountMode>(
    movies.length <= 4 ? 4 : 9
  );
  const [customTitle, setCustomTitle] = useState(title);
  const [customSubtitle, setCustomSubtitle] = useState(
    subtitle || `@${username} • FilmTracker 2026`
  );
  const [showRatings, setShowRatings] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    setCustomTitle(title);
  }, [title]);

  useEffect(() => {
    if (subtitle) {
      setCustomSubtitle(subtitle);
    } else {
      setCustomSubtitle(`@${username} • FilmTracker 2026`);
    }
  }, [subtitle, username]);

  // Selected movies slice
  const selectedMovies = movies.slice(0, gridCount);

  // Redraw canvas whenever settings change
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function drawCanvas() {
      setRendering(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = 1080;
      const height = aspectRatio === "story" ? 1920 : 1080;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#0e0918");
      bgGrad.addColorStop(0.5, "#08060f");
      bgGrad.addColorStop(1, "#05040a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial red/purple glows
      const radialGlow1 = ctx.createRadialGradient(width / 2, 180, 20, width / 2, 180, 500);
      radialGlow1.addColorStop(0, "rgba(229, 9, 20, 0.18)");
      radialGlow1.addColorStop(1, "rgba(229, 9, 20, 0)");
      ctx.fillStyle = radialGlow1;
      ctx.fillRect(0, 0, width, 600);

      const radialGlow2 = ctx.createRadialGradient(width / 2, height - 200, 20, width / 2, height - 200, 600);
      radialGlow2.addColorStop(0, "rgba(147, 51, 234, 0.15)");
      radialGlow2.addColorStop(1, "rgba(147, 51, 234, 0)");
      ctx.fillStyle = radialGlow2;
      ctx.fillRect(0, height - 600, width, 600);

      // Decorative outer border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // 2. Draw Header Logo & Badges
      const headerTop = aspectRatio === "story" ? 110 : 70;

      // Brand Pill Badge
      ctx.save();
      const badgeText = "FILMTRACKER";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const badgeWidth = ctx.measureText(badgeText).width + 60;
      const badgeHeight = 44;
      const badgeX = (width - badgeWidth) / 2;
      const badgeY = headerTop;

      // Badge background
      ctx.fillStyle = "rgba(229, 9, 20, 0.15)";
      ctx.strokeStyle = "rgba(229, 9, 20, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
      ctx.fill();
      ctx.stroke();

      // Badge dot + text
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.arc(badgeX + 22, badgeY + badgeHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.letterSpacing = "3px";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badgeText, width / 2 + 8, badgeY + badgeHeight / 2);
      ctx.restore();

      // Title
      const titleY = headerTop + (aspectRatio === "story" ? 110 : 80);
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 16;
      ctx.fillText(customTitle.toUpperCase(), width / 2, titleY);
      ctx.restore();

      // Subtitle
      const subtitleY = titleY + 44;
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(customSubtitle, width / 2, subtitleY);
      ctx.restore();

      // 3. Compute Grid Placement
      const is3x3 = gridCount === 9;
      const cols = is3x3 ? 3 : 2;
      const rows = is3x3 ? 3 : 2;

      let gridMarginX = 60;
      let gridTop = aspectRatio === "story" ? 360 : 250;
      let gridBottom = aspectRatio === "story" ? height - 140 : height - 100;
      let availableGridHeight = gridBottom - gridTop;
      let availableGridWidth = width - gridMarginX * 2;

      const gapX = is3x3 ? 24 : 32;
      const gapY = is3x3 ? 24 : 32;

      const posterWidth = (availableGridWidth - (cols - 1) * gapX) / cols;
      const posterHeight = (availableGridHeight - (rows - 1) * gapY) / rows;

      // 4. Load & Draw Posters
      const moviePromises = selectedMovies.map((movie, index) => {
        return new Promise<void>((resolve) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = gridMarginX + col * (posterWidth + gapX);
          const y = gridTop + row * (posterHeight + gapY);

          if (!movie.poster_path) {
            // Draw placeholder poster box
            drawPosterPlaceholder(ctx, x, y, posterWidth, posterHeight, movie);
            resolve();
            return;
          }

          const img = new Image();
          img.crossOrigin = "anonymous";
          // Use our proxy to guarantee zero CORS tainting
          const rawUrl = getImageUrl(movie.poster_path, "w500");
          img.src = `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;

          img.onload = () => {
            if (isCancelled) return resolve();
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, posterWidth, posterHeight, 18);
            ctx.clip();

            // Cover crop
            drawImageProp(ctx, img, x, y, posterWidth, posterHeight, 0.5, 0.5);

            // Subtle border inside
            ctx.restore();
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, posterWidth, posterHeight, 18);
            ctx.stroke();

            // Rating Pill badge
            if (showRatings && typeof movie.rating === "number" && movie.rating > 0) {
              drawRatingBadge(ctx, x + posterWidth - 68, y + 14, movie.rating);
            }

            ctx.restore();
            resolve();
          };

          img.onerror = () => {
            if (isCancelled) return resolve();
            drawPosterPlaceholder(ctx, x, y, posterWidth, posterHeight, movie);
            resolve();
          };
        });
      });

      await Promise.all(moviePromises);

      if (isCancelled) return;

      // 5. Draw Footer Brand Mark
      const footerY = height - 55;
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#71717a";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("FILMTRACKER.APP • TU DIARIO CINÉFILO", width / 2, footerY);
      ctx.restore();

      // Export preview URL
      try {
        const dataUrl = canvas.toDataURL("image/png");
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.warn("Error exportando canvas dataURL:", err);
      } finally {
        setRendering(false);
      }
    }

    drawCanvas();

    return () => {
      isCancelled = true;
    };
  }, [
    isOpen,
    aspectRatio,
    gridCount,
    customTitle,
    customSubtitle,
    showRatings,
    movies,
    username,
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const cleanName = (customTitle || "filmtracker-collage")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      const link = document.createElement("a");
      link.download = `${cleanName}-${aspectRatio}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e) {
      console.error("Error al descargar collage:", e);
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `filmtracker-${aspectRatio}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: customTitle,
            text: `¡Mirá mis películas favoritas en FilmTracker! ${customSubtitle}`,
            files: [file],
          });
        } else {
          // Fallback to direct download
          handleDownload();
        }
      });
    } catch (err) {
      console.warn("Share fallback:", err);
      handleDownload();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0f0c18] border border-red-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Canvas (renders full 1080 resolution) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-gradient-to-r from-red-950/40 via-purple-950/20 to-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Collage Cinéfilo para Redes</span>
                <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-bold">
                  HD 1080p
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generá una imagen lista para Instagram Stories o Twitter con tus mejores películas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Split View (Preview on left, Controls on right) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Preview Canvas Container */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0a0812] border border-white/5 min-h-[360px]">
            {rendering && !previewUrl ? (
              <div className="flex flex-col items-center gap-3 text-zinc-400 py-16">
                <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                <span className="text-xs font-semibold">Renderizando collage en alta definición...</span>
              </div>
            ) : previewUrl ? (
              <div className="relative group max-h-[52vh] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Previsualización Collage"
                  className="max-h-[52vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300"
                />
                {rendering && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xs text-white gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                    <span>Actualizando...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-16">No hay datos para renderizar</div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="md:col-span-6 space-y-4">
            {/* Format Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Formato para Redes:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio("story")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    aspectRatio === "story"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-lg shadow-red-600/30"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Historia 9:16 (Story)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio("square")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    aspectRatio === "square"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-lg shadow-red-600/30"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span>Cuadrado 1:1 (Feed/X)</span>
                </button>
              </div>
            </div>

            {/* Grid Size Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Cantidad de Películas:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGridCount(9)}
                  disabled={movies.length < 5}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    gridCount === 9
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white disabled:opacity-40"
                  }`}
                >
                  <span>Top 9 (Cuadrícula 3x3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridCount(4)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    gridCount === 4
                      ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>Top 4 (Cuadrícula 2x2)</span>
                </button>
              </div>
            </div>

            {/* Custom Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Título del Collage:
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                maxLength={32}
                placeholder="Ej: Mis 9 Películas del Año"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Custom Subtitle Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Subtítulo / Firma:
              </label>
              <input
                type="text"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                maxLength={45}
                placeholder="Ej: @tu_usuario • 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Show ratings checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRatings}
                  onChange={(e) => setShowRatings(e.target.checked)}
                  className="rounded bg-black/50 border-white/20 text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Mostrar calificaciones en los pósters</span>
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={rendering || !previewUrl}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Descargado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar Imagen PNG</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                disabled={rendering || !previewUrl}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Compartir directamente"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: draws placeholder when poster path is missing
function drawPosterPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  movie: MovieGridItem
) {
  ctx.save();
  ctx.fillStyle = "#1e1b29";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "bold 20px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(movie.title.slice(0, 20), x + w / 2, y + h / 2);
  ctx.restore();
}

// Helper: draws rating badge (e.g. ★ 10 or ★ 8.5)
function drawRatingBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rating: number
) {
  ctx.save();
  const badgeW = 54;
  const badgeH = 28;

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, badgeW, badgeH, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`★ ${rating}`, x + badgeW / 2, y + badgeH / 2);
  ctx.restore();
}

// Helper: Draw image with cover crop
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetX = 0.5,
  offsetY = 0.5
) {
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  if (!nw || !nh) return;

  const r = Math.min(w / nw, h / nh);
  let nwScaled = nw * r;
  let nhScaled = nh * r;

  let cx = 1;
  let cy = 1;

  if (Math.round(nwScaled) < w) cx = w / nwScaled;
  if (Math.round(nhScaled) < h) cy = h / nhScaled;

  const finalRatio = Math.max(cx, cy);
  nwScaled *= finalRatio;
  nhScaled *= finalRatio;

  let sx = (nw - w / (nwScaled / nw)) * offsetX;
  let sy = (nh - h / (nhScaled / nh)) * offsetY;

  if (sx < 0) sx = 0;
  if (sy < 0) sy = 0;

  let sWidth = w / (nwScaled / nw);
  let sHeight = h / (nhScaled / nh);

  if (sWidth > nw) sWidth = nw;
  if (sHeight > nh) sHeight = nh;

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}
