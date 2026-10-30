import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = process.argv[2];
const outputPath = resolve(root, process.argv[3] || 'public/data/provided-hymns.json');
if (!inputPath) throw new Error('Usage: node scripts/import-provided-hymns.mjs <hymns.json> [output.json]');

const normalize = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const [input, watchman, gospel] = await Promise.all([
  readFile(resolve(inputPath), 'utf8').then(JSON.parse),
  readFile(resolve(root, 'public/data/watchman-hymns.json'), 'utf8').then(JSON.parse),
  readFile(resolve(root, 'public/data/gospel-hymn-index.json'), 'utf8').then(JSON.parse),
]);
const sourceHymns = Array.isArray(input) ? input : input.hymns;
if (!Array.isArray(sourceHymns)) throw new Error('The supplied file does not contain a hymn array.');

const existingTitles = new Set([
  ...watchman.hymns.map(hymn => hymn.title),
  ...gospel.hymns.map(hymn => hymn.title),
].map(normalize));
const seenLyrics = new Set();
const additions = [];
for (const [index, hymn] of sourceHymns.entries()) {
  const title = String(hymn?.name || hymn?.title || '').trim();
  const sourceVerses = Array.isArray(hymn?.verses) ? hymn.verses : [];
  const verses = sourceVerses
    .map(verse => String(verse?.text || verse?.content || '').trim())
    .filter(Boolean)
    .map((text, verseIndex) => ({ number: verseIndex + 1, type: 'verse', content: text }));
  const titleKey = normalize(title);
  if (!titleKey || !verses.length || existingTitles.has(titleKey)) continue;
  const lyricKey = `${titleKey}\n${verses.map(verse => normalize(verse.content)).join('\n')}`;
  if (seenLyrics.has(lyricKey)) continue;
  seenLyrics.add(lyricKey);
  additions.push({
    number: String(hymn.id ?? hymn.number ?? index + 1),
    title,
    category: String(hymn.category || '').trim(),
    lyrics: verses,
  });
}

const output = {
  source: 'User-provided hymns.json',
  sourceCount: sourceHymns.length,
  excludedExistingTitles: sourceHymns.filter(h => existingTitles.has(normalize(h?.name || h?.title))).length,
  importedCount: additions.length,
  hymns: additions,
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Imported ${additions.length} distinct missing-title records from ${sourceHymns.length} source entries.`);
console.log(`Wrote ${outputPath}`);
