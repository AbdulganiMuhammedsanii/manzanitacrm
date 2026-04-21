import type { Metadata } from "next";
import { GmailIntegrationCard } from "@/components/settings/gmail-integration-card";
import { SettingsDangerZone } from "@/components/settings/settings-danger-zone";
import { SettingsProfileCard } from "@/components/settings/settings-profile-card";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { DEFAULT_CAMPAIGN_ID } from "@/lib/campaign-constants";
import { getGmailOAuthRedirectUri } from "@/lib/app-url";
import { getGmailIntegration, isGmailReady } from "@/lib/gmail-integration";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const gmailStatus = typeof sp.gmail === "string" ? sp.gmail : undefined;
  const gmailReason = typeof sp.reason === "string" ? sp.reason : undefined;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const gmailRow = user ? await getGmailIntegration(supabaseAdmin, user.id) : null;
  const gmailConnected = isGmailReady(gmailRow);

  const { data: cfg } = await supabaseAdmin
    .from("campaign_config")
    .select("sender_user_id")
    .eq("id", DEFAULT_CAMPAIGN_ID)
    .maybeSingle();

  const senderId = cfg?.sender_user_id ?? null;
  const senderRow = senderId ? await getGmailIntegration(supabaseAdmin, senderId) : null;
  const batchSenderEmail = senderRow?.google_email ?? null;
  const isCurrentUserBatchSender = Boolean(user && senderId === user.id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your profile, workspace preferences, and integrations.
        </p>
      </div>

      <SettingsProfileCard email={user?.email ?? null} />

      <SettingsSection
        title="Notifications"
        description="Control how and when you receive alerts."
      >
        <SettingsRow
          icon="mark_email_read"
          label="Email digest"
          description="Receive a daily summary of pipeline changes."
          action={<SettingsToggle defaultChecked label="Email digest" />}
        />
        <SettingsRow
          icon="notifications_active"
          label="Push notifications"
          description="Browser notifications for high-intent lead events."
          action={<SettingsToggle defaultChecked={false} label="Push notifications" />}
        />
        <SettingsRow
          icon="campaign"
          label="Campaign alerts"
          description="Get notified when a campaign finishes sending."
          action={<SettingsToggle defaultChecked label="Campaign alerts" />}
        />
      </SettingsSection>

      <SettingsSection
        title="Workspace"
        description="Configure defaults for your CRM workspace."
      >
        <SettingsRow
          icon="schedule"
          label="Timezone"
          description="Used for scheduled sends and activity timestamps."
          action={
            <select className="rounded-lg border-none bg-surface-container-highest/50 px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30">
              <option>America / Los Angeles (PT)</option>
              <option>America / Denver (MT)</option>
              <option>America / Chicago (CT)</option>
              <option>America / New York (ET)</option>
            </select>
          }
        />
        <SettingsRow
          icon="language"
          label="Language"
          description="Interface language across the CRM."
          action={
            <select className="rounded-lg border-none bg-surface-container-highest/50 px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30">
              <option>English (US)</option>
              <option>Spanish</option>
            </select>
          }
        />
        <SettingsRow
          icon="palette"
          label="Theme"
          description="Switch between dark and light mode."
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest/50 px-3 py-1 text-xs font-medium text-on-surface-variant">
              Dark
            </span>
          }
        />
      </SettingsSection>

      <SettingsSection title="Integrations" description="Connected services and API access.">
        <div className="px-1 pb-2">
          <GmailIntegrationCard
            connected={gmailConnected}
            email={gmailRow?.google_email ?? null}
            oauthRedirectUri={getGmailOAuthRedirectUri()}
            status={gmailStatus}
            reason={gmailReason}
            batchSenderEmail={batchSenderEmail}
            isCurrentUserBatchSender={isCurrentUserBatchSender}
          />
        </div>
        <SettingsRow
          icon="webhook"
          label="Webhook endpoints"
          description="Forward lead events to external systems."
          action={
            <button
              type="button"
              className="rounded-lg border border-outline-variant/20 px-4 py-1.5 text-xs font-bold text-on-surface-variant transition-all hover:border-primary/30 hover:text-primary"
            >
              Configure
            </button>
          }
        />
        <SettingsRow
          icon="key"
          label="API keys"
          description="Manage programmatic access to the CRM."
          action={
            <button
              type="button"
              className="rounded-lg border border-outline-variant/20 px-4 py-1.5 text-xs font-bold text-on-surface-variant transition-all hover:border-primary/30 hover:text-primary"
            >
              Manage
            </button>
          }
        />
      </SettingsSection>

      <SettingsDangerZone />
    </div>
  );
}
