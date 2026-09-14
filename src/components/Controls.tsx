"use client";

import { useState } from "react";
import {
  GROUP_DEFS,
  GroupDef,
  LumosConfig,
  ROOT_PX,
  ScaleGroupConfig,
  parseFluidBuilderUrl,
} from "@/lib/typescale";

interface ControlsProps {
  config: LumosConfig;
  onChange: (config: LumosConfig) => void;
  onReset: () => void;
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
      <label className="text-[11px] font-medium text-neutral-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
      {children}
    </h3>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

function NumberInput({
  value,
  onChange,
  step = 0.01,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        className={inputCls + " pr-10"}
        value={Number.isFinite(value) ? value : ""}
        min={min}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        onWheel={(e) => e.currentTarget.blur()}
      />
    </div>
  );
}

function RemInput(props: { value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div className="relative">
      <NumberInput {...props} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-500">
        rem
      </span>
    </div>
  );
}

function GroupControls({
  def,
  group,
  onChange,
}: {
  def: GroupDef;
  group: ScaleGroupConfig;
  onChange: (patch: Partial<ScaleGroupConfig>) => void;
}) {
  const baseLabel = def.vars[group.baseIndex].label;
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>{def.title}</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Desktop ratio">
          <NumberInput value={group.ratioMax} step={0.01} min={1} onChange={(ratioMax) => onChange({ ratioMax })} />
        </Field>
        <Field label="Mobile ratio">
          <NumberInput value={group.ratioMin} step={0.01} min={1} onChange={(ratioMin) => onChange({ ratioMin })} />
        </Field>
      </div>
      <Field label="Scale anchored to">
        <select
          className={inputCls}
          value={group.baseIndex}
          onChange={(e) => onChange({ baseIndex: parseInt(e.target.value) })}
        >
          {def.vars.map((v, i) => (
            <option key={v.name} value={i}>
              {v.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`${baseLabel} desktop`}>
          <RemInput value={group.baseMax} onChange={(baseMax) => onChange({ baseMax })} />
        </Field>
        <Field label={`${baseLabel} mobile`}>
          <RemInput value={group.baseMin} onChange={(baseMin) => onChange({ baseMin })} />
        </Field>
      </div>
    </div>
  );
}

function ImportField({ onImport }: { onImport: (config: LumosConfig) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    const parsed = parseFluidBuilderUrl(value.trim());
    if (!parsed) {
      setError(true);
      return;
    }
    onImport(parsed);
    setValue("");
    setError(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>Import</SectionTitle>
      <div className="flex gap-2">
        <input
          className={inputCls + " text-xs"}
          placeholder="Paste a Fluid Builder link…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="shrink-0 rounded-lg bg-neutral-700 px-3 text-xs font-medium text-neutral-200 hover:bg-neutral-600 disabled:opacity-40"
        >
          Load
        </button>
      </div>
      {error && <p className="text-[11px] text-red-400">That doesn&apos;t look like a Fluid Builder link.</p>}
    </div>
  );
}

export default function Controls({ config, onChange, onReset }: ControlsProps) {
  const { viewport } = config;
  const patchViewport = (patch: Partial<LumosConfig["viewport"]>) =>
    onChange({ ...config, viewport: { ...viewport, ...patch } });
  const patchGroup = (id: keyof LumosConfig["groups"], patch: Partial<ScaleGroupConfig>) =>
    onChange({ ...config, groups: { ...config.groups, [id]: { ...config.groups[id], ...patch } } });

  return (
    <div className="flex flex-col gap-7">
      {/* Screen sizes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle>Screen sizes</SectionTitle>
          <button onClick={onReset} className="text-[11px] text-neutral-500 hover:text-white">
            Reset to Lumos defaults
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Min" hint={`${viewport.min * ROOT_PX}px`}>
            <NumberInput value={viewport.min} step={1} onChange={(min) => patchViewport({ min })} />
          </Field>
          <Field label="Design" hint={`${viewport.design * ROOT_PX}px`}>
            <NumberInput value={viewport.design} step={1} onChange={(design) => patchViewport({ design })} />
          </Field>
          <Field label="Max" hint={`${viewport.max * ROOT_PX}px`}>
            <NumberInput value={viewport.max} step={1} onChange={(max) => patchViewport({ max })} />
          </Field>
        </div>
        <p className="text-[11px] leading-relaxed text-neutral-500">
          In rem. Values scale from Min to Design width and keep growing until the Max (Webflow site width).
        </p>
      </div>

      {GROUP_DEFS.map((def) => (
        <GroupControls
          key={def.id}
          def={def}
          group={config.groups[def.id]}
          onChange={(patch) => patchGroup(def.id, patch)}
        />
      ))}

      {/* General */}
      <div className="flex flex-col gap-3">
        <SectionTitle>Site margin</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Desktop">
            <RemInput
              value={config.siteMargin.max}
              onChange={(max) => onChange({ ...config, siteMargin: { ...config.siteMargin, max } })}
            />
          </Field>
          <Field label="Mobile">
            <RemInput
              value={config.siteMargin.min}
              onChange={(min) => onChange({ ...config, siteMargin: { ...config.siteMargin, min } })}
            />
          </Field>
        </div>
      </div>

      <ImportField onImport={onChange} />
    </div>
  );
}
