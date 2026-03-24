'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'agile-draft-board-state';

type DraftStateData = {
  dismissed: string[];
  drafted: string[];
};

function loadState(): DraftStateData {
  if (typeof window === 'undefined') return { dismissed: [], drafted: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissed: [], drafted: [] };
    return JSON.parse(raw) as DraftStateData;
  } catch {
    return { dismissed: [], drafted: [] };
  }
}

export function useDraftState() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set(loadState().dismissed));
  const [drafted, setDrafted] = useState<Set<string>>(() => new Set(loadState().drafted));

  useEffect(() => {
    const data: DraftStateData = {
      dismissed: Array.from(dismissed),
      drafted: Array.from(drafted),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [dismissed, drafted]);

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

  const reset = useCallback(() => {
    setDismissed(new Set());
    setDrafted(new Set());
  }, []);

  return {
    dismissed,
    drafted,
    dismiss,
    draft,
    undraft,
    isDismissed,
    isDrafted,
    reset,
  };
}
