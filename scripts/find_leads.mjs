import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.dirname(path.dirname(__filename));
const dataDir = path.join(rootDir, "data");
const config = JSON.parse(await fs.readFile(path.join(rootDir, "search_config.json"), "utf8"));
const leadsPath = path.join(dataDir, "leads.json");
const today = new Date().toISOString().slice(0, 10);

const searchProfiles = [
  {
    field: "medicinal chemistry",
    query: '"PhD position" "medicinal chemistry" "fully funded"',
    siteQuery: "medicinal chemistry PhD studentship pharmacy",
    level: "PhD",
  },
  {
    field: "drug discovery",
    query: '"PhD studentship" "drug discovery" "international students"',
    siteQuery: "drug discovery PhD studentship chemical biology",
    level: "PhD",
  },
  {
    field: "computational drug discovery",
    query: '"computational drug discovery" "PhD position"',
    siteQuery: "computational drug discovery PhD molecular modelling",
    level: "PhD",
  },
  {
    field: "health informatics",
    query: '"health informatics" "PhD" "fully funded"',
    siteQuery: "health informatics PhD studentship health data science",
    level: "PhD",
  },
  {
    field: "digital health",
    query: '"digital health" "PhD studentship"',
    siteQuery: "digital health PhD studentship healthcare data",
    level: "PhD",
  },
  {
    field: "AI for health",
    query: '"AI for health" "PhD position" "health data"',
    siteQuery: "AI for health PhD machine learning healthcare",
    level: "PhD",
  },
  {
    field: "natural product chemistry",
    query: '"natural product chemistry" "PhD position"',
    siteQuery: "natural product chemistry PhD studentship metabolomics",
    level: "PhD",
  },
  {
    field: "neglected tropical diseases",
    query: '"leishmaniasis" "PhD position" "medicinal chemistry"',
    siteQuery: "leishmaniasis PhD drug discovery parasitology",
    level: "PhD",
  },
  {
    field: "molecular modelling",
    query: '"molecular docking" "ADMET" "PhD position"',
    siteQuery: "molecular docking ADMET PhD studentship computational chemistry",
    level: "PhD",
  },
  {
    field: "pharmaceutical supply chain",
    query: '"pharmaceutical supply chain" "PhD" "health systems"',
    siteQuery: "pharmaceutical supply chain PhD health systems data",
    level: "PhD",
  },
];

const eastAsiaInstitutions = [
  "Seoul National University",
  "KAIST",
  "Yonsei University",
  "Korea University",
  "POSTECH",
  "Sungkyunkwan University",
  "Hanyang University",
  "Ulsan National Institute of Science and Technology",
  "GIST",
  "Kyung Hee University",
  "University of Tokyo",
  "Kyoto University",
  "Osaka University",
  "Tohoku University",
  "Nagoya University",
  "Kyushu University",
  "Hokkaido University",
  "University of Tsukuba",
  "Institute of Science Tokyo",
  "Okinawa Institute of Science and Technology",
];

const eastAsiaSearchProfiles = eastAsiaInstitutions.flatMap((school) => [
  {
    field: "drug discovery",
    query: `"${school}" ("PhD" OR "doctoral" OR "graduate student") ("drug discovery" OR "medicinal chemistry" OR "pharmaceutical sciences")`,
    siteQuery: `${school} PhD doctoral graduate student drug discovery medicinal chemistry pharmaceutical sciences`,
    level: "PhD",
    sources: ["Google News", "Bing News"],
  },
  {
    field: "health informatics",
    query: `"${school}" ("PhD" OR "doctoral" OR "graduate student") ("health informatics" OR "digital health" OR "AI for health" OR "health data")`,
    siteQuery: `${school} PhD doctoral graduate student health informatics digital health AI health data`,
    level: "PhD",
    sources: ["Google News", "Bing News"],
  },
]);

const allSearchProfiles = [...searchProfiles, ...eastAsiaSearchProfiles];

