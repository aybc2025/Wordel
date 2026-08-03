import { useState, useCallback } from "react";
import { STATS_STORAGE_KEY, MAX_GUESSES } from "../config/constants";

function defaultStats() {
  return {
    totalRounds: 0,
    wins: 0,
    guessDistribution: new Array(MAX_GUESSES).fill(0),
    currentStreak: 0,
    bestStreak: 0,
  };
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw);
    // Guard against corrupted/older shape
    if (
      typeof parsed.totalRounds !== "number" ||
      !Array.isArray(parsed.guessDistribution)
    ) {
      return defaultStats();
    }
    return { ...defaultStats(), ...parsed };
  } catch {
    return defaultStats();
  }
}

/**
 * Manages per-device game statistics in localStorage.
 * Never sent anywhere — purely local.
 */
export function useStats() {
  const [stats, setStats] = useState(loadStats);

  const persist = useCallback((next) => {
    setStats(next);
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (private browsing etc.) — fail silently,
      // stats just won't persist across sessions.
    }
  }, []);

  const recordRound = useCallback(
    ({ won, guessCount }) => {
      const current = loadStats();
      const next = { ...current };
      next.totalRounds = current.totalRounds + 1;
      if (won) {
        next.wins = current.wins + 1;
        next.currentStreak = current.currentStreak + 1;
        next.bestStreak = Math.max(current.bestStreak, next.currentStreak);
        next.guessDistribution = [...current.guessDistribution];
        const idx = Math.min(guessCount - 1, MAX_GUESSES - 1);
        next.guessDistribution[idx] = (next.guessDistribution[idx] || 0) + 1;
      } else {
        next.currentStreak = 0;
      }
      persist(next);
    },
    [persist]
  );

  const resetStats = useCallback(() => {
    persist(defaultStats());
  }, [persist]);

  return { stats, recordRound, resetStats };
}
