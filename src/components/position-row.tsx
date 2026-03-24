'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlayerCard } from '@/components/player-card';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';
import type { Player } from '@/lib/types';
import { playerKey } from '@/lib/types';

const CARD_WIDTH = 200; // w-48 (192px) + gap (8px)
const LABEL_WIDTH = 60; // w-12 (48px) + gap (12px)
const PADDING = 48; // page padding

type PositionRowProps = {
  position: string;
  players: Player[];
  orderedKeys: string[];
  rowCount: number;
  isDismissed: (key: string) => boolean;
  isDrafted: (key: string) => boolean;
  isReordered: (key: string) => boolean;
  onDismiss: (key: string) => void;
  onDraft: (key: string) => void;
};

export function PositionRow({
  position,
  players,
  orderedKeys,
  rowCount,
  isDismissed,
  isDrafted,
  isReordered,
  onDismiss,
  onDraft,
}: PositionRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardsPerPage, setCardsPerPage] = useState(6);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const width = containerRef.current?.offsetWidth ?? window.innerWidth;
    const available = width - LABEL_WIDTH - PADDING;
    // Reserve 1 slot for the "load more" trigger
    const perRow = Math.max(1, Math.floor(available / CARD_WIDTH) - 1);
    setCardsPerPage(perRow * rowCount);
  }, [rowCount]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const playerMap = new Map(players.map((p) => [playerKey(position, p.name), p]));

  const allVisibleKeys = orderedKeys.filter(
    (key) => !isDismissed(key) && playerMap.has(key)
  );

  const LOAD_MORE_BATCH = 10;
  const totalVisible = allVisibleKeys.length;
  const loadedCount = cardsPerPage + page * LOAD_MORE_BATCH;
  const displayKeys = allVisibleKeys.slice(0, loadedCount);
  const hasMore = loadedCount < totalVisible;
  const remaining = Math.min(LOAD_MORE_BATCH, totalVisible - loadedCount);

  return (
    <div ref={containerRef} className="flex gap-3 items-start">
      <div className="w-12 shrink-0 py-3 text-center font-display font-bold text-sm uppercase tracking-wider text-zinc-200 bg-zinc-800/80 rounded-sm border-l-2 border-zinc-500">
        {position}
      </div>
      <div
        className={`flex-1 min-w-0 ${
          rowCount === 2
            ? 'flex flex-wrap gap-2'
            : 'flex gap-2'
        }`}
      >
        <SortableContext items={displayKeys} strategy={horizontalListSortingStrategy}>
          {displayKeys.map((key) => {
            const player = playerMap.get(key)!;
            return (
              <PlayerCard
                key={key}
                id={key}
                player={player}
                position={position}
                isDrafted={isDrafted(key)}
                isReordered={isReordered(key)}
                onDismiss={() => onDismiss(key)}
                onDraft={() => onDraft(key)}
              />
            );
          })}
        </SortableContext>

        {hasMore && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="shrink-0 w-48 h-24 rounded-sm border border-dashed border-zinc-600 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:border-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer bg-zinc-800/40"
          >
            <ChevronRightIcon className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              +{remaining}
            </span>
          </button>
        )}

        {totalVisible === 0 && (
          <div className="text-xs text-muted-foreground py-3 px-4">
            All players dismissed
          </div>
        )}
      </div>
    </div>
  );
}
