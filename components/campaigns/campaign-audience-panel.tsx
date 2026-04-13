"use client";

import { MaterialIcon } from "@/components/crm/material-icon";

export type CampaignQueueStats = {
  pendingNeverEmailed: number;
  inSequence: number;
  sentToday: number;
  maxPerDay: number;
};

type CampaignAudiencePanelProps = {
  stats: CampaignQueueStats;
};

export function CampaignAudiencePanel({ stats }: CampaignAudiencePanelProps) {
  return (
    <div>
      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Queue</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <MaterialIcon name="mark_email_unread" className="text-lg text-emerald-500" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface">Never emailed</p>
              <p className="truncate text-[10px] text-on-surface-variant">
                Valid email, eligible for email 1 in the sequence
              </p>
            </div>
          </div>
          <span className="font-headline text-lg font-black text-on-surface">{stats.pendingNeverEmailed}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <MaterialIcon name="timeline" className="text-lg text-emerald-500" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface">In sequence</p>
              <p className="truncate text-[10px] text-on-surface-variant">
                Waiting on cooldown or next step (emails 2–5)
              </p>
            </div>
          </div>
          <span className="font-headline text-lg font-black text-on-surface">{stats.inSequence}</span>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-fixed-dim">Sent today</span>
          <span className="font-headline text-lg font-black text-primary">
            {stats.sentToday}
            <span className="text-sm font-bold text-on-surface-variant"> / {stats.maxPerDay}</span>
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{
              width: `${Math.min(100, stats.maxPerDay ? (stats.sentToday / stats.maxPerDay) * 100 : 0)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
