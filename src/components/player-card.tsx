import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { XIcon } from 'lucide-react';
import type { Player } from '@/lib/types';

type PlayerCardProps = {
  id: string;
  player: Player;
  position: string;
  isDrafted: boolean;
  isReordered: boolean;
  onDismiss: () => void;
  onDraft: () => void;
};

function formatName(name: string): { last: string; first: string } {
  const parts = name.split(' ');
  if (parts.length === 1) return { last: parts[0], first: '' };
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');
  return { last, first };
}

function warColor(war: number): string {
  if (war >= 5) return 'text-amber-300';
  if (war >= 3) return 'text-emerald-300';
  if (war >= 1.5) return 'text-sky-300';
  return 'text-zinc-300';
}

function warBg(war: number): string {
  if (war >= 5) return 'bg-amber-400/15';
  if (war >= 3) return 'bg-emerald-400/15';
  if (war >= 1.5) return 'bg-sky-400/15';
  return 'bg-zinc-400/10';
}

function accentBar(isDrafted: boolean, isReordered: boolean, selected: boolean): string {
  if (isDrafted) return 'bg-emerald-400';
  if (isReordered) return 'bg-amber-400';
  if (selected) return 'bg-zinc-400';
  return 'bg-zinc-600';
}

export function PlayerCard({
  id,
  player,
  position,
  isDrafted,
  isReordered,
  onDismiss,
  onDraft,
}: PlayerCardProps) {
  const [selected, setSelected] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isPitcher = position === 'SP' || position === 'RP';
  const statValue = isPitcher ? player.adp : player.war;
  const { last, first } = formatName(player.name);
  const showDraft = !isDrafted && (selected || isReordered);
  const displayPos = player.subPosition || position;

  return (
    <div ref={setNodeRef} style={style} className="shrink-0">
      <div
        className={`
          group relative w-48 h-24 overflow-hidden rounded-sm
          cursor-grab active:cursor-grabbing touch-none
          transition-all duration-150 flex flex-col
          ${isDrafted
            ? 'bg-emerald-950/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
            : 'bg-zinc-800/90 hover:bg-zinc-800'
          }
          ${isDragging ? 'shadow-2xl shadow-black/40 scale-[1.02]' : ''}
        `}
        onClick={() => setSelected((s) => !s)}
        {...attributes}
        {...listeners}
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar(isDrafted, isReordered, selected)} transition-colors duration-150`} />

        {/* Top row: name + stat + X */}
        <div className="pl-3.5 pr-2 pt-2 flex gap-2 items-start flex-1 min-h-0">
          {/* Name block */}
          <div className="flex-1 min-w-0">
            <div
              className="font-display text-base font-semibold uppercase leading-[1.1] tracking-wide text-white truncate"
              title={last}
            >
              {last}
            </div>
            <div className="text-xs text-zinc-300 leading-tight truncate mt-0.5">
              {first}
            </div>
          </div>

          {/* Stat block */}
          <div className={`shrink-0 flex flex-col items-center justify-center rounded-sm px-2 py-0.5 ${
            isPitcher ? 'bg-zinc-700/80' : warBg(statValue as number)
          }`}>
            <div className={`font-display text-lg font-bold leading-none tabular-nums ${
              isPitcher ? 'text-zinc-200' : warColor(statValue as number)
            }`}>
              {isPitcher
                ? Math.round(statValue as number)
                : (statValue as number).toFixed(1)
              }
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
              {isPitcher ? 'ADP' : 'WAR'}
            </div>
          </div>

          {/* Dismiss - top right corner */}
          <button
            className="shrink-0 size-5 flex items-center justify-center rounded-sm text-zinc-500 hover:text-zinc-100 hover:bg-zinc-700 transition-colors -mt-0.5 -mr-0.5"
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            aria-label={`Dismiss ${player.name}`}
          >
            <XIcon className="size-3" />
          </button>
        </div>

        {/* Bottom row: position + team + draft */}
        <div className="pl-3.5 pr-2 pb-2 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-700 px-1.5 py-px rounded-sm shrink-0">
              {displayPos}
            </span>
            <span className="text-xs text-zinc-300 truncate">
              {player.team}
            </span>
            {isDrafted && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/15 px-1.5 py-px rounded-sm shrink-0">
                Mine
              </span>
            )}
          </div>

          {showDraft && (
            <button
              className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/15 hover:bg-emerald-400/25 px-2.5 py-1 rounded-sm transition-colors"
              onClick={(e) => { e.stopPropagation(); onDraft(); }}
            >
              Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
