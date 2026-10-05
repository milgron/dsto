"use client";

import { useState } from "react";

/** Copies `text` to the clipboard; the label flips to "copiado" for a moment. */
export function Copy({ text, children, className = "chip" }: { text: string; children: React.ReactNode; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
    >
      {done ? "copiado ✓" : children}
    </button>
  );
}