const publicSources = [
  {
    name: "Google News",
    kind: "rss",
    url: (query) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
  },
  {
    name: "Bing News",
    kind: "rss",
    url: (query) => `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`,
  },
  {
    name: "jobs.ac.uk",
    kind: "html",
    url: (_query, profile) => `https://www.jobs.ac.uk/search/?keywords=${encodeURIComponent(profile.siteQuery || profile.query.replaceAll('"', ""))}`,
  },
  {
    name: "EURAXESS",
    kind: "html",
    url: (_query, profile) => `https://euraxess.ec.europa.eu/jobs/search?keywords=${encodeURIComponent(profile.siteQuery || profile.query.replaceAll('"', ""))}`,
  },
];

const scoringTerms = {
  funding: ["fully funded", "funded", "studentship", "stipend", "scholarship", "assistantship"],
  levels: ["phd", "dphil", "doctoral", "studentship", "msc", "mphil", "master"],
  profile: [
    "medicinal chemistry",
    "drug discovery",
    "computational",
    "docking",
    "admet",
    "natural product",
    "metabolomics",
    "health informatics",
    "digital health",
    "health data",
    "ai for health",
    "pharmacy",
    "pharmacology",
    "pharmaceutical",
  ],
  contact: ["email", "supervisor", "professor", "apply", "application"],
  opportunity: [
    "studentship",
    "position",
    "opportunity",
    "opening",
    "vacancy",
    "funded",
    "scholarship",
    "apply",
    "application",
    "doctoral candidate",
    "graduate student position",
    "research assistantship",
  ],
};

function decodeEntities(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(value) {
  return decodeEntities(String(value || "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|trk|fbclid|gclid|mc_)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return String(rawUrl || "").trim();
  }
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function inferLeadType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("studentship") || lower.includes("phd") || lower.includes("doctoral")) return "PhD advert";
  if (lower.includes("msc") || lower.includes("master")) return "MSc funding";
  if (lower.includes("scholarship")) return "Scholarship";
  if (lower.includes("professor") || lower.includes("supervisor")) return "Faculty profile";
  return "Other";
}

function inferFunding(text) {
  const lower = text.toLowerCase();
  if (lower.includes("fully funded")) return "Fully funded";
  if (lower.includes("studentship") || lower.includes("stipend") || lower.includes("funded")) return "Funded / verify";
  if (lower.includes("self-funded") || lower.includes("self funded")) return "Self-funded";
  return "Verify";
}

function inferInstitution(text) {
  const lower = text.toLowerCase();
  const target = config.priority_institutions.find((school) => lower.includes(school.toLowerCase()));
  if (target) return target;
  const university = text.match(/([A-Z][A-Za-z&.' -]{2,80}\b(?:University|Universite|Institute|College|School|Hospital|Centre|Center))/);
  return university ? university[1].trim() : "";
}

function parseDateParts(day, monthName, year = new Date().getUTCFullYear()) {
  const months = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };
  const month = months[String(monthName).toLowerCase()];
  if (month === undefined) return null;
  return new Date(Date.UTC(Number(year), month, Number(day)));
}

function parseDateValue(value) {
  const text = String(value || "").replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  let match = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (match) return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  match = text.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\b/);
  if (match) return parseDateParts(match[1], match[2], match[3]);
  match = text.match(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (match) return parseDateParts(match[2], match[1], match[3]);
  match = text.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\b/);
  if (match) return parseDateParts(match[1], match[2]);
  return null;
}

function inferDeadline(text) {
  const match = text.match(/\b(?:deadline|closes|expires|closing date|apply by|apply before|application deadline)[:\s-]*(.{0,50}?\b(?:\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}(?:\s+\d{4})?|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}))/i);
  if (!match) return "";
  const date = parseDateValue(match[1]);
  return date ? date.toISOString().slice(0, 10) : match[1].trim();
}

function hasExpiredDeadline(deadline) {
  if (!deadline) return false;
  const parsed = parseDateValue(deadline);
  if (!parsed || Number.isNaN(parsed.getTime())) return false;
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  return parsed < todayDate;
}

function scoreLead(text, profile) {
  const lower = text.toLowerCase();
  let score = 0;
  if (lower.includes(profile.field.toLowerCase())) score += 25;
  if (scoringTerms.profile.some((term) => lower.includes(term))) score += 20;
  if (scoringTerms.funding.some((term) => lower.includes(term))) score += 20;
  if (scoringTerms.levels.some((term) => lower.includes(term))) score += 15;
  if (config.priority_institutions.some((school) => lower.includes(school.toLowerCase()))) score += 10;
  if (scoringTerms.contact.some((term) => lower.includes(term))) score += 5;
  if (lower.includes("international")) score += 5;
  return Math.min(100, score);
}

