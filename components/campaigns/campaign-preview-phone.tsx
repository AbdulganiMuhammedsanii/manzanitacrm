import Image from "next/image";

const PREVIEW_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDMVDbwJzXgCRTL_BNgmeQyX1tAYWXAZDeXXlcsCnM5iXjJiwf1QhPI3A0Q7yeW8JiPOBETmu5xDmKGA-2fh0UxQOpaD1F5j-RgykY_VIQ0LF7ek8yvkMvOS0q8PsF11L0Hd58Xo6XQnRkBH6WnJOBiHiYnde-qUsVgIpkt20u2fj105sbsAEOc2yD-u34qmLAerpfOYcbzLo1K1dVrmp3P7NXON-t8XOsTeON2s0sPinP4PUTKh6Abxh0VxtAz9PN_B27tRe_CdyAV";

type CampaignPreviewPhoneProps = {
  subjectLine: string;
  previewSnippet: string;
  closingLine: string;
};

export function CampaignPreviewPhone({
  subjectLine,
  previewSnippet,
  closingLine,
}: CampaignPreviewPhoneProps) {
  const subject =
    subjectLine
      .replace(/\{\{\s*company_name\s*\}\}/gi, "TechCorp")
      .trim() || "Exclusive Security Assessment for TechCorp";

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
          <h4 className="mb-3 text-xs font-bold leading-tight">{subject}</h4>
          <div className="space-y-3 text-[10px] leading-relaxed text-slate-600">
            <p>Hello John,</p>
            <p>{previewSnippet}</p>
            <div className="relative h-24 w-full overflow-hidden rounded-lg">
              <Image
                src={PREVIEW_IMG}
                alt=""
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
            <p>{closingLine}</p>
            <div className="rounded-md bg-emerald-600 py-2 text-center text-[9px] font-bold text-white">
              View My Assessment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
