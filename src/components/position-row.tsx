import { PlayerCard } from '@/components/player-card';
import type { Player } from '@/lib/types';
import { playerKey } from '@/lib/types';

type PositionRowProps = {
  position: string;
  players: Player[];
  isDismissed: (key: string) => boolean;
  isDrafted: (key: string) => boolean;
  onDismiss: (key: string) => void;
  onDraft: (key: string) => void;
};

export function PositionRow({
  position,
  players,
  isDismissed,
  isDrafted,
  onDismiss,
  onDraft,
}: PositionRowProps) {
  const visible = players.filter((p) => !isDismissed(playerKey(position, p.name)));

  return (
    <div className="flex gap-3 items-start">
      <div className="w-12 shrink-0 py-3 text-center font-bold text-sm bg-secondary rounded-lg sticky left-0 z-10">
        {position}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {visible.slice(0, 30).map((player) => {
          const key = playerKey(position, player.name);
          return (
            <PlayerCard
              key={key}
              player={player}
              position={position}
              isDrafted={isDrafted(key)}
              onDismiss={() => onDismiss(key)}
              onDraft={() => onDraft(key)}
            />
          );
        })}
        {visible.length === 0 && (
          <div className="text-xs text-muted-foreground py-3 px-4">
            All players dismissed
          </div>
        )}
      </div>
    </div>
  );
}