function priorityForScore(score) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function isRelevant(text) {
  const lower = text.toLowerCase();
  const hasLevel = scoringTerms.levels.some((term) => lower.includes(term));
  const hasField = scoringTerms.profile.some((term) => lower.includes(term));
  const hasOpportunity = scoringTerms.opportunity.some((term) => lower.includes(term));
  const rejects = ["postdoctoral", "post-doc", "post doc", "lecturer", "professor job", "teacher", "weekly rundown", "workforce exodus"];
  return hasLevel && hasField && hasOpportunity && !rejects.some((term) => lower.includes(term));
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 compatible; AlimiOpportunityTracker/1.0; public academic opportunity monitor",
        accept: "text/html,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseRss(xml, source, profile) {
  const itemMatches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0, 12);
  return itemMatches
    .map((match) => {
      const item = match[0];
      const title = stripTags(item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
      const link = decodeEntities(stripTags(item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || ""));
      const description = stripTags(item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || "");
      const pubDate = stripTags(item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || "");
      return candidateLead({ source, profile, title, url: link, snippet: `${description} ${pubDate}` });
    })
    .filter(Boolean);
}

function sourceAllowsUrl(source, url, title) {
  const lowerTitle = title.toLowerCase();
  const blockedTitles = [
    "your account",
    "recruiters",
    "terms and conditions",
    "privacy policy",
    "legal notice",
    "cookies",
    "closing date",
    "date placed",
    "save",
    "login",
    "register",
  ];
  if (blockedTitles.some((blocked) => lowerTitle === blocked || lowerTitle.includes(blocked))) return false;
  try {
    const parsed = new URL(url);
    if (source.name === "jobs.ac.uk") return parsed.hostname.endsWith("jobs.ac.uk") && parsed.pathname.startsWith("/job/");
    if (source.name === "EURAXESS") return parsed.hostname.endsWith("euraxess.ec.europa.eu") && /^\/jobs\/[a-z0-9-]+/i.test(parsed.pathname);
    if (source.name === "FindAPhD") return parsed.hostname.endsWith("findaphd.com") && parsed.pathname.toLowerCase().includes("/phds/");
    return true;
  } catch {
    return false;
  }
}

