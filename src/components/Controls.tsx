"use client";

import { NAMED_RATIOS, TypescaleConfig } from "@/lib/typescale";

interface ControlsProps {
  config: TypescaleConfig;
  onChange: (patch: Partial<TypescaleConfig>) => void;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function Controls({ config, onChange }: ControlsProps) {
  const isCustomRatio = !NAMED_RATIOS.some((r) => r.value === config.ratio);

  return (
    <div className="flex flex-col gap-6">
      {/* Base sizes */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Base min" hint="px — at smallest viewport">
          <input
            type="number"
            className={inputCls}
            value={config.baseMin}
            min={8}
            max={64}
            step={0.5}
            onChange={(e) => onChange({ baseMin: parseFloat(e.target.value) })}
          />
        </Field>
        <Field label="Base max" hint="px — at largest viewport">
          <input
            type="number"
            className={inputCls}
            value={config.baseMax}
            min={8}
            max={64}
            step={0.5}
            onChange={(e) => onChange({ baseMax: parseFloat(e.target.value) })}
          />
        </Field>
      </div>

      {/* Ratio */}
      <Field label="Scale ratio">
        <select
          className={inputCls}
          value={isCustomRatio ? "custom" : config.ratio}
          onChange={(e) => {
            if (e.target.value !== "custom") {
              onChange({ ratio: parseFloat(e.target.value) });
            }
          }}
        >
          {NAMED_RATIOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
          {isCustomRatio && <option value="custom">Custom ({config.ratio})</option>}
        </select>
        {/* Custom ratio input */}
        <input
          type="number"
          className={inputCls + " mt-2"}
          placeholder="Custom ratio…"
          step={0.001}
          min={1.001}
          max={3}
          value={isCustomRatio ? config.ratio : ""}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v > 1) onChange({ ratio: v });
          }}
        />
      </Field>

      {/* Steps */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Steps up">
          <input
            type="number"
            className={inputCls}
            value={config.stepsUp}
            min={1}
            max={10}
            step={1}
            onChange={(e) => onChange({ stepsUp: parseInt(e.target.value) })}
          />
        </Field>
        <Field label="Steps down">
          <input
            type="number"
            className={inputCls}
            value={config.stepsDown}
            min={0}
            max={5}
            step={1}
            onChange={(e) => onChange({ stepsDown: parseInt(e.target.value) })}
          />
        </Field>
      </div>

      {/* Viewports */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Viewport min" hint="px">
          <input
            type="number"
            className={inputCls}
            value={config.viewportMin}
            min={240}
            max={1024}
            step={10}
            onChange={(e) =>
              onChange({ viewportMin: parseInt(e.target.value) })
            }
          />
        </Field>
        <Field label="Viewport max" hint="px">
          <input
            type="number"
            className={inputCls}
            value={config.viewportMax}
            min={768}
            max={2560}
            step={10}
            onChange={(e) =>
              onChange({ viewportMax: parseInt(e.target.value) })
            }
          />
        </Field>
      </div>
    </div>
  );
}
