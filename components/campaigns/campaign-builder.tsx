"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CampaignAudiencePanel,
  type CampaignQueueStats,
} from "@/components/campaigns/campaign-audience-panel";
import { CampaignBuilderFooter } from "@/components/campaigns/campaign-builder-footer";
import { CampaignBuilderHeader } from "@/components/campaigns/campaign-builder-header";
import {
  CampaignSchedulePanel,
  type ScheduleDraft,
} from "@/components/campaigns/campaign-schedule-panel";
import {
  CampaignSequenceEditor,
  type SequenceStepDraft,
} from "@/components/campaigns/campaign-sequence-editor";
import { CampaignPreviewPhone } from "@/components/campaigns/campaign-preview-phone";
import type { CampaignPageData } from "@/lib/campaign-data";
import type { LeadRow } from "@/lib/database.types";
import { applyMergeTags } from "@/lib/merge-tags";
import { dispatchCampaignBatch, saveCampaignSequence } from "@/app/(app)/campaigns/actions";

const PREVIEW_LEAD: LeadRow = {
  id: "00000000-0000-0000-0000-000000000000",
  first_name: "John",
  last_name: "Doe",
  email: "j.doe@techcorp.com",
  phone: "(555) 555-0100",
  company: "TechCorp",
  city: "Los Angeles",
  county: "Los Angeles",
  state: "CA",
  license_number: "DEMO-001",
  email_status: "delivered",
  is_emailed: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function normalizeSteps(rows: CampaignPageData["steps"]): SequenceStepDraft[] {
  const byIndex = new Map(rows.map((r) => [r.step_index, r]));
  return [1, 2, 3, 4, 5].map((stepIndex) => {
    const row = byIndex.get(stepIndex);
    return {
      stepIndex,
      subject: row?.subject ?? "",
      body: row?.body ?? "",
    };
  });
}

function previewFromMergedBody(merged: string) {
  const paragraphs = merged
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const snippet = paragraphs.find((p) => p.length > 24) ?? paragraphs[0] ?? merged.slice(0, 140);
  const closing = paragraphs.length > 1 ? (paragraphs[paragraphs.length - 1] ?? snippet) : snippet;
  return { snippet, closing };
}

type CampaignBuilderProps = {
  initial: CampaignPageData;
};

export function CampaignBuilder({ initial }: CampaignBuilderProps) {
  const router = useRouter();
  const [savePending, startSave] = useTransition();
  const [dispatchPending, startDispatch] = useTransition();

  const [name, setName] = useState(initial.config.name);
  const [activeStep, setActiveStep] = useState(1);
  const [steps, setSteps] = useState<SequenceStepDraft[]>(() => normalizeSteps(initial.steps));
  const [schedule, setSchedule] = useState<ScheduleDraft>({
    isActive: initial.config.is_active,
    maxSendsPerDay: initial.config.max_sends_per_day,
    daysBetweenSteps: initial.config.days_between_steps,
    timezone: initial.config.timezone,
    sendWindowStartHour: initial.config.send_window_start_hour,
    sendWindowEndHour: initial.config.send_window_end_hour,
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(initial.config.updated_at);
  const [queueStats, setQueueStats] = useState<CampaignQueueStats>({
    pendingNeverEmailed: initial.pendingNeverEmailed,
    inSequence: initial.inSequence,
    sentToday: initial.sentToday,
    maxPerDay: initial.config.max_sends_per_day,
  });
  const [banner, setBanner] = useState<string | null>(null);

  const current = steps.find((s) => s.stepIndex === activeStep) ?? steps[0];

  const { mergedSubject, snippet, closing } = useMemo(() => {
    if (!current) {
      return { mergedSubject: "", snippet: "", closing: "" };
    }
    const mergedSubject = applyMergeTags(current.subject, PREVIEW_LEAD);
    const mergedBody = applyMergeTags(current.body, PREVIEW_LEAD);
    const { snippet: sn, closing: cl } = previewFromMergedBody(mergedBody);
    return { mergedSubject, snippet: sn, closing: cl };
  }, [current]);

  function updateStepSubject(stepIndex: number, value: string) {
    setSteps((prev) => prev.map((s) => (s.stepIndex === stepIndex ? { ...s, subject: value } : s)));
  }

  function updateStepBody(stepIndex: number, value: string) {
    setSteps((prev) => prev.map((s) => (s.stepIndex === stepIndex ? { ...s, body: value } : s)));
  }

  function handleSave() {
    setBanner(null);
    startSave(async () => {
      const result = await saveCampaignSequence(name, {
        is_active: schedule.isActive,
        max_sends_per_day: schedule.maxSendsPerDay,
        days_between_steps: schedule.daysBetweenSteps,
        timezone: schedule.timezone,
        send_window_start_hour: schedule.sendWindowStartHour,
        send_window_end_hour: schedule.sendWindowEndHour,
      }, steps);

      if (!result.ok) {
        setBanner(result.error);
        return;
      }
      setLastUpdated(result.updatedAt);
      setQueueStats((q) => ({ ...q, maxPerDay: schedule.maxSendsPerDay }));
      router.refresh();
    });
  }

  function handleDispatch() {
    setBanner(null);
    startDispatch(async () => {
      const { result, snapshot } = await dispatchCampaignBatch();
      if (snapshot) {
        setQueueStats({
          pendingNeverEmailed: snapshot.pendingNeverEmailed,
          inSequence: snapshot.inSequence,
          sentToday: snapshot.sentToday,
          maxPerDay: snapshot.config.max_sends_per_day,
        });
      }
      const parts: string[] = [];
      if (result.message) parts.push(result.message);
      if (result.sent > 0) parts.push(`Sent ${result.sent} (attempted ${result.attempted}).`);
      else if (!result.message) parts.push("No messages sent.");
      setBanner(parts.filter(Boolean).join(" "));
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CampaignBuilderHeader lastUpdated={lastUpdated} campaignActive={schedule.isActive} />
      {banner ? (
        <div className="border-b border-outline-variant/10 bg-surface-container-high/80 px-6 py-3 text-sm text-on-surface sm:px-8">
          {banner}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <CampaignSequenceEditor
          name={name}
          onNameChange={setName}
          activeStep={activeStep}
          onSelectStep={setActiveStep}
          steps={steps}
          onChangeSubject={updateStepSubject}
          onChangeBody={updateStepBody}
        />
        <section className="custom-scrollbar w-full space-y-8 overflow-y-auto border-t border-outline-variant/5 bg-surface-container-low/30 p-6 sm:p-8 lg:w-[480px] lg:shrink-0 lg:border-l lg:border-t-0">
          <CampaignSchedulePanel value={schedule} onChange={setSchedule} />
          <CampaignAudiencePanel
            stats={{
              ...queueStats,
              maxPerDay: schedule.maxSendsPerDay,
            }}
          />
          <CampaignPreviewPhone subjectLine={mergedSubject} previewSnippet={snippet} closingLine={closing} />
        </section>
      </div>
      <CampaignBuilderFooter
        saving={savePending}
        dispatching={dispatchPending}
        onSave={handleSave}
        onDispatchNow={handleDispatch}
      />
    </div>
  );
}
