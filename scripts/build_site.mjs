import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(path.dirname(__filename));
const docsDir = path.join(rootDir, "docs");
const dataDir = path.join(rootDir, "data");
const outputDir = path.join(rootDir, "outputs");
const config = JSON.parse(await fs.readFile(path.join(rootDir, "search_config.json"), "utf8"));
const leads = JSON.parse(await fs.readFile(path.join(dataDir, "leads.json"), "utf8"));
const generatedAt = new Date().toISOString();

const csvHeaders = config.tracker_columns;
const fieldMap = {
  "Date Found": "first_found",
  Source: "source",
  "Lead Type": "lead_type",
  "Professor or Contact Name": "professor_or_contact_name",
  "Role or Title": "role_or_title",
  Institution: "institution",
  "Department or Lab": "department_or_lab",
  Country: "country",
  Field: "field",
  "Project Keywords": "project_keywords",
  "Opportunity Level": "opportunity_level",
  "Funding Status": "funding_status",
  Deadline: "deadline",
  "Start Date": "start_date",
  Email: "email",
  "Profile or Post URL": "profile_or_post_url",
  "Official Page URL": "official_page_url",
  "Evidence Snippet": "evidence_snippet",
  "Fit Score": "fit_score",
  Priority: "priority",
  "Outreach Status": "outreach_status",
  "Last Contacted": "last_contacted",
  "Follow-up Date": "follow_up_date",
  "Next Action": "next_action",
  "Draft Email Notes": "draft_email_notes",
  "CV Version Sent": "cv_version_sent",
  "Response Notes": "response_notes",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  return [csvHeaders.map(csvEscape).join(","), ...rows.map((lead) => csvHeaders.map((header) => csvEscape(lead[fieldMap[header]])).join(","))].join("\n");
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function leadRow(lead) {
  const score = Number(lead.fit_score || 0);
  const priority = lead.priority || "Low";
  const link = lead.official_page_url || lead.profile_or_post_url || "";
  return `<tr data-priority="${escapeHtml(priority)}" data-field="${escapeHtml(lead.field)}">
    <td><strong>${escapeHtml(lead.role_or_title)}</strong><small>${escapeHtml(lead.evidence_snippet)}</small></td>
    <td>${escapeHtml(lead.institution || "Verify")}</td>
    <td>${escapeHtml(lead.field)}</td>
    <td>${escapeHtml(lead.funding_status)}</td>
    <td><span class="score">${score}</span><span class="priority ${escapeHtml(priority.toLowerCase())}">${escapeHtml(priority)}</span></td>
    <td>${escapeHtml(lead.deadline || "Verify")}</td>
    <td>${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">Open source</a>` : ""}</td>
  </tr>`;
}

function buildSearchLinks() {
  const source = path.join(outputDir, "linkedin_search_urls.csv");
  return fs
    .readFile(source, "utf8")
    .then((content) => fs.writeFile(path.join(docsDir, "linkedin_search_urls.csv"), content, "utf8"))
    .catch(() => undefined);
}

await fs.mkdir(docsDir, { recursive: true });
await fs.writeFile(path.join(docsDir, "leads.json"), `${JSON.stringify(leads, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(docsDir, "leads.csv"), `${toCsv(leads)}\n`, "utf8");
await fs.copyFile(path.join(dataDir, "manual_linkedin_capture.csv"), path.join(docsDir, "manual_linkedin_capture.csv")).catch(() => undefined);
await buildSearchLinks();

const high = leads.filter((lead) => lead.priority === "High").length;
const medium = leads.filter((lead) => lead.priority === "Medium").length;
const latest = leads[0]?.last_seen || "No leads yet";
const fields = [...new Set(leads.map((lead) => lead.field).filter(Boolean))].sort();

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PhD/MSc Opportunity Tracker</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #14213d;
      --muted: #526070;
      --line: #d6dde6;
      --panel: #ffffff;
      --soft: #f4f7fb;
      --accent: #0f766e;
      --accent-2: #8a4b0f;
      --danger: #a61b35;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--ink);
      background: #eef3f8;
      line-height: 1.45;
    }
    header {
      background: #102542;
      color: white;
      padding: 28px clamp(16px, 4vw, 56px);
    }
    header h1 {
      margin: 0 0 8px;
      font-size: clamp(28px, 4vw, 46px);
      letter-spacing: 0;
    }
    header p {
      margin: 0;
      max-width: 920px;
      color: #d9e5f2;
      font-size: 16px;
    }
    main {
      width: min(1380px, calc(100% - 32px));
      margin: 24px auto 48px;
    }
    .toolbar, section {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .metric {
      background: var(--soft);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      min-height: 76px;
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
    }
    .metric strong {
      display: block;
      margin-top: 6px;
      font-size: 26px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }
    input, select, button {
      min-height: 38px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: white;
      color: var(--ink);
      padding: 8px 10px;
      font: inherit;
    }
    input { min-width: min(340px, 100%); }
    button, a.button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      text-decoration: none;
      cursor: pointer;
      min-height: 38px;
      border-radius: 6px;
      padding: 8px 12px;
    }
    a.secondary {
      background: #334155;
      border-color: #334155;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      table-layout: fixed;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
      font-size: 14px;
    }
    th {
      background: #e6edf5;
      font-size: 12px;
      text-transform: uppercase;
      color: #334155;
    }
    td small {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      max-height: 58px;
      overflow: hidden;
    }
    .score {
      display: inline-flex;
      min-width: 34px;
      justify-content: center;
      border-radius: 999px;
      padding: 3px 8px;
      background: #e8f3f1;
      color: #075e54;
      font-weight: 700;
      margin-right: 6px;
    }
    .priority {
      display: inline-flex;
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 12px;
      font-weight: 700;
      background: #eef2f7;
    }
    .priority.high { color: #075e54; }
    .priority.medium { color: var(--accent-2); }
    .priority.low { color: var(--danger); }
    .steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(220px, 1fr));
      gap: 12px;
    }
    .step {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: var(--soft);
    }
    .step strong { display: block; margin-bottom: 6px; }
    code {
      background: #eef2f7;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .note {
      color: var(--muted);
      margin: 8px 0 0;
    }
    @media (max-width: 900px) {
      .metrics, .steps { grid-template-columns: 1fr; }
      table { table-layout: auto; }
      th:nth-child(2), td:nth-child(2), th:nth-child(4), td:nth-child(4), th:nth-child(6), td:nth-child(6) { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <h1>PhD/MSc Opportunity Tracker</h1>
    <p>Daily public-source lead finder for funded graduate opportunities in medicinal chemistry, drug discovery, computational chemistry, health informatics, AI for health, and health data engineering. LinkedIn remains manual capture only.</p>
  </header>
  <main>
    <div class="metrics">
      ${metric("Total leads", leads.length)}
      ${metric("High priority", high)}
      ${metric("Medium priority", medium)}
      ${metric("Latest run", latest)}
    </div>

    <div class="toolbar">
      <div class="controls">
        <input id="search" type="search" placeholder="Filter by title, field, institution, funding, snippet">
        <select id="priority">
          <option value="">All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select id="field">
          <option value="">All fields</option>
          ${fields.map((field) => `<option>${escapeHtml(field)}</option>`).join("")}
        </select>
        <a class="button" href="leads.csv" download>Download leads CSV</a>
        <a class="button secondary" href="linkedin_search_urls.csv" download>LinkedIn searches CSV</a>
      </div>
      <p class="note">Generated at ${escapeHtml(generatedAt)}. The daily run updates the JSON/CSV data without duplicating existing URLs.</p>
    </div>

    <section>
      <h2>Lead Table</h2>
      <table id="lead-table">
        <thead>
          <tr>
            <th style="width: 34%;">Opportunity</th>
            <th style="width: 14%;">Institution</th>
            <th style="width: 13%;">Field</th>
            <th style="width: 12%;">Funding</th>
            <th style="width: 10%;">Fit</th>
            <th style="width: 9%;">Deadline</th>
            <th style="width: 8%;">Source</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(leadRow).join("") || `<tr><td colspan="7">No leads yet. Run the workflow manually from GitHub Actions or wait for the scheduled run.</td></tr>`}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Manual LinkedIn Workflow</h2>
      <div class="steps">
        <div class="step"><strong>1. Search manually</strong>Open LinkedIn, paste one Boolean query from <code>linkedin_boolean_searches.md</code>, then filter to Posts for openings or People for professors/students.</div>
        <div class="step"><strong>2. Copy the useful link</strong>For a post, open the post menu and choose copy link, or open the post and copy the URL from the address bar. For a profile, open the profile and copy the address-bar URL.</div>
        <div class="step"><strong>3. Store the lead</strong>Add the URL to the workbook's <code>Manual LinkedIn Capture</code> sheet, or edit <code>data/manual_linkedin_capture.csv</code> in GitHub and commit the new row.</div>
      </div>
      <p class="note">Static GitHub Pages cannot save form edits by itself. The safe live workflow is to paste selected LinkedIn links into the repo CSV or your local workbook, then move strong leads into outreach.</p>
    </section>
  </main>
  <script>
    const search = document.querySelector("#search");
    const priority = document.querySelector("#priority");
    const field = document.querySelector("#field");
    const rows = [...document.querySelectorAll("#lead-table tbody tr")];
    function applyFilters() {
      const q = search.value.trim().toLowerCase();
      const p = priority.value;
      const f = field.value;
      for (const row of rows) {
        const text = row.innerText.toLowerCase();
        const visible = (!q || text.includes(q)) && (!p || row.dataset.priority === p) && (!f || row.dataset.field === f);
        row.style.display = visible ? "" : "none";
      }
    }
    search.addEventListener("input", applyFilters);
    priority.addEventListener("change", applyFilters);
    field.addEventListener("change", applyFilters);
  </script>
</body>
</html>`;

await fs.writeFile(path.join(docsDir, "index.html"), html, "utf8");
console.log(`Built ${path.join(docsDir, "index.html")} with ${leads.length} leads.`);
