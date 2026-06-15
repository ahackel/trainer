#!/usr/bin/env node
// Validates the vocabulary data so a broken file can never reach the live site.
// Run with: node tools/validate.mjs  (or: npm run validate)
//
// Checks:
//   - data/manifest.json is valid JSON with a non-empty "pages" array
//   - every file listed in the manifest exists and is valid JSON
//   - every page has: id (matching its filename), name, and a non-empty
//     "words" array where each entry has non-empty "de" and "en" strings
//   - no page file on disk is missing from the manifest (and vice versa)
//   - no duplicate ids
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const errors = [];
const err = (msg) => errors.push(msg);

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    err(`${label}: invalid JSON — ${e.message}`);
    return null;
  }
}

const manifestPath = join(dataDir, 'manifest.json');
const manifest = existsSync(manifestPath) ? readJson(manifestPath, 'manifest.json') : (err('manifest.json is missing'), null);

const listed = manifest && Array.isArray(manifest.pages) ? manifest.pages : null;
if (manifest && !listed) err('manifest.json: "pages" must be an array');
if (listed && listed.length === 0) err('manifest.json: "pages" is empty');

const onDisk = existsSync(dataDir)
  ? readdirSync(dataDir).filter((f) => /^page-\d+\.json$/.test(f))
  : [];

// Manifest vs. disk consistency.
for (const f of listed || []) {
  if (!onDisk.includes(f)) err(`manifest lists "${f}" but data/${f} does not exist`);
}
for (const f of onDisk) {
  if (listed && !listed.includes(f)) err(`data/${f} exists but is not listed in manifest.json`);
}

// Per-page structural validation.
const seenIds = new Set();
for (const file of listed || []) {
  const path = join(dataDir, file);
  if (!existsSync(path)) continue; // already reported above
  const set = readJson(path, file);
  if (!set) continue;

  const expectedId = file.replace(/\.json$/, '');
  if (set.id !== expectedId) err(`${file}: "id" is "${set.id}", expected "${expectedId}"`);
  if (seenIds.has(set.id)) err(`${file}: duplicate id "${set.id}"`);
  seenIds.add(set.id);

  if (typeof set.name !== 'string' || !set.name.trim()) err(`${file}: "name" must be a non-empty string`);
  if (!Array.isArray(set.words) || set.words.length === 0) {
    err(`${file}: "words" must be a non-empty array`);
    continue;
  }
  set.words.forEach((w, i) => {
    if (!w || typeof w.de !== 'string' || !w.de.trim()) err(`${file}: words[${i}] has empty "de"`);
    if (!w || typeof w.en !== 'string' || !w.en.trim()) err(`${file}: words[${i}] has empty "en"`);
  });
}

if (errors.length) {
  console.error(`✗ Vocabulary validation failed (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
const total = (listed || []).length;
console.log(`✓ Vocabulary OK: ${total} page${total === 1 ? '' : 's'}, ${seenIds.size} unique ids.`);
