import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { isOperationPending, subscribeToOperations } from "../../services/operationActivity.js";
import Loader from "./Loader.jsx";

export default function OperationBoundary({ children }) {
  const root = useRef(null);
  const busy = useSyncExternalStore(subscribeToOperations, isOperationPending, () => false);

  useLayoutEffect(() => {
    const element = root.current;
    let previousFocus;
    let previousOverflow;
    let locked = false;
    const sync = () => {
      const pending = isOperationPending();
      if (pending === locked) return;
      locked = pending;
      element.inert = pending;
      if (pending) {
        previousFocus = element.contains(document.activeElement) ? document.activeElement : null;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = previousOverflow;
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      }
    };
    // The subscription applies inert immediately, before a second click can fire.
    const unsubscribe = subscribeToOperations(sync);
    const block = (event) => {
      if (isOperationPending() && (element.contains(event.target) || event.target === document.body || event.target === document.documentElement)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const events = ["click", "dblclick", "pointerdown", "keydown", "submit"];
    events.forEach((name) => document.addEventListener(name, block, true));
    sync();
    return () => {
      unsubscribe();
      events.forEach((name) => document.removeEventListener(name, block, true));
      element.inert = false;
      if (locked) document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <>
    <div ref={root} aria-busy={busy}>{children}</div>
    {busy && createPortal(
      <div className="fixed inset-0 flex cursor-wait items-center justify-center bg-white/60 px-4 backdrop-blur-sm" style={{ zIndex: 2147483647 }}>
        <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-6 py-4 text-sm font-semibold text-ink shadow-soft">
          <Loader /> Please wait, completing your request…
        </div>
      </div>, document.body
    )}
  </>;
}
