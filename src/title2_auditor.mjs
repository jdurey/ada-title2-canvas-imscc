/**
 * ada-title2-canvas-imscc - Deterministic 12-Rule DOJ ADA Title II WCAG 2.1 Level AA
 * HTML & Canvas LMS Syllabus Auditor + W3C MathML Helper.
 *
 * 100% zero-dependency open-spec implementation aligned with:
 * - DOJ 28 CFR Part 35 Subpart H (April 26, 2027 Public Higher-Ed Deadline)
 * - W3C WCAG 2.1 Level AA & W3C MathML 3.0
 */

export const TITLE2_WCAG_RULES = [
  {
    ruleId: "R01_DOC_LANG_TITLE",
    wcag: "WCAG 2.4.2, 3.1.1",
    title: "Document Language & Descriptive Page Title"
  },
  {
    ruleId: "R02_HEADING_HIERARCHY",
    wcag: "WCAG 1.3.1, 2.4.6",
    title: "Sequential Heading Hierarchy (H1 -> H2 -> H3 -> H4)"
  },
  {
    ruleId: "R03_TABLE_HEADERS_CAPTION",
    wcag: "WCAG 1.3.1",
    title: "Accessible Data Tables (<th scope=\"col\"> & <caption>)"
  },
  {
    ruleId: "R04_STEM_MATHML",
    wcag: "WCAG 1.1.1, 1.3.1",
    title: "Native W3C MathML STEM Equation Markup"
  },
  {
    ruleId: "R05_DESCRIPTIVE_LINKS",
    wcag: "WCAG 2.4.4",
    title: "Descriptive Hyperlink Purpose (No 'Click Here' or Raw URLs)"
  },
  {
    ruleId: "R06_COLOR_CONTRAST_AA",
    wcag: "WCAG 1.4.3",
    title: "Minimum 4.5:1 AA Foreground/Background Contrast"
  },
  {
    ruleId: "R07_SEMANTIC_LISTS",
    wcag: "WCAG 1.3.1",
    title: "Semantic List Structure (<ul> / <ol> Instead of Pseudo-Bullets)"
  },
  {
    ruleId: "R08_FIGURE_ALT_TEXT",
    wcag: "WCAG 1.1.1",
    title: "Image Alt-Text & Decorative Role Attribution"
  },
  {
    ruleId: "R09_READING_ORDER",
    wcag: "WCAG 1.3.2, 1.4.5",
    title: "Logical DOM Reading Order & Zero Positive Tabindex Traps"
  },
  {
    ruleId: "R10_RESPONSIVE_REFLOW",
    wcag: "WCAG 1.4.4, 1.4.10",
    title: "400% Zoom Reflow & Viewport Pinch-Zoom Support"
  },
  {
    ruleId: "R11_ALL_CAPS_CALLOUTS",
    wcag: "WCAG 1.3.1",
    title: "All-Caps Block Normalization (Prevent Acronym Misread)"
  },
  {
    ruleId: "R12_SECTION_LANDMARKS",
    wcag: "WCAG 2.4.1, 3.1.2",
    title: "Bypass Landmarks (<main>, <section>, <nav>) on Multi-Section Pages"
  }
];

function hexToRgb(hex) {
  const clean = String(hex || "#000000").replace(/^#/, "").trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16)
    ];
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16)
    ];
  }
  return null;
}

