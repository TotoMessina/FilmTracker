import Link from 'next/link';
import type { calculateStats } from '@/lib/stats';

type Stats = ReturnType<typeof calculateStats>;
const panel = 'p-5 sm:p-6 rounded-3xl bg-[#141420] border border-white/5 space-y-4 shadow-xl';

function Bars({ title, subtitle, values, color = 'bg-red-500' }: { title: string; subtitle: string; values: { name: string; count: number }[]; color?: string }) {
  const max = Math.max(1, ...values.map(v => v.count));
  return <section className={panel}>
    <div><h3 className="font-bold text-white">{title}</h3><p className="text-xs text-zinc-400 mt-1">{subtitle}</p></div>
    {!values.some(v => v.count) ? <p className="text-sm text-zinc-500 py-6">Todavía no hay datos para este período.</p> : <ul className="space-y-3">{values.map(value => <li key={value.name}>
      <div className="flex justify-between gap-3 text-xs mb-1"><span className="text-zinc-200 break-words">{value.name}</span><span className="text-zinc-400 tabular-nums shrink-0">{value.count}</span></div>
      <div aria-hidden="true" className="h-2 rounded-full bg-zinc-800 overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${value.count / max * 100}%` }} /></div>
    </li>)}</ul>}
  </section>;
}

export default function ExpandedStats({ stats, total, year }: { stats: Stats; total: number; year: string }) {
  const coverage = total ? Math.round(stats.ratings.length / total * 100) : 0;
  const cards = [
    { label: 'Películas diferentes', value: stats.uniqueMovies, detail: 'Sin repetir títulos del historial' },
    { label: 'Días con cine', value: stats.activeDays, detail: 'Días distintos con fecha registrada' },
    { label: 'Racha más larga', value: `${stats.longestStreak} días`, detail: 'Días consecutivos viendo cine' },
    { label: 'Reseñas escritas', value: stats.reviews, detail: `De ${total} registros del período` },
    { label: 'Puntaje mediano', value: stats.median === null ? '—' : stats.median.toFixed(1), detail: 'Valor central de tus puntajes · sobre 10' },
    { label: 'Historial calificado', value: `${coverage}%`, detail: `${total - stats.ratings.length} registros sin puntaje` },
  ];
  return <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{cards.map(card => <div key={card.label} className="p-5 rounded-2xl bg-[#141420] border border-white/5">
      <h3 className="text-xs text-zinc-400 font-semibold">{card.label}</h3><p className="text-2xl font-black text-white mt-2">{card.value}</p><p className="text-xs text-zinc-500 mt-1">{card.detail}</p>
    </div>)}</div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Bars title="Actividad mensual" subtitle={year === 'all' ? 'Últimos 12 meses · cantidad de visionados' : `Enero a diciembre de ${year} · cantidad de visionados`} values={stats.months} />
      <Bars title="Tus días de cine" subtitle="Visionados por día de la semana, según la fecha registrada" values={stats.weekdays} color="bg-violet-500" />
      <Bars title="Distribución de puntajes" subtitle={`${stats.ratings.length} valoraciones · los puntajes cero también cuentan`} values={stats.histogram} color="bg-amber-500" />
      <section className={panel}>
        <div><h3 className="font-bold text-white">Tus películas mejor valoradas</h3><p className="text-xs text-zinc-400 mt-1">Top 5 · promedio de tus puntajes si hay varios visionados</p></div>
        {!stats.topMovies.length ? <p className="text-sm text-zinc-500 py-6">Agregá puntajes para descubrir tus favoritas.</p> : <ol className="space-y-3">{stats.topMovies.map((movie, index) => <li key={movie.id}><Link href={`/movie/${movie.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10">
          <span className="text-zinc-500 text-xs">{index + 1}</span><span className="text-sm text-zinc-200 flex-1 min-w-0 break-words">{movie.title}</span><span className="text-amber-400 font-bold shrink-0">{movie.rating.toFixed(1)}</span>
        </Link></li>)}</ol>}
      </section>
      <Bars title="Décadas de estreno" subtitle="Visionados por década de estreno de la película" values={stats.decades} color="bg-cyan-500" />
      <Bars title="Países de producción" subtitle="Top 6 · una coproducción cuenta en cada país" values={stats.countries.slice(0, 6)} color="bg-emerald-500" />
      <Bars title="Directores más vistos" subtitle="Top 6 · incluye los visionados repetidos" values={stats.directors.slice(0, 6)} />
      <Bars title="Actores más vistos" subtitle="Top 6 · según el reparto disponible en tu historial" values={stats.actors.slice(0, 6)} color="bg-violet-500" />
    </div>
    <p className="text-xs text-zinc-500">Las métricas de actividad usan la fecha de visionado, no la fecha de carga. Los rankings usan los datos disponibles de cada película; no se completan datos faltantes con estimaciones.</p>
  </div>;
}
