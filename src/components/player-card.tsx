import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  // Data comes as "First Last" — split to display as "Last\nFirst"
  const parts = name.split(' ');
  if (parts.length === 1) return { last: parts[0], first: '' };
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');
  return { last, first };
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isPitcher = position === 'SP' || position === 'RP';
  const statLabel = isPitcher ? 'ADP' : 'WAR';
  const statValue = isPitcher ? player.adp : player.war;
  const { last, first } = formatName(player.name);
  const showDraft = !isDrafted && (selected || isReordered);

  return (
    <div ref={setNodeRef} style={style} className="shrink-0">
      <Card
        size="sm"
        className={`w-48 cursor-grab active:cursor-grabbing touch-none transition-colors ${
          isDrafted
            ? 'ring-2 ring-emerald-500/60 bg-emerald-950/30'
            : isReordered
              ? 'ring-1 ring-amber-500/50'
              : selected
                ? 'ring-1 ring-primary/40'
                : ''
        } ${isDragging ? 'shadow-lg shadow-primary/20' : ''}`}
        onClick={() => setSelected((s) => !s)}
        {...attributes}
        {...listeners}
      >
        <CardHeader className="gap-0 pb-0">
          <div className="min-w-0">
            <CardTitle className="text-sm font-bold leading-tight">
              {last}
            </CardTitle>
            {first && (
              <div className="text-xs text-muted-foreground leading-tight">
                {first}
              </div>
            )}
          </div>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              aria-label={`Dismiss ${player.name}`}
            >
              <XIcon className="size-3.5" />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 pt-0">
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
            <span className="text-xs text-muted-foreground">
              {statLabel} <span className="text-foreground font-medium">{statValue}</span>
            </span>
            {showDraft && (
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => { e.stopPropagation(); onDraft(); }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 h-5 px-2"
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
