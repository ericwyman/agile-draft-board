'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'agile-draft-board-state';

type DraftStateData = {
  dismissed: string[];
  drafted: string[];
  reordered: string[];
  orderOverrides: Record<string, string[]>;
  rowsPerPosition: number;
};

function loadState(): DraftStateData {
  if (typeof window === 'undefined')
    return { dismissed: [], drafted: [], reordered: [], orderOverrides: {}, rowsPerPosition: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return { dismissed: [], drafted: [], reordered: [], orderOverrides: {}, rowsPerPosition: 1 };
    const parsed = JSON.parse(raw);
    return {
      dismissed: parsed.dismissed || [],
      drafted: parsed.drafted || [],
      reordered: parsed.reordered || [],
      orderOverrides: parsed.orderOverrides || {},
      rowsPerPosition: parsed.rowsPerPosition ?? 1,
    };
  } catch {
    return { dismissed: [], drafted: [], reordered: [], orderOverrides: {}, rowsPerPosition: 1 };
  }
}

export function useDraftState() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set(loadState().dismissed));
  const [drafted, setDrafted] = useState<Set<string>>(() => new Set(loadState().drafted));
  const [reordered, setReordered] = useState<Set<string>>(() => new Set(loadState().reordered));
  const [orderOverrides, setOrderOverrides] = useState<Record<string, string[]>>(
    () => loadState().orderOverrides
  );
  const [rowsPerPosition, setRowsPerPosition] = useState<number>(
    () => loadState().rowsPerPosition
  );

  useEffect(() => {
    const data: DraftStateData = {
      dismissed: Array.from(dismissed),
      drafted: Array.from(drafted),
      reordered: Array.from(reordered),
      orderOverrides,
      rowsPerPosition,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [dismissed, drafted, reordered, orderOverrides, rowsPerPosition]);

  const dismiss = useCallback((key: string) => {
    setDismissed((prev) => new Set(prev).add(key));
  }, []);

  const draft = useCallback((key: string) => {
    setDrafted((prev) => new Set(prev).add(key));
  }, []);

  const undraft = useCallback((key: string) => {
    setDrafted((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isDismissed = useCallback((key: string) => dismissed.has(key), [dismissed]);
  const isDrafted = useCallback((key: string) => drafted.has(key), [drafted]);
  const isReordered = useCallback((key: string) => reordered.has(key), [reordered]);

  const markReordered = useCallback((key: string) => {
    setReordered((prev) => new Set(prev).add(key));
  }, []);

  const setPositionOrder = useCallback((position: string, keys: string[]) => {
    setOrderOverrides((prev) => ({ ...prev, [position]: keys }));
  }, []);

  const getPositionOrder = useCallback(
    (position: string): string[] | undefined => orderOverrides[position],
    [orderOverrides]
  );

  const reset = useCallback(() => {
    setDismissed(new Set());
    setDrafted(new Set());
    setReordered(new Set());
    setOrderOverrides({});
  }, []);

  return {
    dismissed,
    drafted,
    dismiss,
    draft,
    undraft,
    isDismissed,
    isDrafted,
    isReordered,
    markReordered,
    setPositionOrder,
    getPositionOrder,
    rowsPerPosition,
    setRowsPerPosition,
    reset,
  };
}
