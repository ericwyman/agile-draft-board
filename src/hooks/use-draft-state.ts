'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'agile-draft-board-state';

type DraftStateData = {
  dismissed: string[];
  drafted: string[];
  orderOverrides: Record<string, string[]>;
};

function loadState(): DraftStateData {
  if (typeof window === 'undefined') return { dismissed: [], drafted: [], orderOverrides: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissed: [], drafted: [], orderOverrides: {} };
    const parsed = JSON.parse(raw);
    return {
      dismissed: parsed.dismissed || [],
      drafted: parsed.drafted || [],
      orderOverrides: parsed.orderOverrides || {},
    };
  } catch {
    return { dismissed: [], drafted: [], orderOverrides: {} };
  }
}

export function useDraftState() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set(loadState().dismissed));
  const [drafted, setDrafted] = useState<Set<string>>(() => new Set(loadState().drafted));
  const [orderOverrides, setOrderOverrides] = useState<Record<string, string[]>>(
    () => loadState().orderOverrides
  );

  useEffect(() => {
    const data: DraftStateData = {
      dismissed: Array.from(dismissed),
      drafted: Array.from(drafted),
      orderOverrides,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [dismissed, drafted, orderOverrides]);

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
    setPositionOrder,
    getPositionOrder,
    reset,
  };
}
