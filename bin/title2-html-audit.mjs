#!/usr/bin/env node
/**
 * title2-html-audit CLI
 * Zero-dependency DOJ ADA Title II (April 26, 2027) 12-Rule WCAG 2.1 Level AA
 * HTML & Canvas LMS syllabus auditor.
 *
 * Batch PDF-to-Accessible Canvas .imscc Browser Compiler (100% client-side FERPA safe):
 *   https://title2.stillhumanacademy.com
 */

import fs from "node:fs";
import path from "node:path";
import {
  auditCanvasHtmlDocument,
  formatTitle2AuditLedger
} from "../src/index.mjs";

const VERSION = "1.0.0";

function printHelp() {
  const help = `title2-html-audit v${VERSION}
Zero-dependency 12-rule DOJ ADA Title II (WCAG 2.1 Level AA) HTML & Canvas LMS syllabus auditor.
Batch PDF-to-Canvas .imscc Compiler (100% browser-local): https://title2.stillhumanacademy.com

Usage:
  title2-html-audit <syllabus.html | directory> [options]

Options:
  --json       Emit machine-readable JSON audit report to stdout
  --strict     Exit with code 1 if any WCAG 2.1 Level AA violations are found (for CI/CD)
  -h, --help   Show this help message
  -v, --version Show CLI version
`;
  process.stdout.write(help);
}

function collectHtmlFiles(targetPath) {
  const st = fs.statSync(targetPath);
  if (st.isFile()) return [targetPath];
  const out = [];
  for (const entry of fs.readdirSync(targetPath)) {
    if (entry.startsWith(".") || entry === "node_modules") continue;
    const full = path.join(targetPath, entry);
    const cst = fs.statSync(full);
    if (cst.isDirectory()) out.push(...collectHtmlFiles(full));
    else if (/\.(html|htm|xhtml)$/i.test(entry)) out.push(full);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("-v") || args.includes("--version")) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exitCode = args.length === 0 ? 1 : 0;
    return;
  }

  const target = args.find((a) => !a.startsWith("-"));
  if (!target) {
    throw new Error("Missing HTML file or directory path. Run with --help for usage.");
  }

  const files = collectHtmlFiles(target);
  if (files.length === 0) {
    throw new Error(`No .html/.xhtml files found at '${target}'.`);
  }

  const reports = files.map((f) =>
    auditCanvasHtmlDocument(fs.readFileSync(f, "utf8"), { fileName: path.basename(f) })
  );
  const totalViolations = reports.reduce((acc, r) => acc + r.totalViolations, 0);

  if (args.includes("--json")) {
    const out = files.length === 1 ? reports[0] : { ok: totalViolations === 0, totalViolations, files: reports };
    process.stdout.write(JSON.stringify(out, null, 2) + "\n");
  } else {
    for (const rep of reports) {
      process.stdout.write(formatTitle2AuditLedger(rep) + "\n\n");
    }
  }

  if (args.includes("--strict") && totalViolations > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (err) {
  process.stderr.write(`Error: ${err && err.message ? err.message : String(err)}\n`);
  process.exit(1);
}
