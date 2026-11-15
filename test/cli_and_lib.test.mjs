import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  TITLE2_WCAG_RULES,
  computeContrastRatio,
  compileSimpleStemToMathMl,
  auditCanvasHtmlDocument,
  formatTitle2AuditLedger
} from "../src/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CLI_BIN = path.join(REPO_ROOT, "bin", "title2-html-audit.mjs");
const EXAMPLES_DIR = path.join(REPO_ROOT, "examples");

test("1. Catalog defines all 12 DOJ ADA Title II WCAG 2.1 Level AA Canvas rules", () => {
  assert.equal(TITLE2_WCAG_RULES.length, 12);
  assert.ok(computeContrastRatio("#111317", "#ffffff") > 15);
  assert.ok(computeContrastRatio("#9ca3af", "#ffffff") < 4.5);
  assert.match(compileSimpleStemToMathMl("\\frac{a}{b}"), /<mfrac>/);
  assert.match(compileSimpleStemToMathMl("x^2"), /<msup>/);
});

test("2. Detects all 12 WCAG 2.1 Level AA rule categories on inaccessible_chem204_syllabus.html", () => {
  const badHtml = fs.readFileSync(path.join(EXAMPLES_DIR, "inaccessible_chem204_syllabus.html"), "utf8");
  const report = auditCanvasHtmlDocument(badHtml, { fileName: "inaccessible_chem204_syllabus.html" });

  assert.equal(report.ok, false);
  assert.equal(report.rulesPassed, 0, `Expected all 12 rules to trigger on comprehensive fixture, got: ${JSON.stringify(report.ruleBreakdown)}`);
  assert.ok(report.totalViolations >= 12);

  const ledger = formatTitle2AuditLedger(report);
  assert.match(ledger, /R03_TABLE_HEADERS_CAPTION/);
  assert.match(ledger, /https:\/\/title2\.stillhumanacademy\.com/);
});

test("3. Passes 12/12 WCAG 2.1 Level AA rules with 0 violations on accessible_chem204_canvas_page.html", () => {
  const goodHtml = fs.readFileSync(path.join(EXAMPLES_DIR, "accessible_chem204_canvas_page.html"), "utf8");
  const report = auditCanvasHtmlDocument(goodHtml, { fileName: "accessible_chem204_canvas_page.html" });

  assert.equal(report.ok, true, `Unexpected findings: ${JSON.stringify(report.findings)}`);
  assert.equal(report.totalViolations, 0);
  assert.equal(report.rulesPassed, 12);
  assert.equal(report.estimatedAllyScore, 100);
});

test("4. CLI supports --json and --strict exit codes for CI accessibility gates", () => {
  const goodPath = path.join(EXAMPLES_DIR, "accessible_chem204_canvas_page.html");
  const badPath = path.join(EXAMPLES_DIR, "inaccessible_chem204_syllabus.html");

  const goodOut = execFileSync(process.execPath, [CLI_BIN, goodPath, "--strict", "--json"], {
    encoding: "utf8"
  });
  const goodJson = JSON.parse(goodOut);
  assert.equal(goodJson.ok, true);
  assert.equal(goodJson.totalViolations, 0);

  const badRun = spawnSync(process.execPath, [CLI_BIN, badPath, "--strict", "--json"], {
    encoding: "utf8"
  });
  assert.equal(badRun.status, 1, "Expected exit code 1 when --strict detects WCAG violations");
  const badJson = JSON.parse(badRun.stdout);
  assert.equal(badJson.ok, false);
  assert.ok(badJson.totalViolations >= 12);
});

test("5. Zero external dependencies and zero em-dashes or en-dashes across repository", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.license, "MIT");

  function walk(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir)) {
      if (entry === ".git" || entry === "node_modules") continue;
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) out.push(...walk(full));
      else if (/\.(mjs|js|json|md|html|yml)$/.test(entry)) out.push(full);
    }
    return out;
  }

  for (const f of walk(REPO_ROOT)) {
    if (f.endsWith("cli_and_lib.test.mjs")) continue;
    const txt = fs.readFileSync(f, "utf8");
    assert.equal(txt.includes("\u2014"), false, `Em-dash found in ${f}`);
    assert.equal(txt.includes("\u2013"), false, `En-dash found in ${f}`);
  }
});
