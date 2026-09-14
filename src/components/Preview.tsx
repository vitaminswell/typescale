"use client";

import { FluidToken, GROUP_DEFS, ROOT_PX, sizeAt } from "@/lib/typescale";

interface PreviewProps {
  tokens: FluidToken[];
  fontFamily: string;
  sampleText: string;
  screenPx: number;
}

const fmt = (n: number) => parseFloat(n.toFixed(3));

function Meta({ token, current }: { token: FluidToken; current: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-neutral-500">
      <span className="text-neutral-300">{token.label}</span>
      <span>{token.name}</span>
      <span className="text-neutral-600">·</span>
      <span>
        {token.min}–{token.maxScreen}rem
      </span>
      <span className="text-indigo-400">
        {fmt(current)}rem / {fmt(current * ROOT_PX)}px
      </span>
      {token.isBase && (
        <span className="rounded bg-neutral-800 px-1.5 py-px font-sans text-neutral-400">anchor</span>
      )}
      {(!token.accessible || token.shrinks) && (
        <span
          className="rounded bg-amber-500/15 px-1.5 py-px font-sans text-amber-300"
          title={
            token.shrinks
              ? "Intercept is ≤ 0 — this value shrinks toward zero on small screens"
              : "Max is more than 2.5× min — may not reach 2× at 500% zoom"
          }
        >
          {token.shrinks ? "shrinks" : "zoom a11y"}
        </span>
      )}
      <span className="ml-auto hidden text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100 xl:inline">
        {token.clamp}
      </span>
    </div>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-10 text-xs font-semibold uppercase tracking-widest text-neutral-500 first:mt-0">
      {children}
    </h2>
  );
}

export default function Preview({ tokens, fontFamily, sampleText, screenPx }: PreviewProps) {
  const byGroup = (id: FluidToken["group"]) => tokens.filter((t) => t.group === id);
  const text = sampleText || "The quick brown fox";

  return (
    <div className="flex flex-col">
      {GROUP_DEFS.filter((d) => d.id !== "spacing").map((def) => (
        <section key={def.id} className="flex flex-col">
          <GroupHeading>{def.title}</GroupHeading>
          <div className="flex flex-col divide-y divide-neutral-800">
            {byGroup(def.id).map((token) => {
              const rem = sizeAt(token, screenPx);
              return (
                <div key={token.name} className="group flex flex-col gap-2 rounded px-2 py-5 hover:bg-neutral-800/30">
                  <Meta token={token} current={rem} />
                  <p
                    className="break-words text-white"
                    style={{
                      fontFamily: fontFamily || "inherit",
                      fontSize: `${rem}rem`,
                      lineHeight: def.id === "headings" ? 1.1 : 1.5,
                    }}
                  >
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="flex flex-col">
        <GroupHeading>Spacing</GroupHeading>
        <div className="flex flex-col divide-y divide-neutral-800">
          {[...byGroup("spacing"), ...byGroup("general")].map((token) => {
            const rem = sizeAt(token, screenPx);
            return (
              <div key={token.name} className="group flex flex-col gap-2 rounded px-2 py-3 hover:bg-neutral-800/30">
                <Meta token={token} current={rem} />
                <div className="h-3 rounded-sm bg-indigo-500/70" style={{ width: `${rem}rem`, maxWidth: "100%" }} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
