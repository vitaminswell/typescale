"use client";

import { useState } from "react";
import { TypeStep, toCSSVariables } from "@/lib/typescale";

type Tab = "css" | "table";

interface CodeOutputProps {
  steps: TypeStep[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback — select + execCommand for older Safari
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-md px-3 py-1 text-xs font-medium transition-colors
        bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white"
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

export default function CodeOutput({ steps }: CodeOutputProps) {
  const [tab, setTab] = useState<Tab>("css");

  const sorted = steps.slice().sort((a, b) => a.step - b.step);
  const cssString = toCSSVariables(steps);

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-neutral-700 px-4 py-2">
        <div className="flex gap-1">
          {(["css", "table"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors
                ${tab === t
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-500 hover:text-neutral-300"
                }`}
            >
              {t === "css" ? "CSS Variables" : "Values table"}
            </button>
          ))}
        </div>
        <CopyButton
          text={
            tab === "css"
              ? cssString
              : sorted
                  .map(
                    (s) =>
                      `${s.varName}\t${s.minPx}px\t${s.maxPx}px\t${s.minRem}rem → ${s.maxRem}rem`
                  )
                  .join("\n")
          }
        />
      </div>

      {/* Content */}
      <div className="overflow-auto max-h-96 p-4">
        {tab === "css" ? (
          <pre className="text-xs leading-relaxed text-neutral-300 whitespace-pre">
            <code>{cssString}</code>
          </pre>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-700">
                <th className="pb-2 pr-4 font-semibold">Variable</th>
                <th className="pb-2 pr-4 font-semibold">Step</th>
                <th className="pb-2 pr-4 font-semibold">Min</th>
                <th className="pb-2 pr-4 font-semibold">Max</th>
                <th className="pb-2 font-semibold">Clamp</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr
                  key={s.step}
                  className="border-b border-neutral-800 text-neutral-300 hover:bg-neutral-800/40"
                >
                  <td className="py-1.5 pr-4 font-mono text-indigo-400">
                    {s.varName}
                  </td>
                  <td className="py-1.5 pr-4 text-neutral-500">{s.label}</td>
                  <td className="py-1.5 pr-4 font-mono">
                    {s.minPx}px / {s.minRem}rem
                  </td>
                  <td className="py-1.5 pr-4 font-mono">
                    {s.maxPx}px / {s.maxRem}rem
                  </td>
                  <td className="py-1.5 font-mono text-neutral-500 text-[10px]">
                    {s.clamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
