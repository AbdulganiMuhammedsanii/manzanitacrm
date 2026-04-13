"use client";

import { MergeTagHighlightedPreview } from "@/components/campaigns/merge-tag-highlight";
import { MaterialIcon } from "@/components/crm/material-icon";

const TOOLBAR_ACTIONS = [
  "format_bold",
  "format_italic",
  "format_list_bulleted",
  "link",
  "image",
] as const;

type CampaignMessageEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CampaignMessageEditor({ value, onChange }: CampaignMessageEditorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Message Content
      </label>
      <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container">
        <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/10 bg-surface-container-high px-4 py-2">
          {TOOLBAR_ACTIONS.map((name) => (
            <button
              key={name}
              type="button"
              className="text-on-surface-variant transition-colors hover:text-primary"
              aria-label={name.replace(/_/g, " ")}
            >
              <MaterialIcon name={name} className="text-sm" />
            </button>
          ))}
          <div className="mx-1 hidden h-4 w-px bg-outline-variant/20 sm:block" />
          <button
            type="button"
            className="text-on-surface-variant transition-colors hover:text-primary"
            aria-label="Code"
          >
            <MaterialIcon name="code" className="text-sm" />
          </button>
          <button
            type="button"
            className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant transition-colors hover:text-primary"
          >
            <MaterialIcon name="bolt" className="text-xs" />
            AI Assist
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="w-full resize-none border-none bg-transparent p-6 font-body text-sm leading-relaxed text-on-surface focus:outline-none focus:ring-0"
          aria-label="Message body"
        />
        <div className="border-t border-outline-variant/10 px-4 pb-4 pt-2">
          <MergeTagHighlightedPreview text={value} label="Merge tags (live)" />
        </div>
      </div>
    </div>
  );
}
