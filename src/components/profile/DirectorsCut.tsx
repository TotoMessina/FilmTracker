"use client";

import { useRef, useState } from 'react';
import { Clapperboard, Download, Loader2, Share2 } from 'lucide-react';
import { loadDirectorsCutStats } from '@/lib/services/directorsCut';
import { isDirectorsCutResult, type DirectorsCutResult } from '@/lib/groq/directorsCut';
import { drawDirectorsCutImage } from '@/lib/utils/directorsCutImage';
import { downloadCanvas, shareCanvas } from '@/lib/utils/shareCanvas';

export default function DirectorsCut({ userId, username }: { userId: string; username: string }) {
  const [result, setResult] = useState<DirectorsCutResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [sharing, setSharing] = useState(false);
  const running = useRef(false);

  async function discover() {
    if (running.current) return;
    running.current = true; setBusy(true); setError(''); setMessage('');
    try {
      const stats = await loadDirectorsCutStats(userId, setProgress);
      setProgress('Descubriendo tu ADN cinematográfico…');
      const response = await fetch('/api/ai/directors-cut', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stats), signal: AbortSignal.timeout(60000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo generar el perfil.');
      if (!isDirectorsCutResult(data)) throw new Error('El perfil recibido está incompleto. Intentá nuevamente.');
      setTotalLogs(stats.totalLogs); setResult(data);
    } catch (err) { setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'La IA tardó demasiado. Intentá nuevamente.'); }
    finally { setBusy(false); running.current = false; }
  }

  async function exportImage(share: boolean) {
    if (!result || sharing) return;
    setSharing(true); setError(''); setMessage('');
    try {
      const canvas = drawDirectorsCutImage(result, username);
      if (share) {
        const outcome = await shareCanvas(canvas, 'filmtracker-adn-cinematografico.png', 'Mi ADN cinematográfico', result.headline);
        if (outcome !== 'cancelled') setMessage(outcome === 'shared' ? 'Imagen compartida.' : 'Imagen descargada. Ya podés compartirla.');
      } else { downloadCanvas(canvas, 'filmtracker-adn-cinematografico.png'); setMessage('Imagen descargada.'); }
    } catch { setError('No se pudo exportar la imagen. Intentá nuevamente.'); }
    finally { setSharing(false); }
  }

  const colors = ['bg-violet-400', 'bg-rose-400', 'bg-amber-400'];
  return <section className="relative overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-[#271337] via-[#11101c] to-[#2c1021] p-5 sm:p-8 shadow-2xl space-y-6">
    <header className="space-y-2"><p className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-violet-300"><Clapperboard size={18} /> Director’s Cut AI</p><h2 className="text-2xl sm:text-3xl font-black text-white">¿Qué cineasta sos?</h2><p className="text-sm text-zinc-400 max-w-2xl">Tus directores, puntajes, géneros y épocas cuentan una historia. Descubrí con quién compartís afinidad cinematográfica.</p></header>
    <button type="button" disabled={busy} onClick={discover} className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-violet-600 to-rose-600 px-5 py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60">{busy ? 'Analizando tu historial…' : result ? '🎬 Actualizar mi ADN Cinematográfico' : '🎬 Descubrir mi ADN Cinematográfico'}</button>
    {busy && <div role="status" className="space-y-4"><p className="flex gap-2 items-center text-sm text-violet-200"><Loader2 size={18} className="animate-spin" />{progress}</p><div aria-hidden="true" className="grid sm:grid-cols-3 gap-3 animate-pulse motion-reduce:animate-none">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}</div></div>}
    {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    {result && !busy && <div className="space-y-6">
      <p className="text-2xl sm:text-4xl leading-tight font-black text-white">{result.headline}</p>
      <div className="grid sm:grid-cols-3 gap-3">{[result.primaryDirector, result.secondaryDirector, result.thirdDirector].map((director, index) => <div key={director.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3"><h3 className="font-bold text-white">{director.name}</h3><span className="font-black text-xl text-white">{director.percentage}%</span></div>
        <div role="progressbar" aria-label={`Afinidad con ${director.name}`} aria-valuenow={director.percentage} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${colors[index]}`} style={{ width: `${director.percentage}%` }} /></div>
        <p className="text-xs text-zinc-300 leading-relaxed">{director.reason}</p>
      </div>)}</div>
      <details className="rounded-2xl border border-white/10 bg-black/10 p-4"><summary className="cursor-pointer font-semibold text-violet-200">Por qué</summary><p className="mt-3 text-sm leading-7 text-zinc-200">{result.deepDive}</p></details>
      <p className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200"><strong>Tu zona evitada:</strong> {result.blindSpot}</p>
      <p className="text-xs text-zinc-400">Basado en {totalLogs} registros. Afinidades estimadas por IA para explorar tu gusto; los porcentajes no son una medición científica.</p>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={sharing} onClick={() => void exportImage(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-50"><Share2 size={16} /> Compartir como imagen</button><button type="button" disabled={sharing} onClick={() => void exportImage(false)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-300 disabled:opacity-50"><Download size={16} /> Descargar PNG</button></div>
    </div>}
    {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
  </section>;
}
