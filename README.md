# ada-title2-canvas-imscc

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-339933.svg)](./package.json)
[![Canvas Chrome Extension](https://img.shields.io/badge/Chrome_Web_Store-Canvas_Rubric_%26_QTI-0f766e.svg)](https://chromewebstore.google.com/detail/canvas-assessment-rubric/aholdfpbhfiipondaloaooenjpfeccnp)

Zero-dependency Node.js CLI and ESM library that audits university HTML pages and Canvas LMS syllabi against the **12 DOJ ADA Title II WCAG 2.1 Level AA rules** ahead of the **April 26, 2027** public higher-education enforcement deadline (`28 CFR Part 35 Subpart H`).

> [!TIP]
> **Need to batch-convert untagged university PDFs, `.docx` syllabi, and STEM handouts directly into WCAG 2.1 AA Native Canvas Modules (`.imscc`) in 15 seconds?**
> Instructional designers, accessibility offices, and faculty can run the 100% browser-local compiler (zero server PDF uploads, FERPA/HECVAT safe, free 2-page `_SAMPLE.imscc` proof, plus **$99 Department P-Card Packs** under standard `$100` university purchasing limits) at **[title2.stillhumanacademy.com](https://title2.stillhumanacademy.com)**, and install our free companion Chrome extension (**[Canvas Assessment & Rubric Matrix Exporter](https://chromewebstore.google.com/detail/canvas-assessment-rubric/aholdfpbhfiipondaloaooenjpfeccnp)**) for SpeedGrader rubric Excel matrices and QTI `.zip` exports:
>
> - **DOJ ADA Title II April 2027 Batch PDF-to-Canvas `.imscc` Compiler:** [title2.stillhumanacademy.com/ada-title-ii-canvas-pdf-remediation](https://title2.stillhumanacademy.com/ada-title-ii-canvas-pdf-remediation)
> - **Convert PDF Syllabi to WCAG 2.1 AA Native Canvas Pages:** [title2.stillhumanacademy.com/pdf-syllabus-to-canvas-accessible-html](https://title2.stillhumanacademy.com/pdf-syllabus-to-canvas-accessible-html)
> - **Convert STEM Handout PDFs to W3C MathML & Accessible Tables:** [title2.stillhumanacademy.com/pdf-math-tables-to-canvas-mathml](https://title2.stillhumanacademy.com/pdf-math-tables-to-canvas-mathml)
> - **Fix Red Blackboard Ally / YuJa Panorama PDF Scores in Canvas:** [title2.stillhumanacademy.com/blackboard-ally-low-score-pdf-fix](https://title2.stillhumanacademy.com/blackboard-ally-low-score-pdf-fix)

---

## April 26, 2027 DOJ ADA Title II Higher-Ed Checklist (12 WCAG 2.1 AA Rules)

Under the Department of Justice final rule updating **28 CFR Part 35 Subpart H**, public universities and community colleges serving jurisdictions of `50,000+` must bring digital course materials inside LMS platforms (Instructure Canvas, Brightspace, Blackboard, Moodle) into **WCAG 2.1 Level AA** conformance by **April 26, 2027**.

`title2-html-audit` checks all 12 high-frequency course failures deterministically:

| Rule ID | WCAG 2.1 Criterion | What It Audits in Canvas / Syllabus HTML |
| :--- | :--- | :--- |
| `R01_DOC_LANG_TITLE` | `2.4.2`, `3.1.1` | Valid `<html lang="en">` attribute and descriptive `<title>` / `<h1>` |
| `R02_HEADING_HIERARCHY` | `1.3.1`, `2.4.6` | Non-skipped `H1 -> H2 -> H3 -> H4` hierarchy and zero fake-bold `<p><strong>` headers |
| `R03_TABLE_HEADERS_CAPTION` | `1.3.1` | Data tables include `<caption>` and explicit `<th scope="col">` or `scope="row"` |
| `R04_STEM_MATHML` | `1.1.1`, `1.3.1` | STEM equations compiled to W3C `<math>` MathML instead of raw LaTeX/ASCII |
| `R05_DESCRIPTIVE_LINKS` | `2.4.4` | Eliminates vague `"click here"` / `"read more"` and raw URL link text |
| `R06_COLOR_CONTRAST_AA` | `1.4.3` | Verifies `>= 4.5:1` relative luminance contrast on inline styles |
| `R07_SEMANTIC_LISTS` | `1.3.1` | Flags pseudo-bullet `<p>* item</p>` lines missing semantic `<ul>` / `<ol>` |
| `R08_FIGURE_ALT_TEXT` | `1.1.1` | Flags missing `alt`, camera filenames (`IMG_4021.png`), or untagged decorative images |
| `R09_READING_ORDER` | `1.3.2`, `1.4.5` | Flags positive `tabindex` overrides that break logical keyboard reading sequence |
| `R10_RESPONSIVE_REFLOW` | `1.4.4`, `1.4.10` | Flags `user-scalable=no` and fixed pixel widths `>= 500px` blocking 400% zoom |
| `R11_ALL_CAPS_CALLOUTS` | `1.3.1` | Flags long ALL-CAPS warning blocks prone to letter-by-letter screen-reader misread |
| `R12_SECTION_LANDMARKS` | `2.4.1`, `3.1.2` | Verifies `<main>`, `<section>`, or `<nav>` landmarks on multi-section syllabi |

---

## Quick Start (CLI)

Requires Node.js `>= 18` with **zero npm dependencies**:

```bash
git clone https://github.com/jdurey/ada-title2-canvas-imscc.git
cd ada-title2-canvas-imscc
npm test
```

### 1. Audit an Inaccessible Syllabus vs. Remediated Canvas Page

```bash
node ./bin/title2-html-audit.mjs ./examples/inaccessible_chem204_syllabus.html
node ./bin/title2-html-audit.mjs ./examples/accessible_chem204_canvas_page.html
```

### 2. Enforce Zero WCAG 2.1 AA Violations in CI/CD (`--strict` + `--json`)

```bash
node ./bin/title2-html-audit.mjs ./examples/accessible_chem204_canvas_page.html --strict --json
```

---

## Programmatic Node.js / ESM Library Usage

```js
import fs from "node:fs";
import {
  auditCanvasHtmlDocument,
  computeContrastRatio,
  compileSimpleStemToMathMl
} from "ada-title2-canvas-imscc";

const html = fs.readFileSync("./examples/accessible_chem204_canvas_page.html", "utf8");
const report = auditCanvasHtmlDocument(html, { fileName: "chem204.html" });

console.log(report.ok); // true
console.log(report.rulesPassed); // 12
console.log(computeContrastRatio("#1e293b", "#ffffff")); // 16.08
console.log(compileSimpleStemToMathMl("\\frac{a}{b}"));
```

---

## Batch PDF-to-Canvas `.imscc` Remediation Web Compiler

Manual Adobe Acrobat PDF tag-tree remediation quotes run `$4 to $25 per page` (`$600 to $3,750` per course) and break the moment an instructor edits next semester's syllabus.

To batch-compile untagged PDFs, `.docx` syllabi, and STEM handouts directly into **WCAG 2.1 Level AA Native Canvas Wiki Pages (`.imscc`)** with W3C MathML equations, accessible `<th scope="col">` tables, interactive figure alt-text review, and signed Title II compliance receipts:

- **Launch the Browser-Local Compiler:** [https://title2.stillhumanacademy.com](https://title2.stillhumanacademy.com)

## License

MIT License. See [LICENSE](./LICENSE).
