"use client";

import { CampaignMessageEditor } from "@/components/campaigns/campaign-message-editor";
import { MergeTagHighlightedPreview } from "@/components/campaigns/merge-tag-highlight";
import { MERGE_TAG_REFERENCE } from "@/lib/merge-tags";

export type SequenceStepDraft = {
  stepIndex: number;
  subject: string;
  body: string;
};

type CampaignSequenceEditorProps = {
  activeStep: number;
  steps: SequenceStepDraft[];
  onSelectStep: (step: number) => void;
  onChangeSubject: (step: number, value: string) => void;
  onChangeBody: (step: number, value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
};

export function CampaignSequenceEditor({
  activeStep,
  steps,
  onSelectStep,
  onChangeSubject,
  onChangeBody,
  name,
  onNameChange,
}: CampaignSequenceEditorProps) {
  const current = steps.find((s) => s.stepIndex === activeStep) ?? steps[0];

  return (
    <section className="custom-scrollbar min-h-0 flex-1 overflow-y-auto border-outline-variant/5 p-6 sm:p-8 lg:border-r">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="group">
          <label
            htmlFor="campaign-name"
            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors group-focus-within:text-primary"
          >
            Campaign Name
          </label>
          <input
            id="campaign-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            type="text"
            placeholder="Sequence name…"
            className="w-full border-0 border-b-2 border-transparent bg-surface-container-highest/50 px-0 py-3 text-lg font-medium text-on-surface placeholder:text-slate-700 focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Sequence (5 emails)
          </p>
          <div className="flex flex-wrap gap-2">
            {steps.map((s) => {
              const on = s.stepIndex === activeStep;
              return (
                <button
                  key={s.stepIndex}
                  type="button"
                  onClick={() => onSelectStep(s.stepIndex)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                    on
                      ? "bg-primary text-on-primary shadow-lg shadow-emerald-900/20"
                      : "border border-outline-variant/20 bg-surface-container-high/80 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                  }`}
                >
                  Email {s.stepIndex}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-on-surface-variant">
              Use <code className="text-primary-fixed-dim">{"{{name}}"}</code> — green highlight means it maps to a{" "}
              <code className="text-on-surface-variant/90">leads</code> column below.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MERGE_TAG_REFERENCE.map((t) => (
                <span
                  key={t.example}
                  title={t.leadsRef}
                  className="inline-flex max-w-full items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300/95"
                >
                  {t.example}
                  <span className="truncate text-[9px] font-sans font-normal text-on-surface-variant">
                    → {t.leadsRef}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {current ? (
          <>
            <div className="group">
              <label
                htmlFor="campaign-subject"
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors group-focus-within:text-primary"
              >
                Subject — email {current.stepIndex}
              </label>
              <input
                id="campaign-subject"
                value={current.subject}
                onChange={(e) => onChangeSubject(current.stepIndex, e.target.value)}
                type="text"
                placeholder="Subject line…"
                className="w-full border-0 border-b-2 border-transparent bg-surface-container-highest/50 px-0 py-3 text-base text-on-surface placeholder:text-slate-700 focus:border-primary focus:outline-none focus:ring-0"
              />
              <MergeTagHighlightedPreview
                text={current.subject}
                label="Subject — tag check"
                dense
                className="mt-3"
              />
            </div>
            <CampaignMessageEditor
              value={current.body}
              onChange={(v) => onChangeBody(current.stepIndex, v)}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
