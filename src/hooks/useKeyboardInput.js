import { useEffect } from "react";

const VALID_HEBREW = new Set(
  "אבגדהוזחטיכלמנסעפצקרשתךםןףץ".split("")
);

/**
 * Unifies physical keyboard input and on-screen keyboard taps into a single
 * handler surface. The on-screen <Keyboard/> calls the same callbacks
 * directly (see Keyboard.jsx), so this hook only needs to own the
 * document-level listener for physical keyboards.
 */
export function useKeyboardInput({ onLetter, onBackspace, onEnter, enabled }) {
  useEffect(() => {
    if (!enabled) return;

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
      if (VALID_HEBREW.has(e.key)) {
        onLetter(e.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLetter, onBackspace, onEnter, enabled]);
}
