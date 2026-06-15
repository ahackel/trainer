---
name: add-page
description: Add a new vocabulary page to the trainer from a screenshot of an exercise book. Use when the user shares a photo/screenshot of vocabulary and wants it turned into a new page, or says "add a page" / "neue Seite".
---

# Add a vocabulary page from a screenshot

Turn a screenshot of an exercise-book vocabulary list into a new, validated page
in this trainer. Follow these steps exactly — the validator (`node tools/validate.mjs`)
is the gate, so nothing reaches the live site broken.

## Data model

Each page is one JSON file in `data/`, named `page-<number>.json`, and listed in
`data/manifest.json`. Schema:

```json
{
  "id": "page-238",
  "name": "Page 238 - Short topic",
  "description": "One-line description of the topic",
  "words": [
    { "de": "das Land", "en": "country" }
  ]
}
```

- `id` MUST equal the filename without `.json` (e.g. `page-238`).
- `de` is the German side, `en` is the English side (the trainer shows German, the
  learner types English). Keep the column order from the book — do not swap sides.
- Preserve the book's exact wording, including markers like `(to)`, `sth./sb.`,
  alternatives separated by `/`, and clarifying notes in parentheses. The app treats
  `/` as "either answer is accepted", so keep real alternatives as `a / b`.
- Do NOT invent, translate, correct, or reorder entries beyond what the book shows.
  If the book itself has a typo, transcribe it as-is (flag it to the user separately).

## Steps

1. **Determine the page number.** Use the page number printed in the book if visible.
   Otherwise pick `max(existing page numbers) + 1`. List `data/` to see what exists.
   If the user gave a number, use theirs.
2. **Transcribe** every German|English pair from the screenshot(s). If multiple
   screenshots are shared for one page, combine them in reading order. Double-check
   special characters (ä ö ü ß) and accents.
3. **Write** `data/page-<n>.json` using the schema above. Give it a short, descriptive
   `name` and `description` based on the topic.
4. **Register** it: add `"page-<n>.json"` to the `pages` array in `data/manifest.json`,
   keeping the array in ascending page order.
5. **Validate**: run `node tools/validate.mjs`. It must print `✓`. Fix any error it
   reports and re-run until clean. NEVER skip this step.
6. **Show the user** the transcribed word list (or a diff) and the chosen page number
   for confirmation before committing.
7. **Commit & push** once confirmed:
   `git add data/ && git commit -m "Add page <n>" && git push`.
   The pre-commit hook re-runs the validator; if it blocks, fix the data — do not use
   `--no-verify`. The live site auto-deploys from `main` within ~15s.

## Notes

- If a screenshot is blurry or a word is unreadable, ask the user rather than guessing.
- The trainer is fully data-driven: adding a page requires ONLY a new JSON file plus a
  manifest entry. Never edit `index.html` to add vocabulary.
