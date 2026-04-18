"use client";

type Props = {
  current: number;
  total: number;
  stepLabelTemplate: string; // e.g. "Step {current} of {total}"
};

export default function Progress({ current, total, stepLabelTemplate }: Props) {
  const pct = Math.round((current / total) * 100);
  const label = stepLabelTemplate
    .replace("{current}", String(current))
    .replace("{total}", String(total));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#6b6b6b]">{label}</span>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-black/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#1a1a1a] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
