/**
 * CardRevealAnimation — The "magic moment" after signup
 *
 * Personalized Comfort Card slides up with spring physics,
 * glows, then settles. Shows their name, member ID, and QR code.
 */
import { useMemo } from 'react';
import { Icon } from '../../components/Icon';
import type { ComfortCardHolder } from '../../stores/signupStore';

// Simple QR-like pattern (reused from CareCard)
function QRPattern({ data, size = 120 }: { data: string; size?: number }) {
  const grid = 21;
  const cellSize = size / grid;

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const cells = useMemo(() => {
    const result: Array<{ x: number; y: number }> = [];
    const addFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
          const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
          if (isOuter || isInner) result.push({ x: ox + x, y: oy + y });
        }
      }
    };
    addFinder(0, 0);
    addFinder(14, 0);
    addFinder(0, 14);

    let seed = hash;
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
        if (inFinder) continue;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if (seed % 3 === 0) result.push({ x, y });
      }
    }
    return result;
  }, [hash]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx="6" />
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x * cellSize}
          y={c.y * cellSize}
          width={cellSize - 0.5}
          height={cellSize - 0.5}
          rx={1}
          fill="#1B3A5C"
        />
      ))}
    </svg>
  );
}

interface CardRevealAnimationProps {
  cardHolder: ComfortCardHolder;
}

export function CardRevealAnimation({ cardHolder }: CardRevealAnimationProps) {
  return (
    <div className="card-slide-up card-glow w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-sage/30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            {cardHolder.firstName}
          </h2>
          <p className="mt-0.5 text-sm text-text-secondary">{cardHolder.memberId}</p>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-sage">
          <Icon name="seedling" size={14} /> Seedling
        </span>
      </div>

      {/* QR Code */}
      <div className="my-5 flex justify-center qr-pulse">
        <QRPattern data={cardHolder.qrUrl} size={140} />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between rounded-lg bg-sage/5 px-4 py-2">
        <span className="text-sm text-text-secondary">Your QR code to caring</span>
        <span className="font-heading text-sm font-semibold text-sage-dark">co-op.care</span>
      </div>
    </div>
  );
}
