/**
 * Purpose: Registers app-level keyboard shortcuts for fast admin and trainer workflows.
 */
import { useEffect } from "react";

export const useKeyboardShortcuts = (handlers = {}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target?.matches?.("input, textarea, select")) return;
      const key = event.key.toLowerCase();
      if (key === "/" && handlers.search) {
        event.preventDefault();
        handlers.search(event);
      }
      if (key === "n") handlers.newSession?.(event);
      if (key === "e") handlers.evaluate?.(event);
      if (key === "p") handlers.poster?.(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
};