function relativeLuminance(rgb) {
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

export function computeContrastRatio(fgHex, bgHex = "#ffffff") {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return 21;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

function stripHtmlTags(str) {
  return String(str ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function compileSimpleStemToMathMl(expr) {
  const raw = String(expr ?? "").trim();
  const fracMatch = raw.match(/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/);
  if (fracMatch) {
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mfrac><mrow>${compileAtom(fracMatch[1])}</mrow><mrow>${compileAtom(fracMatch[2])}</mrow></mfrac></math>`;
  }
  const supMatch = raw.match(/^([A-Za-z0-9]+)\^\{?([A-Za-z0-9+-]+)\}?$/);
  if (supMatch) {
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><msup>${compileAtom(supMatch[1])}${compileAtom(supMatch[2])}</msup></math>`;
  }
  const subMatch = raw.match(/^([A-Za-z0-9]+)_\{?([A-Za-z0-9+-]+)\}?$/);
  if (subMatch) {
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><msub>${compileAtom(subMatch[1])}${compileAtom(subMatch[2])}</msub></math>`;
  }
  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"><mrow>${compileAtom(raw)}</mrow></math>`;
}

function compileAtom(token) {
  const t = String(token).trim();
  if (/^\d+(\.\d+)?$/.test(t)) return `<mn>${t}</mn>`;
  if (/^[A-Za-z]$/.test(t)) return `<mi>${t}</mi>`;
  const escaped = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<mtext>${escaped}</mtext>`;
}

export function auditCanvasHtmlDocument(rawHtml, options = {}) {
  const fileName = options.fileName || "document.html";
  const html = String(rawHtml ?? "");
  const isFullDocument = /<html\b/i.test(html);

  const ruleCounts = Object.fromEntries(TITLE2_WCAG_RULES.map((r) => [r.ruleId, 0]));
  const findings = [];

  const recordFinding = (ruleId, detail, snippet = "") => {
    ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
    findings.push({
      ruleId,
      detail,
      snippet: snippet.slice(0, 120)
    });
  };

  // R01: Document lang & title (for full HTML documents) or primary H1/title for Canvas fragments
  if (isFullDocument) {
    const htmlOpen = html.match(/<html\b([^>]*)>/i);
    const attrs = htmlOpen ? htmlOpen[1] : "";
    if (!/\blang\s*=\s*["'][a-zA-Z-]{2,}["']/i.test(attrs)) {
      recordFinding("R01_DOC_LANG_TITLE", "<html> element is missing a valid lang attribute (e.g. lang=\"en\").", htmlOpen ? htmlOpen[0] : "<html>");
    }
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (!titleMatch || stripHtmlTags(titleMatch[1]).length < 3) {
      recordFinding("R01_DOC_LANG_TITLE", "Document <head> is missing a descriptive <title> element.", "<head>");
    }
  } else if (!/<h1\b/i.test(html) && !/\blang\s*=\s*["'][a-zA-Z-]{2,}["']/i.test(html)) {
    recordFinding("R01_DOC_LANG_TITLE", "Canvas HTML fragment lacks both a primary <h1> heading and a root lang attribute.", html.slice(0, 80));
  }

  // R02: Heading hierarchy (skipped levels + fake-bold paragraph headings)
  const headingMatches = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  if (headingMatches.length === 0) {
    recordFinding("R02_HEADING_HIERARCHY", "No semantic <h1>-<h6> headings found in document.");
  } else {
    let prevLevel = 0;
    for (const hm of headingMatches) {
      const level = Number(hm[1]);
      const text = stripHtmlTags(hm[2]);
      if (!text) {
        recordFinding("R02_HEADING_HIERARCHY", `Empty <h${level}> element found.`, hm[0]);
      } else if (prevLevel > 0 && level > prevLevel + 1) {
        recordFinding(
          "R02_HEADING_HIERARCHY",
          `Skipped heading level from <h${prevLevel}> directly to <h${level}> ('${text}').`,
          hm[0]
        );
      }
      prevLevel = level;
    }
  }

  const fakeBoldHeadings = html.match(/<p\b[^>]*>\s*<(strong|b)\b[^>]*>[A-Z0-9\s:&/-]{6,80}<\/\1>\s*<\/p>/g) || [];
  for (const fb of fakeBoldHeadings) {
    recordFinding("R02_HEADING_HIERARCHY", "Fake-bold <p><strong> header should be a semantic <h2> or <h3>.", fb);
  }

  // R03: Accessible Data Tables (<th scope="col|row"> & <caption>)
  const tableMatches = [...html.matchAll(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi)];
  for (const tm of tableMatches) {
    const tAttrs = tm[1] || "";
    const tBody = tm[2] || "";
    if (/role\s*=\s*["']presentation["']/i.test(tAttrs)) continue;

    if (!/<caption\b[^>]*>[\s\S]+?<\/caption>/i.test(tBody) && !/aria-label\s*=\s*["'][^"']+["']/i.test(tAttrs)) {
      recordFinding("R03_TABLE_HEADERS_CAPTION", "Data <table> is missing a descriptive <caption> element.", `<table${tAttrs}>`);
    }
    const thTags = [...tBody.matchAll(/<th\b([^>]*)>/gi)];
    if (thTags.length === 0) {
      recordFinding("R03_TABLE_HEADERS_CAPTION", "Data <table> has zero <th> header cells.", `<table${tAttrs}>`);
    } else if (thTags.some((th) => !/\bscope\s*=\s*["'](col|row|colgroup|rowgroup)["']/i.test(th[1] || ""))) {
      recordFinding("R03_TABLE_HEADERS_CAPTION", "One or more <th> cells lack explicit scope=\"col\" or scope=\"row\".", thTags[0][0]);
    }
  }

  // R04: Raw LaTeX / uncompiled STEM notation outside <math>
  const strippedMath = html.replace(/<math\b[\s\S]*?<\/math>/gi, " ");
  const strippedCode = strippedMath.replace(/<(code|pre|script|style)\b[\s\S]*?<\/\1>/gi, " ");
  const textOnly = stripHtmlTags(strippedCode);
  const rawLatexMatches =
    textOnly.match(/(\\(?:frac|sqrt|sum|int|alpha|beta|Delta|Sigma)\b|\$\$?[^$]{2,60}\$\$?|\b[A-Za-z]_[A-Za-z0-9]+\s*=\s*[^\s]+|\b[A-Za-z]\^[0-9]+)/g) || [];
  for (const eq of rawLatexMatches) {
    recordFinding("R04_STEM_MATHML", "Uncompiled raw LaTeX or ASCII STEM notation detected outside W3C <math>.", eq);
  }

  // R05: Vague link text ('click here', 'here', 'link', 'read more') or raw URL anchor text
  const anchorMatches = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  for (const am of anchorMatches) {
    const aAttrs = am[1] || "";
    if (/\baria-label\s*=\s*["'][^"']{6,}["']/i.test(aAttrs)) continue;
    const linkText = stripHtmlTags(am[2]);
    if (/^(click here|here|read more|more|link|info|website)$/i.test(linkText)) {
      recordFinding("R05_DESCRIPTIVE_LINKS", `Non-descriptive hyperlink text '${linkText}' fails WCAG 2.4.4.`, am[0]);
    } else if (/^https?:\/\/\S{18,}$/i.test(linkText)) {
      recordFinding("R05_DESCRIPTIVE_LINKS", "Raw URL used as visible link text instead of human-readable destination label.", am[0]);
    }
  }

  // R06: Inline color contrast < 4.5:1
  const styleBlocks = [...html.matchAll(/style\s*=\s*["']([^"']+)["']/gi)];
  for (const sb of styleBlocks) {
    const css = sb[1];
    const fgMatch = css.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{3,6})\b/i);
    const bgMatch = css.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})\b/i);
    if (fgMatch) {
      const ratio = computeContrastRatio(fgMatch[1], bgMatch ? bgMatch[1] : "#ffffff");
      if (ratio < 4.5) {
        recordFinding(
          "R06_COLOR_CONTRAST_AA",
          `Inline color contrast ${ratio}:1 (${fgMatch[1]} on ${bgMatch ? bgMatch[1] : "#ffffff"}) is below 4.5:1 WCAG AA minimum.`,
          sb[0]
        );
      }
    }
  }

  // R07: Pseudo-bullet paragraphs instead of semantic <ul> / <ol>
  const paraMatches = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  for (const pm of paraMatches) {
    const pText = stripHtmlTags(pm[1]);
    if (/^([\u2022\u25CF\u25E6*]|-\s|\d+\))\s+\S+/.test(pText)) {
      recordFinding("R07_SEMANTIC_LISTS", "Pseudo-bullet glyph inside <p> instead of semantic <ul>/<ol><li>.", pm[0]);
    }
  }

  // R08: Image alt-text & decorative role
  const imgMatches = [...html.matchAll(/<img\b([^>]*?)\/?>/gi)];
  for (const im of imgMatches) {
    const attrs = im[1] || "";
    const altMatch = attrs.match(/\balt\s*=\s*["']([^"']*)["']/i);
    if (!altMatch) {
      recordFinding("R08_FIGURE_ALT_TEXT", "<img> tag is missing an alt attribute.", im[0]);
    } else {
      const altVal = altMatch[1].trim();
      if (altVal === "" && !/\b(role\s*=\s*["']presentation["']|aria-hidden\s*=\s*["']true["'])/i.test(attrs)) {
        recordFinding("R08_FIGURE_ALT_TEXT", "Empty alt=\"\" image should declare role=\"presentation\" for explicit decorative intent.", im[0]);
      } else if (/^(img_|dsc_|screenshot|image|photo|figure)\d*(\.(png|jpg|jpeg|gif|svg))?$/i.test(altVal) || /\.(png|jpg|jpeg|gif|webp|pdf)$/i.test(altVal)) {
        recordFinding("R08_FIGURE_ALT_TEXT", `Filename or placeholder alt="${altVal}" is not a meaningful description.`, im[0]);
      }
    }
  }

  // R09: Reading order / positive tabindex traps
  const posTabindex = html.match(/\btabindex\s*=\s*["']?[1-9]\d*["']?/gi) || [];
  for (const ti of posTabindex) {
    recordFinding("R09_READING_ORDER", "Positive tabindex overrides natural DOM keyboard reading order.", ti);
  }

  // R10: Responsive 400% zoom reflow & viewport scaling
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(html)) {
    recordFinding("R10_RESPONSIVE_REFLOW", "Viewport meta tag disables pinch-to-zoom (fails WCAG 1.4.4).", "<meta name=\"viewport\">");
  }
  const fixedWidths = html.match(/(?:^|;|"|\s)width\s*:\s*([5-9]\d{2}|\d{4,})px\b/gi) || [];
  for (const fw of fixedWidths) {
    recordFinding("R10_RESPONSIVE_REFLOW", "Fixed pixel width >= 500px causes horizontal scrolling at 400% zoom (WCAG 1.4.10).", fw.trim());
  }

  // R11: All-caps callout blocks (>= 5 consecutive uppercase words)
  const textWithoutTags = stripHtmlTags(strippedCode);
  const allCapsRuns = textWithoutTags.match(/\b[A-Z]{2,}(?:\s+[A-Z]{2,}){4,}\b/g) || [];
  for (const caps of allCapsRuns) {
    recordFinding("R11_ALL_CAPS_CALLOUTS", "Extended ALL-CAPS phrase risks letter-by-letter acronym mispronunciation.", caps);
  }

  // R12: Section landmarks on multi-section documents (>= 3 headings)
  if (headingMatches.length >= 3 && !/<(main|section|article|nav)\b/i.test(html)) {
    recordFinding(
      "R12_SECTION_LANDMARKS",
      "Multi-section syllabus (>= 3 headings) lacks semantic <main> or <section> landmarks."
    );
  }

  const totalViolations = Object.values(ruleCounts).reduce((a, b) => a + b, 0);
  const rulesPassed = TITLE2_WCAG_RULES.filter((r) => ruleCounts[r.ruleId] === 0).length;
  const estimatedAllyScore = Math.max(12, Math.min(100, Math.round(100 - totalViolations * 6.5)));

  return {
    ok: totalViolations === 0,
    fileName,
    wcagTarget: "WCAG 2.1 Level AA (DOJ ADA Title II - April 26, 2027)",
    totalRules: TITLE2_WCAG_RULES.length,
    rulesPassed,
    totalViolations,
    estimatedAllyScore,
    ruleBreakdown: TITLE2_WCAG_RULES.map((r) => ({
      ruleId: r.ruleId,
      wcag: r.wcag,
      title: r.title,
      violations: ruleCounts[r.ruleId],
      status: ruleCounts[r.ruleId] === 0 ? "PASS" : "FAIL"
    })),
    findings
  };
}

export function formatTitle2AuditLedger(report) {
  const lines = [
    `DOJ ADA Title II / WCAG 2.1 Level AA Audit: ${report.fileName}`,
    `Status: ${report.ok ? "PASS (0 Violations)" : `FAIL (${report.totalViolations} Violations)`} | Rules Passed: ${report.rulesPassed}/${report.totalRules} | Est. Ally Gauge: ${report.estimatedAllyScore}%`,
    `+${"-".repeat(28)}+${"-".repeat(20)}+${"-".repeat(8)}+${"-".repeat(12)}+`,
    `| ${"Rule ID".padEnd(26)} | ${"WCAG 2.1".padEnd(18)} | ${"Status".padEnd(6)} | ${"Violations".padEnd(10)} |`,
    `+${"-".repeat(28)}+${"-".repeat(20)}+${"-".repeat(8)}+${"-".repeat(12)}+`
  ];

  for (const row of report.ruleBreakdown) {
    lines.push(
      `| ${row.ruleId.padEnd(26)} | ${row.wcag.padEnd(18)} | ${row.status.padEnd(6)} | ${String(row.violations).padEnd(10)} |`
    );
  }
  lines.push(`+${"-".repeat(28)}+${"-".repeat(20)}+${"-".repeat(8)}+${"-".repeat(12)}+`);

  if (report.findings.length > 0) {
    lines.push("");
    lines.push("Detected Accessibility Findings:");
    for (const f of report.findings.slice(0, 15)) {
      lines.push(`  [${f.ruleId}] ${f.detail}${f.snippet ? ` -> ${f.snippet}` : ""}`);
    }
    if (report.findings.length > 15) {
      lines.push(`  ... and ${report.findings.length - 15} additional finding(s).`);
    }
  }

  lines.push("");
  lines.push("Need to batch-compile untagged university PDFs into WCAG 2.1 AA Canvas .imscc modules in 15s?");
  lines.push("  -> Zero-Upload Browser Compiler: https://title2.stillhumanacademy.com");
  return lines.join("\n");
}
