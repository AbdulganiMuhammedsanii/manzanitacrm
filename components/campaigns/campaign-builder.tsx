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
import { CampaignTestEmailDialog } from "@/components/campaigns/campaign-test-email-dialog";
import type { CampaignPageData } from "@/lib/campaign-data";
import { SAMPLE_MERGE_LEAD } from "@/lib/campaign-sample-lead";
import { applyMergeTags } from "@/lib/merge-tags";
import {
  dispatchCampaignBatch,
  getTrackedPdfUrlForTestEmail,
  saveCampaignSequence,
  sendTestCampaignEmail,
} from "@/app/(app)/campaigns/actions";

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

type CampaignBuilderProps = {
  initial: CampaignPageData;
};

export function CampaignBuilder({ initial }: CampaignBuilderProps) {
  const router = useRouter();
  const [savePending, startSave] = useTransition();
  const [dispatchPending, startDispatch] = useTransition();
  const [testPending, startTest] = useTransition();

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
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testNotice, setTestNotice] = useState<string | null>(null);
  const [copyTrackedPending, startCopyTracked] = useTransition();

  const current = steps.find((s) => s.stepIndex === activeStep) ?? steps[0];

  const { mergedSubject, mergedBody } = useMemo(() => {
    if (!current) {
      return { mergedSubject: "", mergedBody: "" };
    }
    return {
      mergedSubject: applyMergeTags(current.subject, SAMPLE_MERGE_LEAD),
      mergedBody: applyMergeTags(current.body, SAMPLE_MERGE_LEAD),
    };
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

  function handleSendTest() {
    const cur = steps.find((s) => s.stepIndex === activeStep) ?? steps[0];
    if (!cur) return;
    setTestNotice(null);
    startTest(async () => {
      const r = await sendTestCampaignEmail({
        toEmail: testTo,
        subject: cur.subject,
        body: cur.body,
      });
      if (r.ok) {
        setTestNotice("Sent. Check the inbox (subject starts with [Test]).");
      } else {
        setTestNotice(r.error);
      }
    });
  }

  function handleCopyTrackedLink() {
    setTestNotice(null);
    startCopyTracked(async () => {
      const r = await getTrackedPdfUrlForTestEmail(testTo);
      if (!r.ok) {
        setTestNotice(r.error);
        return;
      }
      try {
        await navigator.clipboard.writeText(r.url);
        setTestNotice("Copied tracked URL — paste into a browser to test open logging + PDF.");
      } catch {
        setTestNotice(`Copy failed — open this URL manually:\n${r.url}`);
      }
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
          <CampaignPreviewPhone subjectLine={mergedSubject} bodyText={mergedBody} />
        </section>
      </div>
      <CampaignBuilderFooter
        saving={savePending}
        dispatching={dispatchPending}
        onSave={handleSave}
        onDispatchNow={handleDispatch}
        onOpenTestEmail={() => {
          setTestNotice(null);
          setTestDialogOpen(true);
        }}
      />
      <CampaignTestEmailDialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        toEmail={testTo}
        onToEmailChange={setTestTo}
        onSend={handleSendTest}
        onCopyTrackedLink={
          initial.trackedAssetConfigured ? handleCopyTrackedLink : undefined
        }
        copyTrackedPending={copyTrackedPending}
        trackedAssetConfigured={initial.trackedAssetConfigured}
        pending={testPending}
        notice={testNotice}
        activeStepLabel={`Email ${activeStep}`}
      />
    </div>
  );
}
