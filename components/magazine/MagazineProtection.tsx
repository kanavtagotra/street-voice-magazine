"use client";

import { useEffect, type ReactNode } from "react";

type MagazineProtectionProps = {
  children: ReactNode;
};

export function MagazineProtection({ children }: MagazineProtectionProps) {
  useEffect(() => {
    const block = (event: Event) => event.preventDefault();

    const blockKeys = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;

      if (
        (mod && ["p", "s", "c", "a", "u", "shift"].includes(key)) ||
        (mod && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        key === "printscreen" ||
        key === "f12"
      ) {
        event.preventDefault();
      }
    };

    const blockSelect = (event: Event) => event.preventDefault();

    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("keydown", blockKeys);
    window.addEventListener("beforeprint", block);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("keydown", blockKeys);
      window.removeEventListener("beforeprint", block);
    };
  }, []);

  return <div className="magazine-protected select-none">{children}</div>;
}
