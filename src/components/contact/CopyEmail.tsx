"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copiar email: Copy → Check + «Copiado» 1600 ms; si el portapapeles falla, mailto. */
export function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button type="button" className="copy-btn" onClick={onClick} aria-label={done ? copied : `${copy}: ${email}`}>
      {done ? <Check size={16} strokeWidth={1.5} aria-hidden /> : <Copy size={16} strokeWidth={1.5} aria-hidden />}
      <span aria-live="polite">{done ? copied : copy}</span>
    </button>
  );
}
