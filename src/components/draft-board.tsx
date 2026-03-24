'use client';

import { useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDraftState } from '@/hooks/use-draft-state';
import { PositionRow } from '@/components/position-row';
import { MyTeamSheet } from '@/components/my-team-sheet';
import type { Player } from '@/lib/types';
import { POSITION_ORDER, playerKey } from '@/lib/types';

type DraftBoardProps = {
  positions: Record<string, Player[]>;
};

export function DraftBoard({ positions }: DraftBoardProps) {
  const {
    dismiss,
    draft,
    undraft,
    isDismissed,
    isDrafted,
    drafted,
    setPositionOrder,
    getPositionOrder,
  } = useDraftState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Build ordered key arrays for each position
  const orderedKeysByPosition = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const pos of POSITION_ORDER) {
      const players = positions[pos] || [];
      const defaultKeys = players.map((p) => playerKey(pos, p.name));
      const saved = getPositionOrder(pos);
      if (saved) {
        // Merge: use saved order but include any new players not yet in saved order
        const savedSet = new Set(saved);
        const merged = [...saved.filter((k) => defaultKeys.includes(k))];
        for (const k of defaultKeys) {
          if (!savedSet.has(k)) merged.push(k);
        }
        result[pos] = merged;
      } else {
        result[pos] = defaultKeys;
      }
    }
    return result;
  }, [positions, getPositionOrder]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find which position this belongs to
      const position = activeId.split('::')[0];
      const currentKeys = orderedKeysByPosition[position];
      if (!currentKeys) return;

      const oldIndex = currentKeys.indexOf(activeId);
      const newIndex = currentKeys.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newKeys = arrayMove(currentKeys, oldIndex, newIndex);
      setPositionOrder(position, newKeys);
    },
    [orderedKeysByPosition, setPositionOrder]
  );

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3">
          {POSITION_ORDER.map((pos) => (
            <PositionRow
              key={pos}
              position={pos}
              players={positions[pos] || []}
              orderedKeys={orderedKeysByPosition[pos] || []}
              isDismissed={isDismissed}
              isDrafted={isDrafted}
              onDismiss={dismiss}
              onDraft={draft}
            />
          ))}
        </div>
      </DndContext>
    </main>
  );
}
