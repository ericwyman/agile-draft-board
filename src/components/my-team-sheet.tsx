'use client';

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon, UsersIcon } from 'lucide-react';
import type { Player, PositionKey } from '@/lib/types';
import { POSITION_ORDER, playerKey } from '@/lib/types';

type MyTeamSheetProps = {
  positions: Record<string, Player[]>;
  drafted: Set<string>;
  onUndraft: (key: string) => void;
};

export function MyTeamSheet({ positions, drafted, onUndraft }: MyTeamSheetProps) {
  const draftedByPosition: Record<string, { player: Player; key: string }[]> = {};

  for (const pos of POSITION_ORDER) {
    const players = positions[pos] || [];
    const draftedPlayers = players
      .filter((p) => drafted.has(playerKey(pos, p.name)))
      .map((p) => ({ player: p, key: playerKey(pos, p.name) }));
    if (draftedPlayers.length > 0) {
      draftedByPosition[pos] = draftedPlayers;
    }
  }

  const totalDrafted = drafted.size;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <UsersIcon className="size-4" />
            My Team
            {totalDrafted > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {totalDrafted}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Team</SheetTitle>
          <SheetDescription>
            {totalDrafted === 0
              ? 'No players drafted yet. Click "Draft" on a card to add players.'
              : `${totalDrafted} player${totalDrafted !== 1 ? 's' : ''} drafted`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {POSITION_ORDER.map((pos) => {
            const players = draftedByPosition[pos];
            if (!players) return null;

            return (
              <div key={pos}>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {pos}
                </div>
                <div className="flex flex-col gap-1.5">
                  {players.map(({ player, key }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {player.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {player.team}
                        </span>
                        {player.subPosition && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 shrink-0">
                            {player.subPosition}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onUndraft(key)}
                        aria-label={`Remove ${player.name}`}
                      >
                        <XIcon className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
