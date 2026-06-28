"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(sound.enabled);
  }, []);

  return (
    <button
      className="icon-btn"
      aria-pressed={on}
      aria-label="Toggle sound"
      title="Sound"
      onClick={() => {
        const next = sound.toggle();
        setOn(next);
        if (next) sound.coin();
      }}
    >
      {on ? "♪" : "×"}
    </button>
  );
}
