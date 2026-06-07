import { describe, expect, it } from "vitest";
import { buildConsole, classifyTier, renderMarkdown, type BatchInput } from "../src/index.js";
import sample from "../fixtures/ibm-zos-batch-window-sample.json" with { type: "json" };

describe("ibm z/OS batch window risk console", () => {
  it("classifies batch tiers", () => {
    expect(classifyTier(50)).toBe("ESCALATE");
    expect(classifyTier(66)).toBe("COMPRESS");
    expect(classifyTier(79)).toBe("WATCH");
    expect(classifyTier(90)).toBe("STABLE");
  });

  it("scores the weakest lane with risk routing language", () => {
    const console = buildConsole(sample as BatchInput);
    expect(console.lanes[0]?.name).toBe("Nightly settlement close");
    expect(console.lanes[0]?.batchRiskScore).toBeLessThan(58);
    expect(console.lanes[0]?.routingNote).toContain("batch-window risk routing");
  });

  it("sorts lanes by weakest batch posture first", () => {
    const console = buildConsole(sample as BatchInput);
    const scores = console.lanes.map((lane) => lane.batchRiskScore);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it("renders markdown with downstream exposure evidence", () => {
    const markdown = renderMarkdown(buildConsole(sample as BatchInput));
    expect(markdown).toContain("IBM z/OS Batch Window Risk Console");
    expect(markdown).toContain("Nightly settlement close");
    expect(markdown).toContain("$4,200,000");
  });
});
