#!/usr/bin/env node
// Generates data/vocabulary.js from data/vocabulary.json.
//
// The browser loads the vocabulary via a plain <script> tag rather than fetch(),
// so the trainer works under file:// (opening index.html directly, or running it
// offline on the iPad home screen) as well as when served over http(s). fetch()
// is blocked for local files, which is why a generated JS wrapper is used.
//
// Run with: node tools/build-data.mjs  (or: npm run build)
// data/vocabulary.json stays the single source of truth — never edit the .js by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const jsonPath = join(dataDir, 'vocabulary.json');
const jsPath = join(dataDir, 'vocabulary.js');

// Parse to guarantee valid JSON, then re-emit pretty-printed for a clean diff.
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const banner =
  '// GENERATED FILE — do not edit. Source: data/vocabulary.json. Rebuild: npm run build\n';
writeFileSync(jsPath, banner + 'window.VOCABULARY = ' + JSON.stringify(data, null, 2) + ';\n');

console.log('✓ Wrote data/vocabulary.js');
