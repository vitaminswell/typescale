// ─── Types ────────────────────────────────────────────────────────────────────

export interface TypescaleConfig {
  /** Base font size (px) at the minimum viewport */
  baseMin: number;
  /** Base font size (px) at the maximum viewport */
  baseMax: number;
  /** Scale ratio (e.g. 1.333 for Perfect Fourth) */
  ratio: number;
  /** Number of steps above the base */
  stepsUp: number;
  /** Number of steps below the base */
  stepsDown: number;
  /** Minimum viewport width in px */
  viewportMin: number;
  /** Maximum viewport width in px */
  viewportMax: number;
}

export interface TypeStep {
  /** e.g. "h1", "h2", "base", "sm" */
  label: string;
  /** Step index relative to base (0 = base, positive = larger) */
  step: number;
  /** Font size in px at min viewport */
  minPx: number;
  /** Font size in px at max viewport */
  maxPx: number;
  /** Font size in rem at min viewport */
  minRem: number;
  /** Font size in rem at max viewport */
  maxRem: number;
  /** The preferred value in vw for the clamp middle term */
  slopeVw: number;
  /** The intercept in rem for the clamp middle term */
  interceptRem: number;
  /** Full CSS clamp() value */
  clamp: string;
  /** CSS custom property name */
  varName: string;
}

// ─── Named ratios ─────────────────────────────────────────────────────────────

export const NAMED_RATIOS: { label: string; value: number }[] = [
  { label: "Minor Second — 1.067", value: 1.067 },
  { label: "Major Second — 1.125", value: 1.125 },
  { label: "Minor Third — 1.200", value: 1.2 },
  { label: "Major Third — 1.250", value: 1.25 },
  { label: "Perfect Fourth — 1.333", value: 1.333 },
  { label: "Augmented Fourth — 1.414", value: 1.414 },
  { label: "Perfect Fifth — 1.500", value: 1.5 },
  { label: "Golden Ratio — 1.618", value: 1.618 },
];

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEP_LABELS: Record<number, string> = {
  6: "9xl",
  5: "8xl",
  4: "7xl",
  3: "6xl / h1",
  2: "4xl / h2",
  1: "2xl / h3",
  0: "base",
  "-1": "sm",
  "-2": "xs",
  "-3": "2xs",
};

function stepLabel(step: number): string {
  return STEP_LABELS[step] ?? (step > 0 ? `+${step}` : `${step}`);
}

function varName(step: number): string {
  if (step === 0) return "--fs-base";
  if (step > 0) {
    const names = ["lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
    return `--fs-${names[step - 1] ?? `step-${step}`}`;
  }
  const names = ["sm", "xs", "2xs", "3xs"];
  return `--fs-${names[Math.abs(step) - 1] ?? `step-${step}`}`;
}

function round(n: number, decimals = 4) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

// ─── Core calculation ─────────────────────────────────────────────────────────

export function computeTypescale(config: TypescaleConfig): TypeStep[] {
  const {
    baseMin,
    baseMax,
    ratio,
    stepsUp,
    stepsDown,
    viewportMin,
    viewportMax,
  } = config;

  const ROOT_PX = 16; // browser default

  const steps: TypeStep[] = [];

  for (let step = -stepsDown; step <= stepsUp; step++) {
    const minPx = round(baseMin * ratio ** step);
    const maxPx = round(baseMax * ratio ** step);

    const minRem = round(minPx / ROOT_PX);
    const maxRem = round(maxPx / ROOT_PX);

    // slope in rem/px, then expressed as vw multiplier
    const slope = (maxRem - minRem) / (viewportMax - viewportMin);
    const slopeVw = round(slope * 100); // per 100vw
    const interceptRem = round(minRem - slope * viewportMin);

    const preferred = `${slopeVw}vw + ${interceptRem}rem`;
    const clampVal = `clamp(${minRem}rem, ${preferred}, ${maxRem}rem)`;

    steps.push({
      label: stepLabel(step),
      step,
      minPx,
      maxPx,
      minRem,
      maxRem,
      slopeVw,
      interceptRem,
      clamp: clampVal,
      varName: varName(step),
    });
  }

  // Sort largest → smallest for display
  return steps.slice().reverse();
}

// ─── CSS output ───────────────────────────────────────────────────────────────

export function toCSSVariables(steps: TypeStep[]): string {
  const lines = steps
    .slice()
    .sort((a, b) => a.step - b.step)
    .map((s) => `  ${s.varName}: ${s.clamp};`);
  return `:root {\n${lines.join("\n")}\n}`;
}
