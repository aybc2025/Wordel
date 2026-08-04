import { useEffect } from "react";
import { getLanguage, canonicalizeLetter } from "../config/languages";

/**
 * Unifies physical keyboard input and on-screen keyboard taps into a single
 * handler surface. The on-screen <Keyboard/> calls the same callbacks
 * directly (see Keyboard.jsx), so this hook only needs to own the
 * document-level listener for physical keyboards.
 *
 * The accepted alphabet comes from the active language config, so a physical
 * QWERTY types English and a physical Hebrew layout types Hebrew, and keys
 * from the other language are ignored rather than half-registering.
 */
export function useKeyboardInput({ onLetter, onBackspace, onEnter, enabled, langCode = "he" }) {
  useEffect(() => {
    if (!enabled) return;

    const validLetters = new Set(getLanguage(langCode).letters.split(""));

    function handleKeyDown(e) {
      // Ignore if focus is inside an actual text input (e.g. WordPicker field)
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Enter") {
        onEnter();
        return;
      }
      if (e.key === "Backspace") {
        onBackspace();
        return;
      }
      // Modifier combos are shortcuts, not letter input.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;

      const letter = canonicalizeLetter(e.key, langCode);
      if (validLetters.has(letter)) {
        onLetter(letter);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLetter, onBackspace, onEnter, enabled, langCode]);
}
