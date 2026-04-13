"use client";

const TZ_PRESETS = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "UTC",
  "Europe/London",
] as const;

export type ScheduleDraft = {
  isActive: boolean;
  maxSendsPerDay: number;
  daysBetweenSteps: number;
  timezone: string;
  sendWindowStartHour: number;
  sendWindowEndHour: number;
};

type CampaignSchedulePanelProps = {
  value: ScheduleDraft;
  onChange: (next: ScheduleDraft) => void;
};

export function CampaignSchedulePanel({ value, onChange }: CampaignSchedulePanelProps) {
  function patch(p: Partial<ScheduleDraft>) {
    onChange({ ...value, ...p });
  }

  return (
    <div className="space-y-4 rounded-xl border border-outline-variant/10 bg-surface-container/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Automation</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Sends only inside the daily window. When active, scheduled{" "}
            <code className="text-primary-fixed-dim">POST /api/campaign/dispatch</code> runs can send.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value.isActive}
          aria-label="Campaign active"
          onClick={() => patch({ isActive: !value.isActive })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            value.isActive ? "bg-primary" : "bg-surface-container-highest"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              value.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Max sends / day
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={value.maxSendsPerDay}
            onChange={(e) => patch({ maxSendsPerDay: parseInt(e.target.value, 10) || 1 })}
            className="w-full rounded-lg border border-outline-variant/15 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Days between steps
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={value.daysBetweenSteps}
            onChange={(e) => patch({ daysBetweenSteps: parseInt(e.target.value, 10) || 1 })}
            className="w-full rounded-lg border border-outline-variant/15 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Timezone (for “today” and send window)
        </label>
        <select
          value={value.timezone}
          onChange={(e) => patch({ timezone: e.target.value })}
          className="w-full rounded-lg border border-outline-variant/15 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
        >
          {TZ_PRESETS.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Window start (hour)
          </label>
          <select
            value={value.sendWindowStartHour}
            onChange={(e) => patch({ sendWindowStartHour: parseInt(e.target.value, 10) })}
            className="w-full rounded-lg border border-outline-variant/15 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Window end (hour)
          </label>
          <select
            value={value.sendWindowEndHour}
            onChange={(e) => patch({ sendWindowEndHour: parseInt(e.target.value, 10) })}
            className="w-full rounded-lg border border-outline-variant/15 bg-surface-container-high px-3 py-2 text-sm text-on-surface"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
