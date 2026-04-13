"use client";

import { CampaignMessageEditor } from "@/components/campaigns/campaign-message-editor";

type CampaignEditorPaneProps = {
  name: string;
  subject: string;
  body: string;
  onNameChange: (v: string) => void;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
};

export function CampaignEditorPane({
  name,
  subject,
  body,
  onNameChange,
  onSubjectChange,
  onBodyChange,
}: CampaignEditorPaneProps) {
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
            placeholder="Enter campaign name..."
            className="w-full border-0 border-b-2 border-transparent bg-surface-container-highest/50 px-0 py-3 text-lg font-medium text-on-surface placeholder:text-slate-700 focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>
        <div className="group">
          <label
            htmlFor="campaign-subject"
            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors group-focus-within:text-primary"
          >
            Subject Line
          </label>
          <input
            id="campaign-subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            type="text"
            placeholder="Email subject..."
            className="w-full border-0 border-b-2 border-transparent bg-surface-container-highest/50 px-0 py-3 text-base text-on-surface placeholder:text-slate-700 focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>
        <CampaignMessageEditor value={body} onChange={onBodyChange} />
      </div>
    </section>
  );
}
