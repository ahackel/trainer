---
name: add-page
description: Add a new vocabulary page to the trainer from a screenshot of an exercise book. Use when the user shares a photo/screenshot of vocabulary and wants it turned into a new page, or says "add a page" / "neue Seite".
---

# Add a vocabulary page from a screenshot

Turn a screenshot of an exercise-book vocabulary list into a new, validated page
in this trainer. The validator (`node tools/validate.mjs`) is the gate — nothing
reaches the live site broken.

## Data model

All vocabulary lives in a single file, `data/vocabulary.json`:

```json
{
  "pages": [
    {
      "page": 238,
      "chapter": "Unit 5",
      "title": "Short topic (optional)",
      "words": [
        { "de": "das Land", "en": "country" }
      ]
    }
  ]
}
```

- `page` — integer page number, unique across the file. Required.
- `chapter` — the chapter/unit the page belongs to, as a string (e.g. "Unit 5",
  "Kapitel 3"). Use `null` if the screenshot does not show one — do NOT invent it.
  The UI builds the Chapter dropdown from the distinct non-null chapters.
- `title` — optional short topic label for reference.
- `de` is the German side, `en` is what the learner types. Keep the book's column
  order — do not swap sides. Use `a / b` in `en` to accept multiple answers.
- Preserve the book's exact wording, including markers like `(to)`, `sth./sb.`, and
  parenthetical notes. Do NOT invent, translate, correct, or reorder entries beyond
  what the book shows. Transcribe typos as-is and flag them to the user separately.

## Steps

1. **Determine the page number** from the book if visible; otherwise use
   `max(existing page numbers) + 1`. If the user gave a number, use theirs.
2. **Determine the chapter** from the screenshot (chapter/unit heading). If none is
   visible, set `chapter` to `null` and mention that to the user.
3. **Transcribe** every German|English pair. Combine multiple screenshots for one
   page in reading order. Double-check ä ö ü ß and accents.
4. **Insert** a new page object into the `pages` array in `data/vocabulary.json`,
   keeping the array ordered by page number.
5. **Validate & build**: run `npm run build` (validates, then regenerates
   `data/vocabulary.js` from the JSON). It must print both `✓` lines. Fix any
   reported error and re-run until clean. NEVER skip this step — the site loads
   `data/vocabulary.js`, so without the rebuild new words won't appear.
6. **Show the user** the transcribed word list, page number, and chapter for
   confirmation before committing.
7. **Commit & push** once confirmed (stage both the JSON source and the generated JS):
   `git add data/ && git commit -m "Add page <n>" && git push`.
   The live site auto-deploys from `main` within ~15s.

## Notes

- If a screenshot is blurry or a word is unreadable, ask the user rather than guessing.
- Adding vocabulary requires editing ONLY `data/vocabulary.json`. Never touch
  `index.html`.
