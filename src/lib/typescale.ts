// Lumos fluid scale — mirrors the math and output of https://fluidbuilder.webflow.io
// so values and variable names match a Lumos project 1:1. All sizes are in rem.

// ─── Types ────────────────────────────────────────────────────────────────────

export type GroupId = "headings" | "text" | "spacing";

export interface ViewportConfig {
  /** Stop scaling down at this screen size (rem) */
  min: number;
  /** Figma design width — values are reached at this size (rem) */
  design: number;
  /** Webflow site width — stop scaling up at this size (rem) */
  max: number;
}

export interface ScaleGroupConfig {
  /** Desktop scale ratio */
  ratioMax: number;
  /** Mobile scale ratio */
  ratioMin: number;
  /** Index (in GROUP_DEFS order) of the variable the scale is anchored to */
  baseIndex: number;
  /** Anchor size at the design width (rem) */
  baseMax: number;
  /** Anchor size at the min screen width (rem) */
  baseMin: number;
}

export interface LumosConfig {
  viewport: ViewportConfig;
  groups: Record<GroupId, ScaleGroupConfig>;
  siteMargin: { max: number; min: number };
}

export interface FluidToken {
  group: GroupId | "general";
  /** Human label, e.g. "H1" */
  label: string;
  /** CSS custom property name */
  name: string;
  /** Size at min screen (rem) */
  min: number;
  /** Size at design width (rem) */
  max: number;
  /** Size at max screen — the clamp upper bound (rem) */
  maxScreen: number;
  interceptRem: number;
  vw: number;
  /** Full clamp() value, including the trailing semicolon */
  clamp: string;
  isBase: boolean;
  /** Fluid Builder's 500%-zoom check */
  accessible: boolean;
  /** Intercept ≤ 0 — the value shrinks toward zero on small screens */
  shrinks: boolean;
}

// ─── Lumos variable definitions ───────────────────────────────────────────────

export interface GroupDef {
  id: GroupId;
  title: string;
  /** Largest → smallest, same order as Fluid Builder */
  vars: { name: string; label: string }[];
}

export const GROUP_DEFS: GroupDef[] = [
  {
    id: "headings",
    title: "Headings",
    vars: [
      { name: "--_typography---font-size--display", label: "Display" },
      { name: "--_typography---font-size--h1", label: "H1" },
      { name: "--_typography---font-size--h2", label: "H2" },
      { name: "--_typography---font-size--h3", label: "H3" },
      { name: "--_typography---font-size--h4", label: "H4" },
      { name: "--_typography---font-size--h5", label: "H5" },
      { name: "--_typography---font-size--h6", label: "H6" },
    ],
  },
  {
    id: "text",
    title: "Paragraphs",
    vars: [
      { name: "--_typography---font-size--text-large", label: "Text Large" },
      { name: "--_typography---font-size--text-main", label: "Text Main" },
      { name: "--_typography---font-size--text-small", label: "Text Small" },
    ],
  },
  {
    id: "spacing",
    title: "Spacing",
    vars: [
      { name: "--_spacing---section-space--large", label: "Section Large" },
      { name: "--_spacing---section-space--main", label: "Section Main" },
      { name: "--_spacing---section-space--small", label: "Section Small" },
      { name: "--_spacing---space--8", label: "Space 8" },
      { name: "--_spacing---space--7", label: "Space 7" },
      { name: "--_spacing---space--6", label: "Space 6" },
      { name: "--_spacing---space--5", label: "Space 5" },
      { name: "--_spacing---space--4", label: "Space 4" },
      { name: "--_spacing---space--3", label: "Space 3" },
      { name: "--_spacing---space--2", label: "Space 2" },
      { name: "--_spacing---space--1", label: "Space 1" },
    ],
  },
];

export const SITE_MARGIN_VAR = "--site--margin";

export const LUMOS_DEFAULTS: LumosConfig = {
  viewport: { min: 20, design: 90, max: 90 },
  groups: {
    headings: { ratioMax: 1.39, ratioMin: 1.26, baseIndex: 6, baseMax: 1, baseMin: 1 },
    text: { ratioMax: 1.2, ratioMin: 1.14, baseIndex: 2, baseMax: 0.875, baseMin: 0.875 },
    spacing: { ratioMax: 1.49, ratioMin: 1.4, baseIndex: 10, baseMax: 0.25, baseMin: 0.25 },
  },
  siteMargin: { max: 3, min: 1 },
};

export const ROOT_PX = 16;

// ─── Core calculation (ported from Fluid Builder) ─────────────────────────────

const fixed = (n: number, digits: number) => parseFloat(n.toFixed(digits));

function fluid(
  min: number,
  max: number,
  viewport: ViewportConfig
): Pick<FluidToken, "maxScreen" | "interceptRem" | "vw" | "clamp" | "accessible" | "shrinks"> {
  const slope = fixed((max - min) / (viewport.design - viewport.min), 4);
  const maxScreen = fixed(max + slope * (viewport.max - viewport.design), 4);
  const interceptRem = fixed(min - slope * viewport.min, 4);
  const vw = fixed(slope * 100, 4);

  const clamp =
    min > maxScreen
      ? `clamp(${maxScreen}rem, ${interceptRem}rem + ${vw}vw, ${min}rem);`
      : `clamp(${min}rem, ${interceptRem}rem + ${vw}vw, ${maxScreen}rem);`;

  return {
    maxScreen,
    interceptRem,
    vw,
    clamp,
    accessible: maxScreen <= 2.5 * min,
    shrinks: interceptRem <= 0,
  };
}

