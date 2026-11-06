// Late Circle — Share card generator
// Square 1080x1080 PNG, WhatsApp-safe crop zone

import { PhaseId } from './cycleEngine';

const CAPTIONS: Record<PhaseId, string> = {
  rest: "Heavy and tender. Warm water, soft bed, no guilt. 💜",
  fresh: "Energy is coming back. One slow walk today. 🌱",
  fine: "Fine girl era. Glowing, and she knows it. ✨",
  chop: "Craving everything. Na hormone, not me. 🍚",
  ready: "Body is preparing. Slow down, be kind. 💜",
};

const EMOJI_MAP: Record<PhaseId, string> = {
  rest: '🌙',
  fresh: '🌱',
  fine: '✨',
  chop: '🍚',
  ready: '💜',
};

const GIRL_NAMES: Record<PhaseId, string> = {
  rest: 'Rest Girl',
  fresh: 'Fresh Girl',
  fine: 'Fine Girl',
  chop: 'Chop Girl',
  ready: 'Ready Girl',
};

const BG = '#FFF0F3';
const COCOA = '#4A2C35';
const SAGE = '#9CAF88';

export async function generateShareCard(girl: PhaseId, cycleDay: number): Promise<Blob> {
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Wait for any @font-face declared fonts to be ready.
  // (We use system sans-serif below, so this is just a safety net.)
  try {
    await document.fonts.ready;
  } catch {}

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = SAGE;
  ctx.fillRect(0, 0, size, 90);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LATE CIRCLE', size / 2, 58);

  const circleY = 340;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(size / 2, circleY, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '110px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(EMOJI_MAP[girl], size / 2, circleY + 5);

  ctx.fillStyle = COCOA;
  ctx.font = 'bold 60px sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillText(GIRL_NAMES[girl], size / 2, 540);

  ctx.font = '40px sans-serif';
  ctx.fillStyle = COCOA + 'CC';
  const caption = CAPTIONS[girl];
  const words = caption.split(' ');
  const lines: string[] = [];
  let line = '';
  const maxWidth = 800;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => {
    ctx.fillText(l, size / 2, 650 + i * 55);
  });

  ctx.font = '28px sans-serif';
  ctx.fillStyle = COCOA + '66';
  ctx.fillText(`cycle day ${cycleDay}`, size / 2, 830);

  ctx.font = '28px sans-serif';
  ctx.fillStyle = COCOA + '99';
  ctx.fillText('late-circle.vercel.app', size / 2, 980);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = COCOA + '66';
  ctx.fillText('for Nigerian girls with irregular cycles', size / 2, 1020);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('toBlob returned null'));
    }, 'image/png');
  });
}

export function getCaption(girl: PhaseId): string {
  if (!EMOJI_MAP[girl] || !GIRL_NAMES[girl] || !CAPTIONS[girl]) {
    return 'Late Circle — for Nigerian girls with irregular cycles. late-circle.vercel.app';
  }
  return `Today I'm ${EMOJI_MAP[girl]} ${GIRL_NAMES[girl]}. ${CAPTIONS[girl]}\n\nLate Circle — for Nigerian girls with irregular cycles. late-circle.vercel.app`;
}

// Converts a Blob to a data URL.
// Used by the share fallback to render an inline <img> for long-press saving
// (iOS WhatsApp in-app browser blocks <a download>).
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}