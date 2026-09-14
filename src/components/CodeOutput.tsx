"use client";

import { useState } from "react";
import {
  FluidToken,
  LumosConfig,
  toFluidBuilderUrl,
  toRootCSS,
  toWebflowEmbed,
} from "@/lib/typescale";

type Tab = "embed" | "css" | "table";

const TABS: { id: Tab; label: string }[] = [
  { id: "embed", label: "Webflow embed" },
  { id: "css", label: "CSS" },
  { id: "table", label: "Values table" },
];

interface CodeOutputProps {
  config: LumosConfig;
  tokens: FluidToken[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback — select + execCommand for older Safari
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-md px-3 py-1 text-xs font-medium transition-colors
        bg-indigo-500 text-white hover:bg-indigo-400"
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

export default function CodeOutput({ config, tokens }: CodeOutputProps) {
  const [tab, setTab] = useState<Tab>("embed");

  const tableText = tokens
    .map((t) => `${t.name}\t${t.min}rem\t${t.maxScreen}rem\t${t.clamp}`)
    .join("\n");
  const copyText =
    tab === "embed" ? toWebflowEmbed(config, tokens) : tab === "css" ? toRootCSS(tokens) : tableText;

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900 overflow-hidden">
      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-700 px-4 py-2">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors
                ${tab === t.id ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={toFluidBuilderUrl(config, tokens)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-neutral-400 hover:text-white"
          >
            Open in Fluid Builder ↗
          </a>
          <CopyButton text={copyText} />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-auto max-h-[28rem] p-4">
        {tab === "table" ? (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-700">
                <th className="pb-2 pr-4 font-semibold">Variable</th>
                <th className="pb-2 pr-4 font-semibold">Mobile</th>
                <th className="pb-2 pr-4 font-semibold">Desktop</th>
                <th className="pb-2 font-semibold">Clamp</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.name} className="border-b border-neutral-800 text-neutral-300 hover:bg-neutral-800/40">
                  <td className="py-1.5 pr-4 font-mono text-indigo-400 whitespace-nowrap">{t.name}</td>
                  <td className="py-1.5 pr-4 font-mono">{t.min}rem</td>
                  <td className="py-1.5 pr-4 font-mono">{t.maxScreen}rem</td>
                  <td className="py-1.5 font-mono text-neutral-500 text-[10px] whitespace-nowrap">{t.clamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="text-xs leading-relaxed text-neutral-300 whitespace-pre" style={{ tabSize: 2 }}>
            <code>{copyText}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
