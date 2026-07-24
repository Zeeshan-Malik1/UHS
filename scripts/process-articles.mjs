import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const articlesDir = join(root, 'articles');
const outDir = join(root, 'client', 'src', 'data');
const outFile = join(outDir, 'generatedArticles.json');

const titleCase = (value) => value.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (x) => x.toUpperCase());
const cleanLine = (line) => line.replace(/\s+/g, ' ').trim();

function titleFromText(text, fallback) {
  const normalized = text.replace(/\r/g, '');
  const taggedTitle = normalized.match(/(?:^|\n)T1\s+([^\n]+)/i)?.[1]?.trim();
  if (taggedTitle && taggedTitle.length > 8) return taggedTitle;
  const lines = normalized.split('\n').map(cleanLine).filter(Boolean);
  const unsuitable = /^(TY|PY|JF|VL|IS|SP|EP|DO|SN|LA|AB|KW)(\s|$)|^[\d.\- ]+$/i;
  const candidate = lines.find((line) => line.length > 12 && line.length < 180 && !unsuitable.test(line) && !/^(abstract|introduction|objective|background)$/i.test(line));
  return candidate || fallback;
}

function blocksFromText(text) {
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const blocks = [];
  let paragraph = [];
  for (const line of lines) {
    const heading = line.length < 90 && /[A-Za-z]/.test(line) && !/[.!?]$/.test(line) && !/^([•\-*]|\d+[.)])\s+/.test(line);
    const bullet = /^([•\-*]|\d+[.)])\s+/.test(line);
    if ((heading || bullet) && paragraph.length) {
      blocks.push(paragraph.join(' '));
      paragraph = [];
    }
    if (heading || bullet) blocks.push(line);
    else paragraph.push(line);
  }
  if (paragraph.length) blocks.push(paragraph.join(' '));
  return blocks;
}

function sectionsFromBlocks(blocks) {
  const sections = [];
  let current = { heading: 'Overview', blocks: [] };
  for (const block of blocks) {
    const heading = block.length < 90 && /[A-Za-z]/.test(block) && !/[.!?]$/.test(block) && !/^([•\-*]|\d+[.)])\s+/.test(block);
    if (heading) {
      if (current.blocks.length) sections.push(current);
      current = { heading: block, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }
  if (current.blocks.length || current.heading !== 'Overview') sections.push(current);
  return sections.length ? sections : [{ heading: 'Overview', blocks }];
}

function descriptionFromSections(sections) {
  const text = sections.flatMap((x) => x.blocks).find((x) => x.length > 80) ?? sections[0]?.blocks?.[0] ?? '';
  return text.length > 220 ? `${text.slice(0, 220).replace(/\s+\S*$/, '')}...` : text;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  if (!existsSync(articlesDir)) {
    writeFileSync(outFile, JSON.stringify([], null, 2));
    return;
  }
  const files = readdirSync(articlesDir).filter((x) => x.toLowerCase().endsWith('.pdf')).sort();
  const articles = [];
  for (const file of files) {
    const fullPath = join(articlesDir, file);
    const parser = new PDFParse({ data: readFileSync(fullPath) });
    const parsed = await parser.getText();
    await parser.destroy();
    const fallbackTitle = titleCase(basename(file, '.pdf'));
    const blocks = blocksFromText(parsed.text || '');
    const sections = sectionsFromBlocks(blocks);
    const firstHeading = sections.find((x) => x.heading !== 'Overview')?.heading;
    const title = titleFromText(parsed.text || '', fallbackTitle);
    const words = sections.flatMap((x) => [x.heading, ...x.blocks]).join(' ').split(/\s+/).filter(Boolean).length;
    articles.push({
      id: basename(file, '.pdf'),
      filename: file,
      title,
      shortTitle: title.length > 58 ? `${title.slice(0, 55).trim()}...` : title,
      heading: firstHeading && !/^(TY|PY|JF|VL|IS|SP|EP|DO|SN|LA)(\s|$)/i.test(firstHeading) ? firstHeading : title,
      description: descriptionFromSections(sections),
      readingTime: `${Math.max(1, Math.ceil(words / 220))} min read`,
      category: 'Healthcare',
      keywords: [...new Set(title.toLowerCase().split(/\W+/).filter((x) => x.length > 3))].slice(0, 10),
      updatedAt: statSync(fullPath).mtime.toISOString(),
      sections,
    });
  }
  writeFileSync(outFile, JSON.stringify(articles, null, 2));
  console.log(`Processed ${articles.length} PDF article(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
