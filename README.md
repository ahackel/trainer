# VokabelTrainer

A simple, static German→English vocabulary trainer.
Hosted at <https://andreashackel.de/trainer> (auto-deploys from `main`).

## How it works

- `index.html` is the whole app (HTML + CSS + JS).
- Vocabulary lives in `data/`. Each page is one JSON file (`data/page-<n>.json`)
  and is listed in `data/manifest.json`. The app fetches the manifest at startup,
  then loads each page. A missing or malformed page is **skipped** with a console
  error instead of breaking the rest of the app.

### Page format

```json
{
  "id": "page-238",
  "name": "Page 238 - Topic",
  "description": "Short description",
  "words": [
    { "de": "das Land", "en": "country" }
  ]
}
```

`id` must match the filename. `de` is shown, `en` is what the learner types.
Use `a / b` in `en` to accept multiple answers.

## Adding a page

Either ask Claude Code with a screenshot ("add a page from this") — it uses the
`add-page` skill in `.claude/skills/` — or by hand:

1. Create `data/page-<n>.json` (see format above).
2. Add `"page-<n>.json"` to `pages` in `data/manifest.json` (keep it ordered).
3. Run `npm run validate` (must print `✓`).
4. Commit & push. The live site updates within ~15s.

## Validation / safety net

`tools/validate.mjs` (`npm run validate`) checks every page and the manifest:
valid JSON, required fields, `id` matches filename, no duplicates, no empty
entries, manifest and disk in sync.

A **pre-commit hook** (`.githooks/pre-commit`) runs it automatically and blocks
broken commits. Enable it once per clone:

```sh
git config core.hooksPath .githooks
```
