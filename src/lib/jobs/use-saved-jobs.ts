"use client";

import { useCallback, useEffect, useState } from "react";

// Client-side saved-jobs store (Demo mode). Persists to localStorage so users
// can save jobs WITHOUT an account/keys. When Supabase is configured this can be
// synced to a per-user table (see ENVIRONMENT_KEYS_REQUIRED.md) — the component
// API stays the same. A window event keeps every mounted component in sync.

export interface SavedJob {
  id: string;
  title: string;
  employer: string;
  city: string;
  applyUrl: string;
  majorSlug?: string;
}

const KEY = "markaz.savedJobs";
const EVENT = "markaz-saved-change";

function read(): SavedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedJob[]) : [];
  } catch {
    return [];
  }
}

function write(list: SavedJob[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable — saving is best-effort in demo mode */
  }
}

export function useSavedJobs() {
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(read());
    setReady(true);
    const sync = () => setSaved(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some((j) => j.id === id),
    [saved],
  );

  const toggle = useCallback((job: SavedJob) => {
    const list = read();
    const next = list.some((j) => j.id === job.id)
      ? list.filter((j) => j.id !== job.id)
      : [job, ...list];
    write(next);
    setSaved(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((j) => j.id !== id);
    write(next);
    setSaved(next);
  }, []);

  // Replace the whole list — used after syncing with the signed-in account so
  // the server list becomes the source of truth (and mirrors to localStorage).
  const replaceAll = useCallback((list: SavedJob[]) => {
    write(list);
    setSaved(list);
  }, []);

  return { saved, isSaved, toggle, remove, replaceAll, ready };
}
