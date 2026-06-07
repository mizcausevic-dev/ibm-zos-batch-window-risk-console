import { readFile } from "node:fs/promises";

export type BatchTier = "STABLE" | "WATCH" | "COMPRESS" | "ESCALATE";

export interface BatchLane {
  name: string;
  owner: string;
  businessSystem: string;
  criticalWindow: string;
  batchCompletionConfidence: number;
  jclDependencyClarity: number;
  restartReadiness: number;
  downstreamSlaCoverage: number;
  reconciliationEvidence: number;
  lateJobCount: number;
  manualRestartSteps: number;
  downstreamExposureUsd: number;
  businessCriticality: number;
  nextAction: string;
}

export interface BatchInput {
  organization: string;
  generatedAt: string;
  lanes: BatchLane[];
}

export interface ScoredBatchLane extends BatchLane {
  batchRiskScore: number;
  tier: BatchTier;
  routingNote: string;
}

export interface BatchConsole {
  organization: string;
  generatedAt: string;
  primaryRecommendation: string;
  lanes: ScoredBatchLane[];
}

export function classifyTier(batchRiskScore: number): BatchTier {
  if (batchRiskScore < 58) return "ESCALATE";
  if (batchRiskScore < 72) return "COMPRESS";
  if (batchRiskScore < 85) return "WATCH";
  return "STABLE";
}

export function scoreLane(lane: BatchLane): ScoredBatchLane {
  const positive =
    lane.batchCompletionConfidence * 0.24 +
    lane.jclDependencyClarity * 0.18 +
    lane.restartReadiness * 0.2 +
    lane.downstreamSlaCoverage * 0.2 +
    lane.reconciliationEvidence * 0.18;
  const penalty = lane.lateJobCount * 1.8 + lane.manualRestartSteps * 1.1 + lane.businessCriticality * 0.08;
  const batchRiskScore = Math.max(0, Math.min(100, Math.round(positive - penalty)));
  const tier = classifyTier(batchRiskScore);
  const routingNote =
    tier === "ESCALATE"
      ? `${lane.name} needs immediate batch-window risk routing before downstream settlement or reporting exposure lands.`
      : tier === "COMPRESS"
        ? `${lane.name} should be compressed into a restart-readiness packet with dependency and SLA evidence.`
        : tier === "WATCH"
          ? `${lane.name} is operable, but late jobs and reconciliation proof should be reviewed before the next release window.`
          : `${lane.name} is stable enough for standard batch-window monitoring.`;
  return { ...lane, batchRiskScore, tier, routingNote };
}

export function buildConsole(input: BatchInput): BatchConsole {
  const lanes = input.lanes.map(scoreLane).sort((a, b) => a.batchRiskScore - b.batchRiskScore);
  const weakest = lanes[0];
  return {
    organization: input.organization,
    generatedAt: input.generatedAt,
    primaryRecommendation: `Fix ${weakest.name} first; it has the weakest z/OS batch-window posture.`,
    lanes
  };
}

export async function loadConsole(path: string): Promise<BatchConsole> {
  const raw = await readFile(path, "utf8");
  return buildConsole(JSON.parse(raw) as BatchInput);
}

export function renderMarkdown(batchConsole: BatchConsole): string {
  const rows = batchConsole.lanes
    .map(
      (lane) =>
        `| ${lane.name} | ${lane.tier} | ${lane.batchRiskScore} | ${lane.businessSystem} | ${lane.criticalWindow} | $${lane.downstreamExposureUsd.toLocaleString()} | ${lane.nextAction} |`
    )
    .join("\n");
  return `# IBM z/OS Batch Window Risk Console

Organization: ${batchConsole.organization}

Primary recommendation: ${batchConsole.primaryRecommendation}

| Lane | Tier | Batch posture | System | Window | Downstream exposure | Next action |
| --- | --- | ---: | --- | --- | ---: | --- |
${rows}
`;
}
