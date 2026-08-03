import { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/Header";
import Board from "./components/Board";
import Keyboard from "./components/Keyboard";
import HandoffScreen from "./components/HandoffScreen";
import MenuDrawer from "./components/MenuDrawer";
import UpdateBanner from "./components/UpdateBanner";
import { useWordBank } from "./hooks/useWordBank";
import { useGameEngine } from "./hooks/useGameEngine";
import { useStats } from "./hooks/useStats";
import { useKeyboardInput } from "./hooks/useKeyboardInput";
import styles from "./App.module.css";

export default function App({ updateAvailable, onUpdate }) {
  const { status, totalCount, commonCount, pickRandomWord, isValidWord } = useWordBank();
  const { stats, recordRound, resetStats } = useStats();

  const [targetWord, setTargetWord] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commonOnly, setCommonOnly] = useState(false);
  const [shakeRow, setShakeRow] = useState(null);
  const recordedRef = useRef(false);

  // Pick the very first word once the word bank has loaded.
  useEffect(() => {
    if (status === "ready" && targetWord === null) {
      setTargetWord(pickRandomWord(false));
    }
  }, [status, targetWord, pickRandomWord]);

  const engine = useGameEngine(targetWord || "");

  // React to game-engine events (the "observer" side of the event channel).
  useEffect(() => {
    if (!engine.lastEvent) return;
    const { kind } = engine.lastEvent;

    if (kind === "invalid-length" || kind === "invalid-word") {
      setShakeRow(engine.submittedGuesses.length);
      const t = setTimeout(() => setShakeRow(null), 320);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.lastEvent]);

  // Record stats exactly once per finished round.
  useEffect(() => {
    if (engine.gamePhase === "playing") {
      recordedRef.current = false;
      return;
    }
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordRound({
      won: engine.gamePhase === "won",
      guessCount: engine.submittedGuesses.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.gamePhase]);

  const handleLetter = useCallback((letter) => engine.addLetter(letter), [engine]);
  const handleBackspace = useCallback(() => engine.removeLetter(), [engine]);
  const handleEnter = useCallback(() => engine.submitGuess(isValidWord), [engine, isValidWord]);

  useKeyboardInput({
    onLetter: handleLetter,
    onBackspace: handleBackspace,
    onEnter: handleEnter,
    enabled: engine.gamePhase === "playing" && !menuOpen,
  });

  const handleStartNewRound = useCallback(
    (word) => {
      setTargetWord(word);
      engine.reset();
    },
    [engine]
  );

  const handleNewGameClick = useCallback(() => {
    // Quick-restart with a fresh random word from the current header refresh icon.
    const word = pickRandomWord(commonOnly);
    if (word) {
      setTargetWord(word);
      engine.reset();
    }
  }, [pickRandomWord, commonOnly, engine]);

  if (status === "loading" || targetWord === null) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>טוען מאגר מילים...</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>
          שגיאה בטעינת מאגר המילים. נסה/י לרענן את הדף.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <UpdateBanner visible={updateAvailable} onUpdate={onUpdate} />
      <Header onMenuClick={() => setMenuOpen(true)} onNewGameClick={handleNewGameClick} />

      {engine.gamePhase === "playing" ? (
        <>
          <Board
            submittedGuesses={engine.submittedGuesses}
            currentInput={engine.currentInput}
            shakeRow={shakeRow}
          />
          <Keyboard
            onLetter={handleLetter}
            onBackspace={handleBackspace}
            onEnter={handleEnter}
            keyStatuses={engine.keyStatuses}
            disabled={false}
          />
        </>
      ) : (
        <HandoffScreen
          gamePhase={engine.gamePhase}
          targetWord={targetWord}
          guessCount={engine.submittedGuesses.length}
          onStartNewRound={handleStartNewRound}
          onBackToMenu={() => setMenuOpen(true)}
          pickRandomWord={pickRandomWord}
          isValidWord={isValidWord}
        />
      )}

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        totalCount={totalCount}
        commonCount={commonCount}
        commonOnly={commonOnly}
        onToggleCommonOnly={setCommonOnly}
        stats={stats}
        onResetStats={resetStats}
      />
    </div>
  );
}
