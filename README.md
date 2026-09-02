# PhD/MSc Opportunity Tracker

This folder contains a practical, account-safe workflow for finding PhD/MSc opportunities and student/professor contacts.

## Files

- `linkedin_boolean_searches.md` - manual LinkedIn Boolean searches for posts, professors, and students.
- `search_config.json` - your target fields, institutions, tracker columns, statuses, and dropdown values.
- `build_tracker.mjs` - generates the Excel tracker and LinkedIn/public search URL list.
- `outputs/phd_msc_opportunity_tracker.xlsx` - the main workbook.
- `outputs/linkedin_search_urls.csv` - quick copy/open list of LinkedIn manual search URLs.

## Daily Routine

1. Open `linkedin_boolean_searches.md`.
2. Run 3-5 searches manually in LinkedIn.
3. Filter results to `Posts` for opportunities and `People` for professors/students.
4. Copy only promising post/profile URLs into the `Manual LinkedIn Capture` sheet.
5. Transfer strong leads into the `Leads` sheet and score them.
6. Use the outreach templates as starting points for cold emails or LinkedIn messages.

## Scoring Rule

- 80-100: High priority. Tailor outreach quickly.
- 60-79: Medium priority. Review lab page before deciding.
- Below 60: Low priority or archive.

## Regional Expansion

The tracker includes South Korea and Japan targets for medicinal chemistry, drug discovery, pharmaceutical sciences, health informatics, digital health, and AI for health.

South Korea priority searches currently include Seoul National University, KAIST, Yonsei University, Korea University, POSTECH, Sungkyunkwan University, Hanyang University, UNIST, GIST, and Kyung Hee University.

Japan priority searches currently include the University of Tokyo, Kyoto University, Osaka University, Tohoku University, Nagoya University, Kyushu University, Hokkaido University, University of Tsukuba, Institute of Science Tokyo, and Okinawa Institute of Science and Technology.

## LinkedIn Safety Rule

Do not automate LinkedIn scraping, bulk profile extraction, or automated messaging. Keep LinkedIn human-in-the-loop: search manually, choose leads manually, then paste selected URLs into the tracker.

## Regenerate Workbook

From this folder:

```powershell
& 'C:\Users\HOB\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\build_tracker.mjs'
```

The builder uses the bundled Codex spreadsheet runtime and writes outputs to `outputs/`.