export function computeTokens(config: LumosConfig): FluidToken[] {
  const { viewport } = config;
  const tokens: FluidToken[] = [
    {
      group: "general",
      label: "Site Margin",
      name: SITE_MARGIN_VAR,
      min: config.siteMargin.min,
      max: config.siteMargin.max,
      isBase: false,
      ...fluid(config.siteMargin.min, config.siteMargin.max, viewport),
    },
  ];

  for (const def of GROUP_DEFS) {
    const g = config.groups[def.id];
    def.vars.forEach((v, index) => {
      const isBase = index === g.baseIndex;
      const dataIndex = g.baseIndex - index;
      // Fluid Builder writes scaled values back into its inputs with toFixed(2)
      const max = isBase ? g.baseMax : fixed(g.baseMax * g.ratioMax ** dataIndex, 2);
      const min = isBase ? g.baseMin : fixed(g.baseMin * g.ratioMin ** dataIndex, 2);
      tokens.push({
        group: def.id,
        label: v.label,
        name: v.name,
        min,
        max,
        isBase,
        ...fluid(min, max, viewport),
      });
    });
  }

  return tokens;
}

/** Size in rem at a given screen width in px — what the clamp() resolves to. */
export function sizeAt(token: FluidToken, screenPx: number): number {
  const preferred = token.interceptRem + (token.vw * screenPx) / 100 / ROOT_PX;
  const lo = Math.min(token.min, token.maxScreen);
  const hi = Math.max(token.min, token.maxScreen);
  return Math.min(hi, Math.max(lo, preferred));
}

// ─── Output ───────────────────────────────────────────────────────────────────

const FLUID_BUILDER = "https://fluidbuilder.webflow.io/";

export function toFluidBuilderUrl(config: LumosConfig, tokens: FluidToken[]): string {
  const { viewport, siteMargin } = config;
  let url = `${FLUID_BUILDER}?design=${viewport.design}&max=${viewport.max}&min=${viewport.min}&f`;
  url += `&g=${SITE_MARGIN_VAR},${siteMargin.max},${siteMargin.min}`;
  for (const def of GROUP_DEFS) {
    const g = config.groups[def.id];
    const items = tokens
      .filter((t) => t.group === def.id)
      .map((t) => `${t.name},${t.max},${t.min}${t.isBase ? ",t" : ""}`);
    url += `&g=:${g.ratioMax},${g.ratioMin}:${items.join("_")}`;
  }
  return url;
}

export function toRootCSS(tokens: FluidToken[]): string {
  const lines = tokens.map((t) => `\n\t${t.name}: ${t.clamp}`).join("");
  return `:root {${lines}\n}`;
}

/** Identical to Fluid Builder's "Copy Code" output — paste into Webflow site settings. */
export function toWebflowEmbed(config: LumosConfig, tokens: FluidToken[]): string {
  return `<style>\n/* ${toFluidBuilderUrl(config, tokens)} */\n\n${toRootCSS(tokens)}\n</style>`;
}

// ─── Import ───────────────────────────────────────────────────────────────────

/**
 * Reads a Fluid Builder share URL (or just its query string) back into a config.
 * Only Lumos variables are picked up; anything else is ignored.
 */
export function parseFluidBuilderUrl(input: string): LumosConfig | null {
  const query = input.includes("?") ? input.slice(input.indexOf("?")) : input;
  const params = new URLSearchParams(query);
  if (!params.has("g")) return null;

  const config: LumosConfig = structuredClone(LUMOS_DEFAULTS);
  const num = (v: string | null, fallback: number) => {
    const n = parseFloat(v ?? "");
    return Number.isFinite(n) ? n : fallback;
  };
  config.viewport = {
    min: num(params.get("min"), config.viewport.min),
    design: num(params.get("design"), config.viewport.design),
    max: num(params.get("max"), config.viewport.max),
  };

  for (let value of params.getAll("g")) {
    let ratios: [number, number] | null = null;
    if (value.startsWith(":")) {
      const end = value.lastIndexOf(":");
      const [rMax, rMin] = value.slice(1, end).split(",").map(Number);
      ratios = [rMax, rMin];
      value = value.slice(end + 1);
    }

    for (const item of value.split(/(?<!-)_/)) {
      const [name, max, min, flag] = item.split(",");
      if (name === SITE_MARGIN_VAR) {
        config.siteMargin = { max: num(max, 3), min: num(min, 1) };
        continue;
      }
      if (!ratios || flag !== "t") continue;
      for (const def of GROUP_DEFS) {
        const index = def.vars.findIndex((v) => v.name === name);
        if (index === -1) continue;
        config.groups[def.id] = {
          ratioMax: ratios[0],
          ratioMin: ratios[1],
          baseIndex: index,
          baseMax: num(max, 1),
          baseMin: num(min, 1),
        };
      }
    }
  }

  return config;
}
