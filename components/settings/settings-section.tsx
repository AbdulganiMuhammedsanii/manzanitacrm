import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container">
      <div className="border-b border-outline-variant/10 px-6 py-5">
        <h2 className="font-headline text-base font-bold text-on-surface">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      <div className="divide-y divide-outline-variant/5">{children}</div>
    </section>
  );
}
