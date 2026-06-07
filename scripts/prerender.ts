import { mkdir, writeFile } from "node:fs/promises";
import sample from "../fixtures/ibm-zos-batch-window-sample.json" with { type: "json" };
import { buildConsole, type BatchInput } from "../src/index.js";

const batchConsole = buildConsole(sample as BatchInput);
const strongest = [...batchConsole.lanes].sort((a, b) => b.batchRiskScore - a.batchRiskScore)[0];
const weakest = batchConsole.lanes[0];
const exposure = batchConsole.lanes.reduce((sum, lane) => sum + lane.downstreamExposureUsd, 0);

const cards = batchConsole.lanes
  .map(
    (lane) => `<article class="card">
      <span>${lane.tier}</span>
      <h3>${lane.name}</h3>
      <p>${lane.routingNote}</p>
      <dl>
        <div><dt>System</dt><dd>${lane.businessSystem}</dd></div>
        <div><dt>Window</dt><dd>${lane.criticalWindow}</dd></div>
        <div><dt>Posture</dt><dd>${lane.batchRiskScore}</dd></div>
        <div><dt>Exposure</dt><dd>$${lane.downstreamExposureUsd.toLocaleString()}</dd></div>
      </dl>
    </article>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IBM z/OS Batch Window Risk Console</title>
    <meta name="description" content="Board-readable IBM z/OS batch-window risk console for JCL dependency pressure, restart readiness, SLA exposure, and downstream settlement risk." />
    <style>
      :root { --bg:#050912; --panel:#0c1523; --line:rgba(116,241,219,.24); --text:#f6f3ea; --muted:#aeb7c7; --cyan:#30d5ff; --mint:#65f0c4; --gold:#ffd166; }
      * { box-sizing:border-box; }
      body { margin:0; background:radial-gradient(circle at top left, rgba(48,213,255,.14), transparent 34rem), radial-gradient(circle at top right, rgba(255,209,102,.12), transparent 30rem), var(--bg); color:var(--text); font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width:min(1180px, calc(100% - 32px)); margin:0 auto; padding:48px 0 56px; }
      .hero { border:1px solid var(--line); border-radius:28px; padding:clamp(28px,6vw,64px); background:linear-gradient(135deg, rgba(16,28,45,.96), rgba(8,13,24,.9)); box-shadow:0 30px 90px rgba(0,0,0,.35); }
      .eyebrow { color:var(--gold); font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; letter-spacing:.22em; text-transform:uppercase; }
      h1 { margin:18px 0; max-width:900px; font-size:clamp(46px,8vw,100px); line-height:.92; letter-spacing:-.065em; }
      .lede { max-width:740px; color:var(--muted); font-size:clamp(18px,2.4vw,24px); line-height:1.55; }
      .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:34px; }
      .metric,.card,.recommendation { border:1px solid rgba(255,255,255,.1); background:rgba(16,28,45,.72); border-radius:20px; }
      .metric { padding:20px; }
      .metric strong { display:block; font-size:34px; letter-spacing:-.04em; }
      .metric span { color:var(--muted); font-size:13px; text-transform:uppercase; letter-spacing:.12em; }
      h2 { font-size:clamp(34px,5vw,62px); letter-spacing:-.05em; margin:46px 0 16px; }
      .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; }
      .card { padding:24px; min-height:260px; }
      .card span { color:var(--cyan); font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:12px; letter-spacing:.16em; }
      .card h3 { margin:14px 0; font-size:26px; letter-spacing:-.035em; }
      .card p { color:var(--muted); line-height:1.55; }
      dl { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; margin:22px 0 0; }
      dt { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.12em; }
      dd { margin:4px 0 0; font-weight:700; }
      .recommendation { margin-top:18px; padding:26px; border-left:4px solid var(--gold); }
      .recommendation strong { color:var(--gold); }
      footer { color:var(--muted); margin-top:32px; font-size:14px; }
      @media (max-width:820px) { .metrics,.grid { grid-template-columns:1fr; } dl { grid-template-columns:1fr; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow">Mainframe operations</div>
        <h1>Batch windows should fail visibly before late jobs become board-visible exposure.</h1>
        <p class="lede">IBM z/OS Batch Window Risk Console turns JCL dependency pressure, restart readiness, reconciliation evidence, and downstream SLA exposure into one operator-readable control surface.</p>
        <div class="metrics">
          <div class="metric"><strong>${batchConsole.lanes.length}</strong><span>Lanes modeled</span></div>
          <div class="metric"><strong>$${Math.round(exposure / 1000000)}M</strong><span>Downstream exposure</span></div>
          <div class="metric"><strong>${weakest.batchRiskScore}</strong><span>Weakest posture</span></div>
          <div class="metric"><strong>${strongest.batchRiskScore}</strong><span>Strongest posture</span></div>
        </div>
      </section>
      <h2>Batch lanes</h2>
      <section class="grid">${cards}</section>
      <section class="recommendation"><strong>Primary recommendation</strong><p>${batchConsole.primaryRecommendation}</p></section>
      <footer>Kinetic Gain synthetic proof surface. No production JCL, datasets, job logs, credentials, or settlement evidence included.</footer>
    </main>
  </body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
