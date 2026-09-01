import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "outputs");
const config = JSON.parse(await fs.readFile(path.join(__dirname, "search_config.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);
let automatedLeads = [];
try {
  automatedLeads = JSON.parse(await fs.readFile(path.join(__dirname, "data", "leads.json"), "utf8"));
} catch {
  automatedLeads = [];
}

const linkedinSearches = [
  {
    category: "Posts",
    name: "Medicinal Chemistry PhD/MSc Openings",
    cadence: "Daily",
    query:
      '("PhD position" OR "PhD opportunity" OR "PhD studentship" OR "doctoral position") AND ("medicinal chemistry" OR "drug discovery" OR "chemical biology") AND (funded OR "fully funded" OR studentship)',
  },
  {
    category: "Posts",
    name: "Computational Drug Discovery",
    cadence: "Twice weekly",
    query:
      '("PhD position" OR "PhD opportunity" OR "doctoral researcher") AND ("computational drug discovery" OR "computer-aided drug design" OR "molecular docking" OR ADMET)',
  },
  {
    category: "Posts",
    name: "Natural Products and Metabolomics",
    cadence: "Twice weekly",
    query:
      '("PhD position" OR "graduate student" OR "master\'s student") AND ("natural product chemistry" OR metabolomics OR phytochemistry OR "mass spectrometry")',
  },
  {
    category: "Posts",
    name: "Neglected Tropical Diseases / Parasitology",
    cadence: "Twice weekly",
    query:
      '("PhD position" OR "doctoral position" OR "graduate student") AND (leishmaniasis OR "neglected tropical disease" OR antiparasitic OR parasitology) AND ("drug discovery" OR "medicinal chemistry")',
  },
  {
    category: "Posts",
    name: "Health Informatics / Digital Health",
    cadence: "Daily",
    query:
      '("PhD position" OR "MSc" OR "master\'s student" OR "graduate student") AND ("health informatics" OR "digital health" OR "clinical informatics" OR "public health informatics")',
  },
  {
    category: "Posts",
    name: "AI for Health / Health Data Engineering",
    cadence: "Twice weekly",
    query:
      '("PhD position" OR "graduate student" OR "research assistant") AND ("AI for health" OR "machine learning for healthcare" OR "health data" OR "data engineering") AND (healthcare OR pharmacy OR "supply chain")',
  },
  {
    category: "Posts",
    name: "Professor Hiring Student Posts",
    cadence: "Daily",
    query:
      '("I am looking for" OR "we are looking for" OR "join my lab" OR "join our lab") AND ("PhD student" OR "master\'s student" OR "graduate student") AND ("drug discovery" OR "medicinal chemistry" OR "health informatics" OR "digital health")',
  },
  {
    category: "People",
    name: "Medicinal Chemistry Professors",
    cadence: "Daily",
    query:
      '("Professor of Medicinal Chemistry" OR "Associate Professor of Medicinal Chemistry" OR "Assistant Professor of Medicinal Chemistry" OR "Medicinal Chemistry Professor")',
  },
  {
    category: "People",
    name: "Computational Chemistry / Molecular Modelling Professors",
    cadence: "Twice weekly",
    query:
      '("Professor" OR "Associate Professor" OR "Assistant Professor") AND ("computational chemistry" OR "molecular modelling" OR "molecular dynamics" OR "computer-aided drug design")',
  },
  {
    category: "People",
    name: "Health Informatics Professors",
    cadence: "Daily",
    query:
      '("Professor" OR "Associate Professor" OR "Assistant Professor") AND ("health informatics" OR "clinical informatics" OR "public health informatics" OR "digital health")',
  },
  {
    category: "People",
    name: "Current PhD Students - Drug Discovery",
    cadence: "Daily",
    query:
      '("PhD student" OR "Doctoral student" OR "DPhil student") AND ("medicinal chemistry" OR "drug discovery" OR "chemical biology" OR "computational chemistry")',
  },
  {
    category: "People",
    name: "Current PhD Students - Health Informatics",
    cadence: "Daily",
    query:
      '("PhD student" OR "Doctoral student") AND ("health informatics" OR "digital health" OR "AI for health" OR "biomedical informatics")',
  },
  ...["University of Oxford", "University of Cambridge", "University of Toronto", "University of Michigan"].flatMap((school) => [
    {
      category: "Posts",
      name: `${school} - Drug Discovery`,
      cadence: "Twice weekly",
      query: `("${school}") AND ("PhD position" OR "DPhil" OR "PhD studentship" OR "graduate student") AND ("medicinal chemistry" OR "computational chemistry" OR "chemical biology" OR "drug discovery")`,
    },
    {
      category: "Posts",
      name: `${school} - Health Informatics`,
      cadence: "Twice weekly",
      query: `("${school}") AND ("health informatics" OR "digital health" OR "AI for health" OR "health data") AND ("PhD" OR "DPhil" OR "MSc" OR "MPhil")`,
    },
  ]),
];

const publicSearches = [
  '"PhD position" "medicinal chemistry" "fully funded"',
  '"PhD studentship" "drug discovery" "international students"',
  '"computational drug discovery" "PhD position"',
  '"health informatics" "PhD" "fully funded"',
  '"digital health" "PhD studentship"',
  '"AI for health" "PhD position" "health data"',
  '"natural product chemistry" "PhD position"',
  '"leishmaniasis" "PhD position" "medicinal chemistry"',
  '"molecular docking" "ADMET" "PhD position"',
  '"pharmaceutical supply chain" "PhD" "health systems"',
  ...config.priority_institutions.map((school) => `"${school}" "PhD position" "medicinal chemistry"`),
  ...config.priority_institutions.map((school) => `"${school}" "health informatics" "PhD"`),
];

const leadHeaders = config.tracker_columns;
const leadFieldMap = {
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

function leadValue(lead, header) {
  const field = leadFieldMap[header];
  return field ? lead[field] || "" : "";
}

function linkedInUrl(category, query) {
  const pathPart = category === "People" ? "people" : "content";
  return `https://www.linkedin.com/search/results/${pathPart}/?keywords=${encodeURIComponent(query)}&origin=GLOBAL_SEARCH_HEADER`;
}

function googleUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function addTitle(sheet, title, subtitle, width) {
  sheet.getRangeByIndexes(0, 0, 1, width).merge();
  sheet.getCell(0, 0).values = [[title]];
  sheet.getCell(0, 0).format = {
    fill: "#0B2545",
    font: { bold: true, color: "#FFFFFF", size: 16 },
    horizontalAlignment: "left",
  };
  sheet.getRangeByIndexes(1, 0, 1, width).merge();
  sheet.getCell(1, 0).values = [[subtitle]];
  sheet.getCell(1, 0).format = {
    fill: "#E8EEF5",
    font: { color: "#1F3A5F", size: 10 },
    wrapText: true,
  };
  sheet.getRangeByIndexes(0, 0, 2, width).format.borders = {
    preset: "outside",
    style: "thin",
    color: "#9FB3C8",
  };
}

function styleHeader(range) {
  range.format = {
    fill: "#1F4D78",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, idx) => {
    sheet.getRangeByIndexes(0, idx, 1, 1).format.columnWidth = width;
  });
}

const workbook = Workbook.create();
workbook.comments.setSelf({ displayName: "Alimi Muhammad Adewale" });

const dashboard = workbook.worksheets.add("Dashboard");
const leads = workbook.worksheets.add("Leads");
const searchBank = workbook.worksheets.add("Search Bank");
const sourcePlan = workbook.worksheets.add("Public Source Plan");
const manual = workbook.worksheets.add("Manual LinkedIn Capture");
const templates = workbook.worksheets.add("Outreach Templates");
const scoring = workbook.worksheets.add("Scoring Guide");
const lists = workbook.worksheets.add("Lists");

for (const sheet of [dashboard, leads, searchBank, sourcePlan, manual, templates, scoring, lists]) {
  sheet.showGridLines = false;
}

// Dashboard
addTitle(
  dashboard,
  "PhD/MSc Opportunity Tracker",
  `Built for ${config.candidate.name}. Manual LinkedIn capture + public-source lead tracking. Generated ${today}.`,
  8,
);
dashboard.getRange("A4:B12").values = [
  ["Metric", "Value"],
  ["Total leads", ""],
  ["High-fit leads (80+)", ""],
  ["Ready to send", ""],
  ["Follow-up due or soon", ""],
  ["Replies", ""],
  ["Applications submitted", ""],
  ["Archived", ""],
  ["Last generated", today],
];
styleHeader(dashboard.getRange("A4:B4"));
dashboard.getRange("B5:B11").formulas = [
  ['=COUNTIF(Leads!P5:P124,"?*")'],
  ['=COUNTIF(Leads!S5:S124,">=80")'],
  ['=COUNTIF(Leads!U5:U124,"Ready to send")'],
  ['=COUNTIF(Leads!U5:U124,"Follow-up due")'],
  ['=COUNTIF(Leads!U5:U124,"Replied")'],
  ['=COUNTIF(Leads!U5:U124,"Applied")'],
  ['=COUNTIF(Leads!U5:U124,"Archived")'],
];
dashboard.getRange("B12").values = [[today]];
dashboard.getRange("A4:B12").format.borders = { preset: "all", style: "thin", color: "#D9E2EF" };
dashboard.getRange("A5:A12").format = { fill: "#F7FAFC", font: { bold: true } };
setWidths(dashboard, [26, 18, 4, 24, 24, 24, 24, 24]);

dashboard.getRange("D4:H12").values = [
  ["Daily Manual Routine", "Target", "Output", "Status", "Notes"],
  ["Run 3 LinkedIn post searches", "Posts", "Add links only", "Manual", "Use LinkedIn filters: Posts + Latest"],
  ["Run 2 LinkedIn people searches", "People", "Student/professor leads", "Manual", "Filter by target school"],
  ["Review public-source queries", "Public web", "Official adverts", "Automatable", "Use search URLs or future API"],
  ["Score new leads", "Fit score", "Priority", "Manual", "80+ = high fit"],
  ["Draft outreach", "Professors/students", "Email/message", "Manual", "Do not bulk-message"],
  ["Follow up", "7-10 days", "Updated status", "Manual", "One polite follow-up"],
  ["Archive weak leads", "Low fit", "Clean pipeline", "Manual", "Keep notes brief"],
  ["Refresh keyword bank", "Monthly", "New searches", "Manual", "Add new program terms"],
];
styleHeader(dashboard.getRange("D4:H4"));
dashboard.getRange("D4:H12").format.borders = { preset: "all", style: "thin", color: "#D9E2EF" };
dashboard.getRange("D5:H12").format.wrapText = true;

// Leads table
addTitle(leads, "Leads", "Main working table. Add LinkedIn links manually; use public-source rows for automatable searches.", leadHeaders.length);
leads.getRangeByIndexes(3, 0, 1, leadHeaders.length).values = [leadHeaders];
styleHeader(leads.getRangeByIndexes(3, 0, 1, leadHeaders.length));
const reservedLeadRows = Math.max(120, automatedLeads.length + 25);
const automatedRows = automatedLeads.map((lead) => leadHeaders.map((header) => leadValue(lead, header)));
const blankRows = Array.from({ length: reservedLeadRows - automatedRows.length }, () => Array(leadHeaders.length).fill(""));
const leadRows = [...automatedRows, ...blankRows];
leads.getRangeByIndexes(4, 0, leadRows.length, leadHeaders.length).values = leadRows;
leads.tables.add(`A4:AA${4 + leadRows.length}`, true, "LeadsTable");
leads.freezePanes.freezeRows(4);
setWidths(leads, [12, 16, 18, 24, 22, 24, 24, 14, 22, 30, 16, 16, 12, 12, 22, 36, 36, 40, 10, 12, 16, 13, 13, 18, 30, 20, 36]);
leads.getRange("A5:A124").setNumberFormat("yyyy-mm-dd");
leads.getRange("M5:N124").setNumberFormat("yyyy-mm-dd");
leads.getRange("V5:W124").setNumberFormat("yyyy-mm-dd");
leads.getRange("S5:S124").setNumberFormat("0");
leads.getRange("A5:AA124").format.wrapText = true;
leads.getRange("C5:C124").dataValidation = { rule: { type: "list", values: config.lead_types } };
leads.getRange("T5:T124").dataValidation = { rule: { type: "list", values: ["High", "Medium", "Low", "Watch"] } };
leads.getRange("U5:U124").dataValidation = { rule: { type: "list", values: config.outreach_statuses } };
leads.getRange("X5:X124").dataValidation = { rule: { type: "list", values: config.next_actions } };
leads.getRange("S5:S124").conditionalFormats.add("cellIs", { operator: "greaterThanOrEqual", formula: 80, format: { fill: "#DCFCE7", font: { bold: true, color: "#166534" } } });
leads.getRange("S5:S124").conditionalFormats.add("cellIs", { operator: "between", formula: [60, 79], format: { fill: "#FEF9C3", font: { color: "#854D0E" } } });
leads.getRange("S5:S124").conditionalFormats.add("cellIs", { operator: "lessThan", formula: 60, format: { fill: "#FEE2E2", font: { color: "#991B1B" } } });

// Search bank
const searchHeaders = ["Category", "Search Name", "Cadence", "Boolean Query", "Manual LinkedIn URL", "Notes"];
addTitle(searchBank, "LinkedIn Manual Search Bank", "Paste the Boolean query into LinkedIn or open the generated URL manually. No automated LinkedIn scraping.", searchHeaders.length);
searchBank.getRangeByIndexes(3, 0, 1, searchHeaders.length).values = [searchHeaders];
styleHeader(searchBank.getRangeByIndexes(3, 0, 1, searchHeaders.length));
const searchRows = linkedinSearches.map((s) => [s.category, s.name, s.cadence, s.query, linkedInUrl(s.category, s.query), "Manual search only"]);
searchBank.getRangeByIndexes(4, 0, searchRows.length, searchHeaders.length).values = searchRows;
searchBank.tables.add(`A4:F${4 + searchRows.length}`, true, "LinkedInSearchesTable");
searchBank.freezePanes.freezeRows(4);
setWidths(searchBank, [14, 38, 16, 92, 80, 24]);
searchBank.getRangeByIndexes(4, 0, searchRows.length, searchHeaders.length).format.wrapText = true;

// Public source plan
const publicHeaders = ["Cadence", "Search Query", "Google URL", "Best Sources", "Lead Type", "Notes"];
addTitle(sourcePlan, "Public Source Search Plan", "Use this for compliant daily/weekly web discovery outside LinkedIn.", publicHeaders.length);
sourcePlan.getRangeByIndexes(3, 0, 1, publicHeaders.length).values = [publicHeaders];
styleHeader(sourcePlan.getRangeByIndexes(3, 0, 1, publicHeaders.length));
const publicRows = publicSearches.map((query, idx) => [
  idx < 10 ? "Daily" : "Weekly",
  query,
  googleUrl(query),
  config.public_sources.join(", "),
  query.includes("MSc") || query.includes("master") ? "MSc funding" : "PhD advert",
  "Review official pages first; paste final source URL into Leads.",
]);
sourcePlan.getRangeByIndexes(4, 0, publicRows.length, publicHeaders.length).values = publicRows;
sourcePlan.tables.add(`A4:F${4 + publicRows.length}`, true, "PublicSearchesTable");
sourcePlan.freezePanes.freezeRows(4);
setWidths(sourcePlan, [14, 68, 80, 42, 18, 42]);
sourcePlan.getRangeByIndexes(4, 0, publicRows.length, publicHeaders.length).format.wrapText = true;

// Manual capture helper
addTitle(manual, "Manual LinkedIn Capture", "Paste only user-selected LinkedIn links here, then transfer strong leads into the Leads sheet.", 6);
manual.getRange("A4:F4").values = [["Date Captured", "LinkedIn URL", "Person/Post", "Why it matters", "Next action", "Transferred to Leads?"]];
styleHeader(manual.getRange("A4:F4"));
manual.getRange("A5:F104").values = Array.from({ length: 100 }, () => ["", "", "", "", "", ""]);
manual.tables.add("A4:F104", true, "ManualLinkedInCaptureTable");
manual.freezePanes.freezeRows(4);
manual.getRange("A5:A104").setNumberFormat("yyyy-mm-dd");
manual.getRange("E5:E104").dataValidation = { rule: { type: "list", values: config.next_actions } };
manual.getRange("F5:F104").dataValidation = { rule: { type: "list", values: ["No", "Yes"] } };
setWidths(manual, [14, 60, 28, 60, 18, 20]);
manual.getRange("A5:F104").format.wrapText = true;

// Outreach templates
addTitle(templates, "Outreach Templates", "Starting points for careful, non-bulk outreach. Always tailor before sending.", 4);
templates.getRange("A4:D4").values = [["Audience", "Use Case", "Subject / Opener", "Template"]];
styleHeader(templates.getRange("A4:D4"));
templates.getRange("A5:D8").values = [
  [
    "Professor",
    "Cold email",
    "Prospective PhD applicant - [field/project overlap]",
    "Dear Professor [Name], I am Alimi Muhammad Adewale, a Pharmaceutical Sciences graduate from Nigeria with research experience in natural products, HR-LCMS metabolomics, molecular docking, ADMET, and health data analytics. I am writing because your work on [specific lab topic] aligns strongly with my interest in [specific field]. I would be grateful to know whether you may be accepting PhD/MSc students for [term/year], or whether there is a suitable application route I should follow. I have attached my CV and would be happy to share a short research statement.",
  ],
  [
    "Professor",
    "Follow-up",
    "Follow-up on prospective PhD/MSc inquiry",
    "Dear Professor [Name], I hope you are well. I wanted to politely follow up on my previous email about potential PhD/MSc opportunities in your group. I remain very interested in your work on [specific topic] and would be grateful for any guidance on whether my background may be a fit. Thank you again for your time.",
  ],
  [
    "Student",
    "LinkedIn message",
    "Short networking opener",
    "Hello [Name], I am Alimi, a pharmaceutical sciences graduate from Nigeria interested in [field] and exploring graduate study at [school]. I saw that you are working/studying in this area and would be grateful for one or two pieces of advice about the programme, lab culture, or application process. Thank you.",
  ],
  [
    "Lab/admin",
    "Application route",
    "Inquiry about [programme/lab] graduate opportunities",
    "Dear [Name/Team], I am interested in graduate opportunities related to [field] at [institution/lab]. Could you please advise on the correct application route, deadlines, and whether international applicants are eligible for funding? Thank you.",
  ],
];
templates.getRange("A5:D8").format.wrapText = true;
setWidths(templates, [18, 18, 42, 100]);

// Scoring guide
addTitle(scoring, "Scoring Guide", "Use fit score and priority to keep outreach focused.", 5);
scoring.getRange("A4:E4").values = [["Criterion", "Score Range", "High Score Signal", "Low Score Signal", "Notes"]];
styleHeader(scoring.getRange("A4:E4"));
scoring.getRange("A5:E11").values = [
  ["Field fit", "0-25", "Medicinal chemistry, CADD, health informatics, AI for health", "Unrelated field", "Most important factor"],
  ["Funding fit", "0-20", "Fully funded / stipend / assistantship", "Self-funded only", "Be realistic about affordability"],
  ["Profile fit", "0-20", "Needs pharmacy, data, docking, ADMET, healthtech, or LMIC perspective", "Requires unavailable wet-lab specialty only", "Match your evidence"],
  ["Institution/lab fit", "0-15", "Target school or strong lab", "No clear supervisor/lab", "Target labs first"],
  ["Deadline/timing", "0-10", "Open now, start date feasible", "Closed or unclear", "Keep deadline visible"],
  ["Contactability", "0-10", "Email available and role clear", "No route to contact", "Find official email"],
  ["Priority rule", "Total", "80+ High, 60-79 Medium, below 60 Low", "Archive weak leads", "Do fewer, better emails"],
];
scoring.tables.add("A4:E11", true, "ScoringGuideTable");
scoring.getRange("A5:E11").format.wrapText = true;
setWidths(scoring, [26, 14, 50, 42, 34]);

// Lists for reference
addTitle(lists, "Lists", "Dropdown source values and profile facts.", 4);
lists.getRange("A4:D4").values = [["Lead Types", "Outreach Statuses", "Next Actions", "Target Fields"]];
styleHeader(lists.getRange("A4:D4"));
const maxLen = Math.max(config.lead_types.length, config.outreach_statuses.length, config.next_actions.length, config.fields.length);
const listRows = Array.from({ length: maxLen }, (_, i) => [
  config.lead_types[i] || "",
  config.outreach_statuses[i] || "",
  config.next_actions[i] || "",
  config.fields[i] || "",
]);
lists.getRangeByIndexes(4, 0, listRows.length, 4).values = listRows;
lists.tables.add(`A4:D${4 + listRows.length}`, true, "ListsTable");
setWidths(lists, [24, 24, 24, 36]);

// Visual verification previews
await fs.mkdir(outputDir, { recursive: true });
for (const sheetName of ["Dashboard", "Leads", "Search Bank", "Public Source Plan"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replaceAll(" ", "_")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const inspect = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 6000,
  tableMaxRows: 5,
  tableMaxCols: 8,
});
console.log(inspect.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "phd_msc_opportunity_tracker.xlsx");
await output.save(outputPath);

await fs.writeFile(
  path.join(outputDir, "linkedin_search_urls.csv"),
  [
    "Category,Search Name,Cadence,Boolean Query,Manual LinkedIn URL",
    ...linkedinSearches.map((s) =>
      [s.category, s.name, s.cadence, s.query, linkedInUrl(s.category, s.query)]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n"),
  "utf8",
);

console.log(`SAVED ${outputPath}`);
process.exit(0);
