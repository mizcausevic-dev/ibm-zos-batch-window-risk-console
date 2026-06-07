# ibm-zos-batch-window-risk-console

[![ci](https://github.com/mizcausevic-dev/ibm-zos-batch-window-risk-console/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/ibm-zos-batch-window-risk-console/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/ibm-zos-batch-window-risk-console/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/ibm-zos-batch-window-risk-console/actions/workflows/pages.yml)

Board-readable IBM z/OS batch-window risk console for JCL dependency pressure, restart readiness, SLA exposure, and downstream settlement risk.

## Why this exists

- Batch windows become executive risk when late jobs, restart uncertainty, and downstream handoffs are hidden inside scheduler exports.
- Mainframe, finance, reporting, and platform teams need one view of which lanes can miss settlement, reporting, or customer-communication windows.
- This repo turns synthetic z/OS-style batch evidence into an operator surface for restart readiness, JCL dependency clarity, and board-readable exposure.

## What it shows

- `batchRiskScore` scoring across completion confidence, dependency clarity, restart readiness, downstream SLA coverage, reconciliation evidence, late jobs, manual restart steps, and criticality
- lane-level routing notes for settlement, claims, regulatory reporting, and statement generation motions
- CLI output suitable for README packaging and executive proof packets
- static GitHub Pages proof surface with no production mainframe data

## Local run

```bash
npm install
npm run verify
```

## CLI

```bash
npm run build
node dist/bin/cli.js fixtures/ibm-zos-batch-window-sample.json --format markdown
node dist/bin/cli.js fixtures/ibm-zos-batch-window-sample.json --format json
```

## Proof page

```bash
npm run prerender
```

The generated proof page is written to `site/index.html` for GitHub Pages deployment.

## Data safety

This repository uses synthetic batch metadata only. Do not commit real JCL, COBOL copybooks, scheduler exports, dataset names, account numbers, hostnames, credentials, screenshots, or production settlement evidence.
