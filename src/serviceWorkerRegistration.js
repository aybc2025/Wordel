// Registers the PWA service worker and reports when a new version is
// waiting to activate, so the app can show an update banner.
export function registerServiceWorker(onUpdateAvailable) {
  if (!("serviceWorker" in navigator)) return;

  function register() {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Actively check for a newer worker. Without this, a client that stays
        // open across a deploy can keep running the old one.
        registration.update().catch(() => {});

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              onUpdateAvailable(registration);
            }
          });
        });
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }

  // This runs from React's render, which under React 18's concurrent
  // scheduling can happen *after* window's "load" event has already fired — in
  // which case adding a "load" listener would never fire and the worker would
  // silently never register at all. Check readyState first.
  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}
