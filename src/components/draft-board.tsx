'use client';

import { useDraftState } from '@/hooks/use-draft-state';
import { PositionRow } from '@/components/position-row';
import { MyTeamSheet } from '@/components/my-team-sheet';
import type { Player } from '@/lib/types';
import { POSITION_ORDER } from '@/lib/types';

type DraftBoardProps = {
  positions: Record<string, Player[]>;
};

export function DraftBoard({ positions }: DraftBoardProps) {
  const { dismiss, draft, undraft, isDismissed, isDrafted, drafted } = useDraftState();

  return (
    <main className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Agile Draft Board</h1>
        <MyTeamSheet
          positions={positions}
          drafted={drafted}
          onUndraft={undraft}
        />
      </header>

      <div className="space-y-3">
        {POSITION_ORDER.map((pos) => (
          <PositionRow
            key={pos}
            position={pos}
            players={positions[pos] || []}
            isDismissed={isDismissed}
            isDrafted={isDrafted}
            onDismiss={dismiss}
            onDraft={draft}
          />
        ))}
      </div>
    </main>
  );
}
