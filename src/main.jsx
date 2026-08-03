import { StrictMode, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker } from "./serviceWorkerRegistration.js";
import "./index.css";

function Root() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingRegistration, setWaitingRegistration] = useState(null);

  const handleUpdate = useCallback(() => {
    if (waitingRegistration?.waiting) {
      waitingRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  }, [waitingRegistration]);

  useState(() => {
    registerServiceWorker((registration) => {
      setWaitingRegistration(registration);
      setUpdateAvailable(true);
    });
  });

  return <App updateAvailable={updateAvailable} onUpdate={handleUpdate} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
