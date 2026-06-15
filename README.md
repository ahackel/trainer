# VokabelTrainer

A simple, static German→English vocabulary trainer.
Hosted at <https://andreashackel.de/trainer> (auto-deploys from `main`).

## How it works

- `index.html` is the whole app (HTML + CSS + JS).
- All vocabulary lives in one file, `data/vocabulary.json`, fetched at startup.
- The UI filters with three tabs: **Alle** (everything), **Kapitel** (pick a
  chapter from a dropdown), **Seiten** (a page-number range, from/to).

### Data format

```json
{
  "pages": [
    {
      "page": 238,
      "chapter": "Unit 5",
      "title": "Topic (optional)",
      "words": [
        { "de": "das Land", "en": "country" }
      ]
    }
  ]
}
```

`page` is a unique integer. `chapter` is a string or `null` (pages with `null`
don't appear in the Chapter dropdown). `de` is shown, `en` is what the learner
types — use `a / b` in `en` to accept multiple answers.

## Adding a page

Either ask Claude Code with a screenshot ("add a page from this") — it uses the
`add-page` skill in `.claude/skills/` — or by hand:

1. Add a page object to the `pages` array in `data/vocabulary.json` (keep it
   ordered by page number).
2. Run `npm run validate` (must print `✓`).
3. Commit & push. The live site updates within ~15s.

## Validation / safety net

`tools/validate.mjs` (`npm run validate`) checks `data/vocabulary.json`:
valid JSON, unique integer page numbers, `chapter` is a string or null, and a
non-empty `words` array with non-empty `de`/`en` on every entry.

A **pre-commit hook** (`.githooks/pre-commit`) runs it automatically and blocks
broken commits. Enable it once per clone:

```sh
git config core.hooksPath .githooks
```
