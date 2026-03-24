import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon, GripVerticalIcon } from 'lucide-react';
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

export function PlayerCard({
  id,
  player,
  position,
  isDrafted,
  isReordered,
  onDismiss,
  onDraft,
}: PlayerCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isPitcher = position === 'SP' || position === 'RP';
  const statLabel = isPitcher ? 'ADP' : 'WAR';
  const statValue = isPitcher ? player.adp : player.war;

  return (
    <div ref={setNodeRef} style={style} className="shrink-0">
      <Card
        size="sm"
        className={`w-40 transition-colors ${
          isDrafted
            ? 'ring-2 ring-emerald-500/60 bg-emerald-950/30'
            : isReordered
              ? 'ring-1 ring-amber-500/50'
              : ''
        } ${isDragging ? 'shadow-lg shadow-primary/20' : ''}`}
      >
        <CardHeader className="gap-0.5 pb-0">
          <div className="flex items-center gap-0.5 min-w-0">
            <button
              className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
              aria-label={`Reorder ${player.name}`}
              {...attributes}
              {...listeners}
            >
              <GripVerticalIcon className="size-3" />
            </button>
            <CardTitle className="truncate text-xs leading-tight">
              {player.name}
            </CardTitle>
          </div>
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
    </div>
  );
}