function extractJobsAcUk(html, baseUrl, source, profile) {
  const leads = [];
  const anchors = [...html.matchAll(/<a\s+href=["'](\/job\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const match of anchors) {
    const rawHref = decodeEntities(match[1]);
    const title = stripTags(match[2]);
    const blockStart = html.lastIndexOf('<div class="j-search-result__result', match.index);
    const nextBlock = html.indexOf('<div class="j-search-result__result', match.index + 1);
    const block = html.slice(Math.max(0, blockStart), nextBlock > -1 ? nextBlock : match.index + 1800);
    let url = "";
    try {
      url = new URL(rawHref, baseUrl).toString();
    } catch {
      continue;
    }
    const lead = candidateLead({ source, profile, title, url, snippet: block });
    if (lead) leads.push(lead);
    if (leads.length >= 10) break;
  }
  return leads;
}

function parseHtml(html, baseUrl, source, profile) {
  if (source.name === "jobs.ac.uk") return extractJobsAcUk(html, baseUrl, source, profile);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const leads = [];
  for (const match of links) {
    const rawHref = decodeEntities(match[1]);
    const title = stripTags(match[2]);
    if (!title || title.length < 8) continue;
    let url = "";
    try {
      url = new URL(rawHref, baseUrl).toString();
    } catch {
      continue;
    }
    if (!sourceAllowsUrl(source, url, title)) continue;
    const idx = Math.max(0, match.index - 350);
    const snippet = stripTags(html.slice(idx, Math.min(html.length, match.index + 900)));
    const lead = candidateLead({ source, profile, title, url, snippet });
    if (lead) leads.push(lead);
    if (leads.length >= 10) break;
  }
  return leads;
}

function candidateLead({ source, profile, title, url, snippet }) {
  const normalizedUrl = normalizeUrl(url);
  const cleanSnippet = stripTags(snippet);
  const text = `${title} ${cleanSnippet}`;
  if (!sourceAllowsUrl(source, normalizedUrl, title)) return null;
  if (!normalizedUrl || !title || !isRelevant(text)) return null;
  if (/\bexpired\b/i.test(text)) return null;
  const deadline = inferDeadline(text);
  if (hasExpiredDeadline(deadline)) return null;
  const fitScore = scoreLead(text, profile);
  return {
    id: slug(normalizedUrl || `${source.name}-${title}`),
    first_found: today,
    last_seen: today,
    source: source.name,
    lead_type: inferLeadType(text),
    professor_or_contact_name: "",
    role_or_title: title,
    institution: inferInstitution(text),
    department_or_lab: "",
    country: "",
    field: profile.field,
    project_keywords: profile.query.replaceAll('"', ""),
    opportunity_level: profile.level,
    funding_status: inferFunding(text),
    deadline,
    start_date: "",
    email: "",
    profile_or_post_url: "",
    official_page_url: normalizedUrl,
    evidence_snippet: cleanSnippet.slice(0, 500),
    fit_score: fitScore,
    priority: priorityForScore(fitScore),
    outreach_status: "Not contacted",
    last_contacted: "",
    follow_up_date: "",
    next_action: "Read lab page",
    draft_email_notes: "",
    cv_version_sent: "",
    response_notes: "",
    search_query: profile.query,
  };
}

function existingLeadStillValid(lead) {
  const source = { name: lead.source || "" };
  const title = lead.role_or_title || "";
  const url = lead.official_page_url || lead.profile_or_post_url || "";
  const text = `${title} ${lead.evidence_snippet || ""}`;
  if (!sourceAllowsUrl(source, url, title)) return false;
  if (!isRelevant(text)) return false;
  if (hasExpiredDeadline(lead.deadline)) return false;
  return true;
}

async function loadExistingLeads() {
  try {
    return JSON.parse(await fs.readFile(leadsPath, "utf8"));
  } catch {
    return [];
  }
}

async function collectLeads() {
  const found = [];
  const errors = [];
  for (const profile of allSearchProfiles) {
    for (const source of publicSources) {
      if (profile.sources && !profile.sources.includes(source.name)) continue;
      const url = source.url(profile.query, profile);
      try {
        const text = await fetchText(url);
        const parsed = source.kind === "rss" ? parseRss(text, source, profile) : parseHtml(text, url, source, profile);
        found.push(...parsed);
      } catch (error) {
        errors.push({ source: source.name, query: profile.query, error: error.message });
      }
    }
  }
  return { found, errors };
}

await fs.mkdir(dataDir, { recursive: true });
const existing = (await loadExistingLeads()).filter(existingLeadStillValid);
const byId = new Map(existing.map((lead) => [lead.id, lead]));
const { found, errors } = await collectLeads();

for (const lead of found) {
  if (byId.has(lead.id)) {
    const current = byId.get(lead.id);
    byId.set(lead.id, {
      ...current,
      last_seen: today,
      fit_score: Math.max(Number(current.fit_score || 0), lead.fit_score),
      priority: priorityForScore(Math.max(Number(current.fit_score || 0), lead.fit_score)),
      evidence_snippet: current.evidence_snippet || lead.evidence_snippet,
    });
  } else {
    byId.set(lead.id, lead);
  }
}

const merged = [...byId.values()].sort((a, b) => {
  const scoreDiff = Number(b.fit_score || 0) - Number(a.fit_score || 0);
  if (scoreDiff) return scoreDiff;
  return String(b.last_seen || "").localeCompare(String(a.last_seen || ""));
});

await fs.writeFile(leadsPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

const summaryRows = [
  ["Date", today],
  ["Existing leads before run", existing.length],
  ["Candidates found this run", found.length],
  ["Total unique leads after dedupe", merged.length],
  ["Fetch errors", errors.length],
];

console.log(summaryRows.map((row) => row.map(csvEscape).join(",")).join("\n"));
if (errors.length) {
  console.error(JSON.stringify(errors.slice(0, 10), null, 2));
}
