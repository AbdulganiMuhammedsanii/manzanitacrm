import type { Metadata } from "next";
import { SettingsDangerZone } from "@/components/settings/settings-danger-zone";
import { SettingsProfileCard } from "@/components/settings/settings-profile-card";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsToggle } from "@/components/settings/settings-toggle";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
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

      <SettingsProfileCard />

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

      <SettingsSection
        title="Integrations"
        description="Connected services and API access."
      >
        <SettingsRow
          icon="mail"
          label="Email provider"
          description="Linked to campaigns and sequence sends."
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Connected
            </span>
          }
        />
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
