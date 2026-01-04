export const NAV_DONE_EVENT = "app:navigation-done";

export function signalNavigationDone(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAV_DONE_EVENT));
}

export function onNavigationDone(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(NAV_DONE_EVENT, handler);
  return () => window.removeEventListener(NAV_DONE_EVENT, handler);
}
