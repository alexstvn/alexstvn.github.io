# Alexandria Stevenson — Portfolio (v2, data-driven)

## Structure
```
index.html              one-page site
assets/css/style.css     design system + layout
assets/js/main.js        loads /data/*.json and renders every section
data/
  projects.json          add a new project card by adding an entry here
  experience.json
  education.json
  interests.json          the "beyond my screen" deck
  skills.json
assets/img/               put real images here (see below)
```

## To finish setup, add these files (referenced by filename already in the code)
- `assets/img/icon.png` — used as the tab favicon + nav mark
- `assets/img/portrait.png` — your uncropped photo, shown in the pointed-arch frame on About Me
- `assets/img/seamlessbackground_simple.png` / `seamlessbackground_detailed.png` — the hero background currently references `seamlessbackground_detailed.png` at low opacity
- `assets/img/projects/*.png` — one preview image per project (paths are already set in `data/projects.json`)
- `assets/img/education/*.png` — school logos
- `assets/img/interests/*.jpg` — optional photos per interest (not yet wired into the card UI, currently icon+text only)

Until those exist, the site gracefully falls back to a labeled placeholder box instead of a broken image icon.

## Adding a new project
Just add an object to `data/projects.json` — no HTML editing required:
```json
{
  "id": "UniqueIDMonthYear",
  "title": "...",
  "shortDescription": "...",
  "longDescription": "...",
  "githubLink": "...",
  "techStack": ["..."],
  "month": "...", "year": 2026,
  "previewImage": "assets/img/projects/....png",
  "field": "...",
  "motivation": "..."
}
```
It will automatically appear in the carousel and become filterable by field/year.

## Running locally
Because the JS uses `fetch()` to load the JSON files, open it through a local server rather than double-clicking the file:
```
cd site
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

## Notes on real content still needed
- Real LinkedIn URL / GitHub username are placeholders — update in `index.html`'s connect buttons and footer, and in `data/experience.json`'s `company` fields.
- Project entries are drafted from your notes (PracticeMap, Buy Nothing Network, Comic-ify This Site, SEA Alumni Network, Personal Finance Tracker) with placeholder tech stacks/descriptions — refine freely, it's just JSON.
- Experience entries are placeholders (company name, dates) since none were in your notes — swap in your real roles.
