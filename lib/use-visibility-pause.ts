// lib/use-visibility-pause.ts
"use client";

import { useEffect, useRef, useState } from "react";

export function useVisibilityPause<T extends Element = HTMLDivElement>(
  rootMargin: string = "200px 0px",
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isVisible };
}
