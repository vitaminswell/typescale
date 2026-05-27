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

export default function Preview({
  steps,
  fontFamily,
  sampleText,
  previewWidth,
  viewportMin,
  viewportMax,
}: PreviewProps) {
  const simulatedSize = (step: TypeStep) =>
    interpolatePx(step, previewWidth, viewportMin, viewportMax);

  return (
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
  );
}
