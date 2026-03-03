/**
 * QuoteLoader
 *
 * Full-screen animated loader shown after the user clicks "Generate Quote"
 * in the New Quote wizard. Displayed while Properties.tsx is loading results.
 *
 * Usage: rendered inside NewQuoteModal as a portal over everything,
 * dismissed once Properties signals it has results (via the preload context
 * or directly by navigating away).
 */

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Applying Villa Net Rank™ and availability filters.',
  'Scanning verified inventory across destinations.',
  'Ranking properties by your criteria.',
  'Almost there…',
];

interface QuoteLoaderProps {
  /** Called when the loader decides to dismiss itself (after minDuration) */
  onDone?: () => void;
  /** Minimum display time in ms before onDone fires. Default 2800ms. */
  minDuration?: number;
}

export function QuoteLoader({ onDone, minDuration = 2800 }: QuoteLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss after minDuration
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, minDuration);
    return () => clearTimeout(t);
  }, [onDone, minDuration]);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
      {/* Spinner */}
      <div className="relative w-14 h-14 mb-8">
        <div
          className="absolute inset-0 rounded-full border-[3px] border-neutral-200"
          style={{ borderTopColor: 'transparent' }}
        />
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-neutral-500 animate-spin"
        />
      </div>

      {/* Title */}
      <h2 className="text-[22px] font-semibold text-neutral-900 mb-3 tracking-tight">
        Allocating inventory…
      </h2>

      {/* Cycling subtitle */}
      <p
        key={msgIndex}
        className="text-sm text-neutral-400 text-center max-w-xs animate-fade-in"
        style={{ animation: 'quoteLoaderFade 0.4s ease' }}
      >
        {MESSAGES[msgIndex]}
      </p>

      <style>{`
        @keyframes quoteLoaderFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}