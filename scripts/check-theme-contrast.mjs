#!/usr/bin/env node
/**
 * WCAG contrast check, run per theme in isolation: a change in one world can only fail
 * that world. Reads the real tokens through Vite (same module graph as the app).
 *
 * Usage: node scripts/check-theme-contrast.mjs [--strict] [--theme=<id>]
 *   ✓ meets the target · ✗ below it. --strict exits 1 on any ✗.
 */
import { createServer } from 'vite';

const strict = process.argv.includes('--strict');
const only = process.argv.find((a) => a.startsWith('--theme='))?.slice(8);

const hexOf = (c) => {
  const s = c.trim();
  if (s.startsWith('#')) {
    const h = s.slice(1);
    return h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
  }
  return null;
};
const rgbOf = (c, under) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(',').map((v) => Number(v.trim()));
    if (a < 1 && under) {
      const u = rgbOf(under);
      return [r, g, b].map((v, i) => v * a + u[i] * (1 - a));
    }
    return [r, g, b];
  }
  const h = hexOf(c);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (fg, bg) => {
  const a = lum(rgbOf(fg, bg));
  const b = lum(rgbOf(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const gradientStops = (g) => [...g.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0]);

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true },
});
let failures = 0;
try {
  const { THEME_LIST } = await server.ssrLoadModule('/src/styles/themes/registry.ts');
  for (const theme of THEME_LIST) {
    if (only && theme.id !== only) continue;
    const t = theme.tokens;
    const surfaces = {
      body: t.background,
      card: t.additionalBackground,
      secondary: t.secondaryBackground,
      base: t.backgroundColorBase,
    };
    const rows = [];
    const check = (label, fg, bgs, min) => {
      if (!fg) return console.log(`· ${label.padEnd(26)} (token not defined in this theme)`);
      for (const [name, bg] of Object.entries(bgs)) rows.push({ label, on: name, ratio: contrast(fg, bg), min });
    };
    // text on surfaces
    check('textMain', t.textMain, surfaces, 4.5);
    check('heading', t.heading, surfaces, 4.5);
    check('textMuted', t.textMuted, surfaces, 4.5);
    check('textLight', t.textLight, surfaces, 4.5);
    check('textSuperLight', t.textSuperLight, surfaces, 4.5);
    check('subText', t.subText, surfaces, 4.5);
    check('breadcrumb', t.breadcrumb, surfaces, 4.5);
    check('inputPlaceholder', t.inputPlaceholder, { card: t.additionalBackground }, 4.5);
    check('primary (text/link)', t.primary, surfaces, 4.5);
    check('error (text)', t.error, surfaces, 4.5);
    check('success (text)', t.success, surfaces, 4.5);
    check('warning (text)', t.warning, surfaces, 4.5);
    check('secondary (text)', t.secondary, surfaces, 4.5);
    check('icon', t.icon, surfaces, 3);
    check('disable', t.disable, { card: t.additionalBackground }, 3);
    check('ink.subtle', t.ink.subtle, { card: t.additionalBackground }, 3);
    // text on solid colors (buttons, tags)
    for (const k of ['primary', 'success', 'warning', 'error']) {
      check(`textOnColor on ${k}`, t.textOnColor, { [k]: t[k] }, 4.5);
    }
    // primary buttons are painted with the brand gradient
    const gStops = gradientStops(t.primaryGradient);
    check('textOnColor on gradient', t.textOnColor, Object.fromEntries(gStops.map((s, i) => [`stop${i}`, s])), 4.5);
    // borders / component edges (WCAG 1.4.11)
    check('borderStrong', t.borderStrong, surfaces, 3);
    // menu
    const stops = gradientStops(t.layoutSiderBg);
    const siderBgs = Object.fromEntries(stops.map((s, i) => [`sider${i}`, s]));
    check('menu text', t.textSiderSecondary, siderBgs, 4.5);
    check('menu active text', t.textSiderPrimary, siderBgs, 4.5);

    const bad = rows.filter((r) => r.ratio < r.min);
    failures += bad.length;
    console.log(`\n=== ${theme.name} (${theme.id}) — ${rows.length - bad.length}/${rows.length} pairs ok`);
    const byLabel = new Map();
    for (const r of rows) byLabel.set(r.label, [...(byLabel.get(r.label) ?? []), r]);
    for (const [label, list] of byLabel) {
      const worst = list.reduce((a, b) => (a.ratio < b.ratio ? a : b));
      const mark = worst.ratio >= worst.min ? '✓' : '✗';
      console.log(`${mark} ${label.padEnd(26)} min ${worst.ratio.toFixed(2).padStart(5)} (on ${worst.on}, target ${worst.min})`);
    }
  }
} finally {
  await server.close();
}
console.log(`\n${failures} pair(s) below target.`);
if (strict && failures) process.exit(1);
