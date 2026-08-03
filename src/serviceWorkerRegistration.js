// Registers the PWA service worker and reports when a new version is
// waiting to activate, so the app can show an update banner.
export function registerServiceWorker(onUpdateAvailable) {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
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
  });
}
