#!/usr/bin/env node
// Validates the vocabulary data so a broken file can never reach the live site.
// Run with: node tools/validate.mjs  (or: npm run validate)
//
// Data lives in data/vocabulary.json:
//   { "pages": [ { "page": 230, "chapter": <string|null>, "title": <string?>,
//                  "words": [ { "de": "...", "en": "..." } ] } ] }
//
// Checks:
//   - file exists and is valid JSON with a non-empty "pages" array
//   - every page has an integer "page" number (unique across the file)
//   - "chapter" is a non-empty string or null
//   - "words" is a non-empty array; each entry has non-empty "de" and "en"
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dataPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'vocabulary.json');
const errors = [];
const err = (msg) => errors.push(msg);

let data = null;
if (!existsSync(dataPath)) {
  err('data/vocabulary.json is missing');
} else {
  try {
    data = JSON.parse(readFileSync(dataPath, 'utf8'));
  } catch (e) {
    err('data/vocabulary.json: invalid JSON — ' + e.message);
  }
}

const pages = data && Array.isArray(data.pages) ? data.pages : null;
if (data && !pages) err('"pages" must be an array');
if (pages && pages.length === 0) err('"pages" is empty');

const seenPages = new Set();
for (const [i, p] of (pages || []).entries()) {
  const where = `pages[${i}]`;
  if (!p || typeof p !== 'object') {
    err(`${where}: must be an object`);
    continue;
  }
  if (!Number.isInteger(p.page)) {
    err(`${where}: "page" must be an integer`);
  } else if (seenPages.has(p.page)) {
    err(`${where}: duplicate page number ${p.page}`);
  } else {
    seenPages.add(p.page);
  }

  if (!(p.chapter === null || (typeof p.chapter === 'string' && p.chapter.trim()))) {
    err(`page ${p.page}: "chapter" must be a non-empty string or null`);
  }
  if (p.title !== undefined && p.title !== null && typeof p.title !== 'string') {
    err(`page ${p.page}: "title" must be a string when present`);
  }

  if (!Array.isArray(p.words) || p.words.length === 0) {
    err(`page ${p.page}: "words" must be a non-empty array`);
    continue;
  }
  p.words.forEach((w, j) => {
    if (!w || typeof w.de !== 'string' || !w.de.trim()) err(`page ${p.page} words[${j}]: empty "de"`);
    if (!w || typeof w.en !== 'string' || !w.en.trim()) err(`page ${p.page} words[${j}]: empty "en"`);
  });
}

if (errors.length) {
  console.error(`✗ Vocabulary validation failed (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
const totalWords = (pages || []).reduce((n, p) => n + p.words.length, 0);
const chapters = new Set((pages || []).map((p) => p.chapter).filter((c) => c != null));
console.log(`✓ Vocabulary OK: ${seenPages.size} pages, ${chapters.size} chapters, ${totalWords} words.`);
