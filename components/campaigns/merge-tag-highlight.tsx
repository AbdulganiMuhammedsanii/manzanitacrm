"use client";

import { parseMergeSegments, type MergeSegment } from "@/lib/merge-tags";

function SegmentSpan({ segment }: { segment: MergeSegment }) {
  if (segment.kind === "text") {
    return <span className="text-on-surface-variant/90">{segment.text}</span>;
  }

  const title = segment.valid
    ? `Maps to ${segment.leadsRef}`
    : "Unknown tag — not linked to the leads table (fix spelling or use a supported name)";

  return (
    <span
      title={title}
      className={
        segment.valid
          ? "rounded px-0.5 font-medium text-emerald-400 underline decoration-emerald-500/50 decoration-dotted underline-offset-2"
          : "rounded px-0.5 font-medium text-amber-300/95 underline decoration-amber-500/50 decoration-dotted underline-offset-2"
      }
    >
      {segment.raw}
    </span>
  );
}

type MergeTagHighlightedPreviewProps = {
  text: string;
  /** Screen-reader label */
  label: string;
  className?: string;
  dense?: boolean;
};

/** Read-only view of the same string with merge tags color-coded (green = known column). */
export function MergeTagHighlightedPreview({
  text,
  label,
  className = "",
  dense = false,
}: MergeTagHighlightedPreviewProps) {
  const segments = parseMergeSegments(text);
  const hasTags = segments.some((s) => s.kind === "tag");

  if (!text.trim()) {
    return null;
  }

  return (
    <div className={className}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <div
        className={`rounded-lg border border-outline-variant/10 bg-surface-container-low/80 ${
          dense ? "px-2 py-1.5 text-xs leading-snug" : "p-3 text-sm leading-relaxed"
        } font-mono`}
        aria-label={`${label}: merge tags highlighted`}
      >
        <div className={dense ? "break-words leading-snug" : "whitespace-pre-wrap break-words"}>
          {segments.map((s, i) => (
            <SegmentSpan key={i} segment={s} />
          ))}
        </div>
        {hasTags ? (
          <p className="mt-2 text-[10px] text-on-surface-variant">
            <span className="text-emerald-400">Green</span> = matches a{" "}
            <code className="text-on-surface-variant/80">leads</code> field.{" "}
            <span className="text-amber-300">Amber</span> = not recognized.
          </p>
        ) : null}
      </div>
    </div>
  );
}
