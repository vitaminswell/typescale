"use client";

import { useCallback, useRef, useState } from "react";

interface FontUploadProps {
  fontName: string | null;
  onFontLoad: (name: string, dataUrl: string) => void;
  onFontClear: () => void;
}

export default function FontUpload({
  fontName,
  onFontLoad,
  onFontClear,
}: FontUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const allowed = [
        "font/ttf",
        "font/otf",
        "font/woff",
        "font/woff2",
        "application/x-font-ttf",
        "application/x-font-otf",
        "application/font-woff",
        "application/font-woff2",
      ];
      // Also allow by extension since MIME types vary per OS
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowedExts = ["ttf", "otf", "woff", "woff2"];
      if (!allowed.includes(file.type) && !allowedExts.includes(ext ?? "")) {
        setError("Unsupported format. Please upload TTF, OTF, WOFF, or WOFF2.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Derive a font-family name from the filename
        const name =
          file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
            .trim() || "Uploaded Font";
        onFontLoad(name, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onFontLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Font
      </label>

      {fontName ? (
        <div className="flex items-center justify-between rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">✦</span>
            <span className="truncate text-sm font-medium text-white">
              {fontName}
            </span>
          </div>
          <button
            onClick={onFontClear}
            className="ml-2 shrink-0 rounded px-2 py-0.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer
            ${dragging ? "border-indigo-400 bg-indigo-500/10" : "border-neutral-700 hover:border-neutral-500"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <span className="text-2xl">⬆</span>
          <p className="text-sm text-neutral-300">
            Drop a font file or{" "}
            <span className="text-indigo-400 underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-xs text-neutral-500">TTF · OTF · WOFF · WOFF2</p>
          <input
            ref={inputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
