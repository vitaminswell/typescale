"use client";

import { TypeStep } from "@/lib/typescale";

interface PreviewProps {
  steps: TypeStep[];
  fontFamily: string;
  sampleText: string;
  previewWidth: number;
  viewportMin: number;
  viewportMax: number;
  baseMin: number;
  baseMax: number;
  stepsUp: number;
  stepsDown: number;
  onStepsUpChange: (n: number) => void;
  onStepsDownChange: (n: number) => void;
}

/** Linearly interpolate size based on a simulated viewport width */
function interpolatePx(
  step: TypeStep,
  vw: number,
  viewportMin: number,
  viewportMax: number
): number {
  const t = Math.max(
    0,
    Math.min(1, (vw - viewportMin) / (viewportMax - viewportMin))
  );
  return step.minPx + t * (step.maxPx - step.minPx);
}

function StepButton({
  label,
  onClick,
  disabled,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center justify-center w-6 h-6 rounded text-neutral-500
        hover:text-white hover:bg-neutral-700 transition-colors disabled:opacity-30
        disabled:cursor-not-allowed text-sm font-medium leading-none"
    >
      {label}
    </button>
  );
}

function AddRemoveBar({
  onAdd,
  onRemove,
  canRemove,
  addLabel,
  removeLabel,
}: {
  onAdd: () => void;
  onRemove: () => void;
  canRemove: boolean;
  addLabel: string;
  removeLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2 px-2 group/bar">
      <div className="flex-1 h-px bg-neutral-800 group-hover/bar:bg-neutral-700 transition-colors" />
      <StepButton label="+" onClick={onAdd} title={addLabel} />
      <StepButton
        label="−"
        onClick={onRemove}
        disabled={!canRemove}
        title={removeLabel}
      />
      <div className="flex-1 h-px bg-neutral-800 group-hover/bar:bg-neutral-700 transition-colors" />
    </div>
  );
}

export default function Preview({
  steps,
  fontFamily,
  sampleText,
  previewWidth,
  viewportMin,
  viewportMax,
  stepsUp,
  stepsDown,
  onStepsUpChange,
  onStepsDownChange,
}: PreviewProps) {
  const simulatedSize = (step: TypeStep) =>
    interpolatePx(step, previewWidth, viewportMin, viewportMax);

  return (
    <div className="flex flex-col">
      {/* ── Top bar: add/remove a size above the largest ── */}
      <AddRemoveBar
        onAdd={() => onStepsUpChange(stepsUp + 1)}
        onRemove={() => onStepsUpChange(Math.max(1, stepsUp - 1))}
        canRemove={stepsUp > 1}
        addLabel="Add a larger size above"
        removeLabel="Remove the largest size"
      />

      <div className="flex flex-col divide-y divide-neutral-800">
        {steps.map((step) => {
          const px = simulatedSize(step);
          return (
            <div
              key={step.step}
              className="group flex flex-col gap-0.5 py-5 transition-colors hover:bg-neutral-800/30 px-2 rounded"
            >
              {/* Metadata row */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-mono text-neutral-500">
                  {step.varName}
                </span>
                <span className="text-[11px] text-neutral-600">·</span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {step.minPx}–{step.maxPx}px
                </span>
                <span className="ml-auto text-[11px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {step.clamp}
                </span>
              </div>
              {/* Text preview */}
              <p
                className="leading-tight text-white break-words"
                style={{
                  fontFamily: fontFamily || "inherit",
                  fontSize: `${px}px`,
                  lineHeight: 1.15,
                }}
              >
                {sampleText || "The quick brown fox"}
              </p>
              {/* Step label */}
              <span className="text-[11px] text-neutral-600">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Bottom bar: add/remove a size below the smallest ── */}
      <AddRemoveBar
        onAdd={() => onStepsDownChange(stepsDown + 1)}
        onRemove={() => onStepsDownChange(Math.max(0, stepsDown - 1))}
        canRemove={stepsDown > 0}
        addLabel="Add a smaller size below"
        removeLabel="Remove the smallest size"
      />
    </div>
  );
}
