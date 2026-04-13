import { MaterialIcon } from "@/components/crm/material-icon";

export function CampaignSetupRequired() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-high">
        <MaterialIcon name="database" className="text-2xl text-on-surface-variant" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="font-headline text-lg font-bold text-on-surface">Campaign tables not found</h2>
        <p className="text-sm text-on-surface-variant">
          Apply the Supabase migration that creates <code className="text-primary-fixed-dim">campaign_config</code>,{" "}
          <code className="text-primary-fixed-dim">campaign_steps</code>, and related tables, then reload. Ensure{" "}
          <code className="text-primary-fixed-dim">SUPABASE_SERVICE_ROLE_KEY</code> is set for server-side saves and
          dispatch.
        </p>
      </div>
    </div>
  );
}
