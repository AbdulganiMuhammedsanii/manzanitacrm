type CampaignPreviewPhoneProps = {
  /** Merged subject (e.g. tags already resolved for preview) */
  subjectLine: string;
  /** Full merged message body — shown in full with line breaks preserved */
  bodyText: string;
};

export function CampaignPreviewPhone({ subjectLine, bodyText }: CampaignPreviewPhoneProps) {
  const subject =
    subjectLine
      .replace(/\{\{\s*company_name\s*\}\}/gi, "TechCorp")
      .trim() || "Exclusive Security Assessment for TechCorp";

  const body =
    bodyText.trim() ||
    "Your message will appear here. Use merge tags like {{first_name}} in the editor.";

  return (
    <div>
      <h3 className="mb-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Live Preview
      </h3>
      <div className="relative mx-auto h-[520px] w-[280px] overflow-hidden rounded-[40px] border-[6px] border-slate-900 bg-slate-950 shadow-2xl ring-1 ring-white/5">
        <div className="absolute left-1/2 top-0 z-10 flex h-6 w-24 -translate-x-1/2 items-center justify-center rounded-b-2xl bg-slate-900">
          <div className="h-1 w-8 rounded-full bg-slate-800" />
        </div>
        <div className="custom-scrollbar h-full overflow-y-auto bg-white px-4 pb-6 pt-10 text-slate-900">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              SC
            </div>
            <div>
              <p className="text-[10px] font-bold">SecuriCorp Admin</p>
              <p className="text-[8px] text-slate-400">
                To: John Doe &lt;j.doe@techcorp.com&gt;
              </p>
            </div>
          </div>
          <h4 className="mb-3 break-words text-xs font-bold leading-tight">{subject}</h4>
          <div className="whitespace-pre-wrap break-words text-[10px] leading-relaxed text-slate-600">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}
