import { MaterialIcon } from "@/components/crm/material-icon";

export function SettingsDangerZone() {
  return (
    <section className="rounded-xl border border-error/10 bg-surface-container">
      <div className="border-b border-error/10 px-6 py-5">
        <h2 className="flex items-center gap-2 font-headline text-base font-bold text-error">
          <MaterialIcon name="warning" className="text-[18px]" />
          Danger zone
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Irreversible actions — proceed with caution.
        </p>
      </div>
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-on-surface">Delete workspace</p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Permanently remove all leads, campaigns, and analytics data.
          </p>
        </div>
        <button
          type="button"
          className="self-start rounded-lg border border-error/20 bg-error/5 px-5 py-2 text-xs font-bold text-error transition-all hover:bg-error/10"
        >
          Delete workspace
        </button>
      </div>
    </section>
  );
}
