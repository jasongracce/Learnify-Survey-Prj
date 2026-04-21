"use client";

import { useEffect, useState } from "react";

// Tailwind's default `md` breakpoint.
const MD_QUERY = "(min-width: 768px)";

// Returns false during SSR and initial client render to stay hydration-safe,
// then upgrades to the real matchMedia result after mount. Consumers should
// treat `false` as "render the mobile variant" — desktop users will see a
// brief static fallback before the live variant mounts.
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia(MD_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
