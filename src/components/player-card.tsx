import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import type { Player } from '@/lib/types';

type PlayerCardProps = {
  player: Player;
  position: string;
  isDrafted: boolean;
  onDismiss: () => void;
  onDraft: () => void;
};

export function PlayerCard({
  player,
  position,
  isDrafted,
  onDismiss,
  onDraft,
}: PlayerCardProps) {
  const isPitcher = position === 'SP' || position === 'RP';
  const statLabel = isPitcher ? 'ADP' : 'WAR';
  const statValue = isPitcher ? player.adp : player.war;

  return (
    <Card
      size="sm"
      className={`w-40 shrink-0 transition-colors ${
        isDrafted
          ? 'ring-2 ring-emerald-500/60 bg-emerald-950/30'
          : ''
      }`}
    >
      <CardHeader className="gap-0.5 pb-0">
        <CardTitle className="truncate text-xs leading-tight">
          {player.name}
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onDismiss}
            aria-label={`Dismiss ${player.name}`}
          >
            <XIcon className="size-3" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5 pt-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{player.team}</span>
          {player.subPosition && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1">
              {player.subPosition}
            </Badge>
          )}
          {isDrafted && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 border-emerald-500/50 text-emerald-400">
              MINE
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {statLabel} <span className="text-foreground font-medium">{statValue}</span>
          </span>
          {!isDrafted && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onDraft}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 h-5 px-1.5"
            >
              Draft
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
