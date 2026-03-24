import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlayerCard } from '@/components/player-card';
import type { Player } from '@/lib/types';
import { playerKey } from '@/lib/types';

type PositionRowProps = {
  position: string;
  players: Player[];
  orderedKeys: string[];
  isDismissed: (key: string) => boolean;
  isDrafted: (key: string) => boolean;
  onDismiss: (key: string) => void;
  onDraft: (key: string) => void;
};

export function PositionRow({
  position,
  players,
  orderedKeys,
  isDismissed,
  isDrafted,
  onDismiss,
  onDraft,
}: PositionRowProps) {
  // Build a lookup map for quick access
  const playerMap = new Map(players.map((p) => [playerKey(position, p.name), p]));

  // Use ordered keys, filter dismissed, limit to 30
  const visibleKeys = orderedKeys
    .filter((key) => !isDismissed(key) && playerMap.has(key))
    .slice(0, 30);

  return (
    <div className="flex gap-3 items-start">
      <div className="w-12 shrink-0 py-3 text-center font-bold text-sm bg-secondary rounded-lg sticky left-0 z-10">
        {position}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <SortableContext items={visibleKeys} strategy={horizontalListSortingStrategy}>
          {visibleKeys.map((key) => {
            const player = playerMap.get(key)!;
            return (
              <PlayerCard
                key={key}
                id={key}
                player={player}
                position={position}
                isDrafted={isDrafted(key)}
                onDismiss={() => onDismiss(key)}
                onDraft={() => onDraft(key)}
              />
            );
          })}
        </SortableContext>
        {visibleKeys.length === 0 && (
          <div className="text-xs text-muted-foreground py-3 px-4">
            All players dismissed
          </div>
        )}
      </div>
    </div>
  );
}
