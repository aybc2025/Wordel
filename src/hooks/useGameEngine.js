import { useState, useCallback, useRef } from "react";
import { WORD_LENGTH, MAX_GUESSES, TILE_STATUS } from "../config/constants";
import { evaluateGuess, mergeKeyStatuses } from "../utils/evaluateGuess";

/**
 * Core game engine. Owns all game truth: current input, submitted guesses,
 * evaluations, win/loss state. Stays completely unaware of animation —
 * it only writes a small typed "lastEvent" description (with a monotonic
 * nonce) that the rendering layer observes to trigger effects, per the
 * event-channel pattern. Never cleared, only replaced with a new nonce.
 */
export function useGameEngine(targetWord, langCode = "he") {
  const [currentInput, setCurrentInput] = useState("");
  const [submittedGuesses, setSubmittedGuesses] = useState([]); // array of evaluated guesses
  const [keyStatuses, setKeyStatuses] = useState({});
  const [gamePhase, setGamePhase] = useState("playing"); // playing | won | lost
  const [lastEvent, setLastEvent] = useState(null);
  const nonceRef = useRef(0);

  const emitEvent = useCallback((kind, payload = {}) => {
    nonceRef.current += 1;
    setLastEvent({ kind, payload, nonce: nonceRef.current });
  }, []);

  const addLetter = useCallback(
    (letter) => {
      if (gamePhase !== "playing") return;
      setCurrentInput((prev) => {
        if (prev.length >= WORD_LENGTH) return prev;
        return prev + letter;
      });
    },
    [gamePhase]
  );

  const removeLetter = useCallback(() => {
    if (gamePhase !== "playing") return;
    setCurrentInput((prev) => prev.slice(0, -1));
  }, [gamePhase]);

  /**
   * Attempts to submit the current input as a guess.
   * @param {(word: string) => boolean} isValidWord - validator from word bank
   * @returns {{ ok: boolean, reason?: string }}
   */
  const submitGuess = useCallback(
    (isValidWord) => {
      if (gamePhase !== "playing") return { ok: false, reason: "game-over" };

      if (currentInput.length !== WORD_LENGTH) {
        emitEvent("invalid-length");
        return { ok: false, reason: "too-short" };
      }

      if (!isValidWord(currentInput)) {
        emitEvent("invalid-word", { word: currentInput });
        return { ok: false, reason: "not-in-bank" };
      }

      const evaluated = evaluateGuess(currentInput, targetWord, langCode);
      const isWin = evaluated.every((e) => e.status === TILE_STATUS.CORRECT);

      const nextGuesses = [...submittedGuesses, evaluated];
      setSubmittedGuesses(nextGuesses);
      setKeyStatuses((prev) => mergeKeyStatuses(prev, evaluated));
      setCurrentInput("");

      if (isWin) {
        setGamePhase("won");
        emitEvent("win", { guessCount: nextGuesses.length });
      } else if (nextGuesses.length >= MAX_GUESSES) {
        setGamePhase("lost");
        emitEvent("lose", { targetWord });
      } else {
        emitEvent("guess-submitted", { row: nextGuesses.length - 1 });
      }

      return { ok: true };
    },
    [currentInput, gamePhase, submittedGuesses, targetWord, langCode, emitEvent]
  );

  const reset = useCallback(() => {
    setCurrentInput("");
    setSubmittedGuesses([]);
    setKeyStatuses({});
    setGamePhase("playing");
    // Intentionally do not clear lastEvent — nonce-based dedupe means a
    // stale event just won't re-fire; a fresh one will get a new nonce.
  }, []);

  return {
    currentInput,
    submittedGuesses,
    keyStatuses,
    gamePhase,
    lastEvent,
    addLetter,
    removeLetter,
    submitGuess,
    reset,
  };
}
