import Image from "next/image";
import type { CountyBar } from "@/lib/leads-queries";

const MAP_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMKZukaEdYTCnV1P_OY3W29gd3ZFbkU1rMPYrhgHUyFChQ_ED-3rnyMx3acDqTy_968zLwgIKqF7ydKzGSXpJu7-Z_yPO7uGzHHRPSg4bSjKNflkftPHZM6vgGB5BkzDWQ4B5u-gUpRJVoTOr3U_IgQfxHJl-R8wFzLww4WQ19wCYNWzCAEmAVoHVh0VgfC1Oc4i0O7KmZIkz_KiQlo8BEZekN4KSsV0awV1tHVMb-VYmezzU-0uvuFKLTTB3qG4K4rGZ-IlmgVl35";

const DOTS = [
  "bg-primary shadow-[0_0_8px_#4edea3]",
  "bg-primary/60",
  "bg-primary/40",
  "bg-primary/20",
] as const;

type Props = {
  counties: CountyBar[];
  totalLeads: number;
};

export function GeographicDistribution({ counties, totalLeads }: Props) {
  const empty = counties.length === 0;

  return (
    <div className="rounded-xl border-t border-slate-800/50 bg-surface-container-low p-6 sm:p-8">
      <h3 className="mb-2 font-headline text-lg font-bold text-white">Geographic distribution</h3>
      <p className="mb-6 text-xs text-on-surface-variant">
        Top counties by lead volume
        {totalLeads > 0 ? ` (${totalLeads.toLocaleString()} total)` : ""}.
      </p>
      <div className="space-y-6">
        <div className="group relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-slate-900">
          <Image
            src={MAP_SRC}
            alt=""
            fill
            className="object-cover opacity-30 grayscale transition-all duration-700 group-hover:grayscale-0"
            sizes="(min-width: 1024px) 320px, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
          <div className="absolute bottom-1/4 right-1/4 h-3 w-3 animate-pulse rounded-full bg-primary shadow-[0_0_15px_#4edea3]" />
          <div className="absolute left-1/3 top-1/3 h-2 w-2 rounded-full bg-primary/60" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary/40" />
        </div>
        {empty ? (
          <p className="text-sm text-on-surface-variant">
            No county data yet — import leads or check your Supabase connection.
          </p>
        ) : (
          <div className="space-y-4">
            {counties.map((r, i) => {
              const share =
                totalLeads > 0 ? Math.round((r.count / totalLeads) * 1000) / 10 : 0;
              const dot = DOTS[i % DOTS.length]!;
              return (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <span className="truncate text-xs font-medium text-on-surface" title={r.label}>
                      {r.shortLabel}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-white">
                    {share.toFixed(share % 1 === 0 ? 0 : 1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
