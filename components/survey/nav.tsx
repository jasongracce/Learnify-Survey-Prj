"use client";

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
  return (
    <div className="mt-12 flex items-center justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-50"
        >
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#1a1a1a]"
      >
        {nextLabel}
      </button>
    </div>
  );
}
