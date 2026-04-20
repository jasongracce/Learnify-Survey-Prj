"use client";

import { useEffect } from "react";

type Props = {
  onBack?: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
};

export default function Nav({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled = false,
  isSubmitting = false,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
      if (nextDisabled || isSubmitting) return;
      e.preventDefault();
      onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, nextDisabled, isSubmitting]);

  return (
    <div className="mt-12 flex items-start justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="mt-3 text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-50"
        >
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#1a1a1a]"
        >
          {nextLabel}
        </button>
        <span className="text-xs text-black/30">Ctrl + Enter</span>
      </div>
    </div>
  );
}
