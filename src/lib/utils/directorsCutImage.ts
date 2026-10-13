import type { DirectorsCutResult } from '../groq/directorsCut';

export function drawDirectorsCutImage(data: DirectorsCutResult, username: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no permite crear la imagen.');
  const blocks: { lines: string[]; y: number; size: number; color: string; weight: number }[] = [];
  let y = 90;
  const add = (text: string, size: number, color: string, weight = 400) => {
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
      if (ctx.measureText(`${line} ${word}`.trim()).width > 900 && line) { lines.push(line); line = ''; }
      // Split exceptionally long names/words too, so export never clips text.
      for (const char of `${line ? ' ' : ''}${word}`) {
        if (ctx.measureText(line + char).width > 900) { lines.push(line); line = ''; }
        line += char;
      }
    }
    if (line) lines.push(line);
    blocks.push({ lines, y, size, color, weight });
    y += lines.length * size * 1.4 + 28;
  };
  add('FILMTRACKER · DIRECTOR’S CUT AI', 24, '#c4b5fd', 700);
  add(`El ADN cinematográfico de @${username}`, 30, '#a1a1aa');
  add(data.headline, 48, '#ffffff', 800);
  const bars: { y: number; percentage: number; color: string }[] = [];
  [data.primaryDirector, data.secondaryDirector, data.thirdDirector].forEach((director, index) => {
    const color = ['#a78bfa', '#fb7185', '#fbbf24'][index];
    add(`${director.name} · ${director.percentage}%`, 34, color, 700);
    bars.push({ y, percentage: director.percentage, color }); y += 40;
    add(director.reason, 25, '#d4d4d8');
  });
  add('POR QUÉ', 26, '#c4b5fd', 700);
  add(data.deepDive, 27, '#e4e4e7');
  add(`Tu zona evitada: ${data.blindSpot}`, 28, '#fcd34d', 600);
  add('Afinidad creativa estimada por IA · filmtracker', 22, '#a1a1aa');
  canvas.height = Math.ceil(y + 60);
  const gradient = ctx.createLinearGradient(0, 0, 1080, canvas.height);
  gradient.addColorStop(0, '#241039'); gradient.addColorStop(0.5, '#11101c'); gradient.addColorStop(1, '#300f20');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, canvas.height);
  ctx.strokeStyle = '#ffffff20'; ctx.strokeRect(35, 35, 1010, canvas.height - 70);
  ctx.textBaseline = 'top';
  for (const block of blocks) {
    ctx.font = `${block.weight} ${block.size}px Arial, sans-serif`; ctx.fillStyle = block.color;
    block.lines.forEach((line, index) => ctx.fillText(line, 90, block.y + index * block.size * 1.4));
  }
  for (const bar of bars) {
    ctx.fillStyle = '#ffffff15'; ctx.fillRect(90, bar.y, 900, 12);
    ctx.fillStyle = bar.color; ctx.fillRect(90, bar.y, 900 * bar.percentage / 100, 12);
  }
  return canvas;
}
