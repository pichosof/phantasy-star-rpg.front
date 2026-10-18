#!/usr/bin/env node
/**
 * Theme isolation guard. Colors belong to the world themes (src/styles/themes/<world>/);
 * components must use the CSS variables / tokens, never decide colors themselves.
 *
 * Flags, outside src/styles/themes:
 *   - literal colors (#hex, rgb/rgba/hsl with literal numbers, named white/black)
 *   - theme branching (`scheme === 'dark'`, `isDark`, `theme === 'light'|'dark'`)
 *
 * Usage: node scripts/check-theme-isolation.mjs [--strict]
 *   default  report only (exit 0)
 *   --strict exit 1 when anything is found (for CI once the backlog is cleared)
 *
 * Allow a deliberate exception on one line with:  // theme-isolation-ignore <reason>  (inside a CSS comment in styled CSS)
 * or for a whole file (e.g. image overlays) with:  theme-isolation-ignore-file <reason>
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'src');
// Theme folders own their colors; the domain palette and demo fixtures (sample data) are not theme colors.
const SKIP_DIRS = [path.join('styles', 'themes'), path.join('styles', 'domain-palette.ts'), path.join('demo', 'fixtures')];
const strict = process.argv.includes('--strict');
const listFile = process.argv.find((a) => a.startsWith('--list='))?.slice(7);

const RULES = [
  { id: 'hex', re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/g, test: (line) => !/^\s*(import|\/\/|\*)/.test(line) },
  { id: 'rgb', re: /\b(?:rgba?|hsla?)\(\s*\d/g },
  { id: 'named', re: /(?:color|background|border|fill|stroke)\s*:\s*['"]?(?:white|black)\b/g },
  { id: 'branch', re: /\bisDark\b|scheme\s*===\s*'(?:dark|light)'|theme\s*===\s*'(?:dark|light)'/g },
];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.some((s) => rel === s || rel.startsWith(s + path.sep))) walk(full);
    } else if (/\.(tsx?|less|css)$/.test(entry.name) && !SKIP_DIRS.includes(rel)) files.push(full);
  }
})(ROOT);

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('theme-isolation-ignore-file')) continue;
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes('theme-isolation-ignore')) return;
    for (const rule of RULES) {
      if (rule.test && !rule.test(line)) continue;
      const hits = line.match(rule.re);
      if (hits) findings.push({ file: path.relative(ROOT, file), line: i + 1, rule: rule.id, hits: [...new Set(hits)] });
    }
  });
}

if (listFile) {
  for (const f of findings.filter((x) => x.file.replace(/\\/g, '/').includes(listFile))) {
    console.log(`${f.file}:${f.line} [${f.rule}] ${f.hits.join(' ')}`);
  }
  process.exit(0);
}

const byFile = new Map();
for (const f of findings) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
const sorted = [...byFile.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [file, list] of sorted) {
  const counts = list.reduce((acc, f) => ({ ...acc, [f.rule]: (acc[f.rule] ?? 0) + 1 }), {});
  console.log(`${String(list.length).padStart(4)}  ${file}  ${JSON.stringify(counts)}`);
}
const total = findings.length;
console.log(`\n${total} theme-isolation finding(s) in ${byFile.size} file(s).`);
if (strict && total > 0) process.exit(1);
