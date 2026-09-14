"use client";

import { useRef, useState } from "react";
import Controls from "@/components/Controls";
import FontUpload from "@/components/FontUpload";
import Preview from "@/components/Preview";
import CodeOutput from "@/components/CodeOutput";
import { computeTokens, LUMOS_DEFAULTS, LumosConfig, ROOT_PX } from "@/lib/typescale";

export default function Home() {
  const [config, setConfig] = useState<LumosConfig>(LUMOS_DEFAULTS);
  const [fontName, setFontName] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>("system-ui");
  const [sampleText, setSampleText] = useState(
    "Almost before we knew it, we had left the ground."
  );
  const [rawPreviewWidth, setPreviewWidth] = useState(LUMOS_DEFAULTS.viewport.design * ROOT_PX);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const handleFontLoad = (name: string, dataUrl: string) => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      document.head.appendChild(el);
      styleRef.current = el;
    }
    styleRef.current.textContent = `
      @font-face {
        font-family: "${name}";
        src: url('${dataUrl}');
        font-display: swap;
      }
    `;
    setFontName(name);
    setFontFamily(name);
  };

  const handleFontClear = () => {
    if (styleRef.current) styleRef.current.textContent = "";
    setFontName(null);
    setFontFamily("system-ui");
  };

  const tokens = computeTokens(config);

  const screenMin = config.viewport.min * ROOT_PX;
  const screenMax = Math.max(config.viewport.max, config.viewport.design) * ROOT_PX;

  const previewWidth = Math.max(screenMin, Math.min(screenMax, rawPreviewWidth));

  const vpPercent = ((previewWidth - screenMin) / (screenMax - screenMin || 1)) * 100;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">Typescale</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            Lumos
          </span>
        </div>
        <p className="text-xs text-neutral-500 hidden sm:block">
          Fluid type &amp; spacing for Lumos · rem · clamp()
        </p>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-800 overflow-y-auto">
          <div className="p-5 flex flex-col gap-7">
            <FontUpload
              fontName={fontName}
              onFontLoad={handleFontLoad}
              onFontClear={handleFontClear}
            />
            <Controls config={config} onChange={setConfig} onReset={() => setConfig(LUMOS_DEFAULTS)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Sample text
              </label>
              <textarea
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white resize-none placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Type something…"
              />
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Viewport slider */}
          <div className="border-b border-neutral-800 px-6 py-3 flex items-center gap-4">
            <span className="text-xs text-neutral-500 shrink-0">
              {config.viewport.min}rem
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={screenMin}
                max={screenMax}
                value={previewWidth}
                onChange={(e) => setPreviewWidth(parseInt(e.target.value))}
                className="w-full h-1 appearance-none rounded-full cursor-pointer accent-indigo-500"
                style={{
                  background: `linear-gradient(to right, #6366f1 ${vpPercent}%, #3f3f46 ${vpPercent}%)`,
                }}
              />
            </div>
            <span className="text-xs text-neutral-500 shrink-0">
              {Math.max(config.viewport.max, config.viewport.design)}rem
            </span>
            <span className="text-xs font-mono text-indigo-400 shrink-0 w-32 text-right">
              {parseFloat((previewWidth / ROOT_PX).toFixed(2))}rem · {previewWidth}px
            </span>
          </div>

          {/* Preview */}
          <div className="flex-1 px-6 py-6">
            <Preview
              tokens={tokens}
              fontFamily={fontFamily}
              sampleText={sampleText}
              screenPx={previewWidth}
            />
          </div>

          {/* Code output */}
          <div className="border-t border-neutral-800 px-6 py-6">
            <CodeOutput config={config} tokens={tokens} />
          </div>
        </main>
      </div>
    </div>
  );
}
