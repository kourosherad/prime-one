#!/usr/bin/env node
/**
 * Prime One — GitHub Pages build script.
 *
 * Copies `public/` into `dist-pages/` and rewrites all root-relative asset/page
 * URLs (href="/...", src="/...") so they resolve under the project-page base path
 * (default `/prime-one/`). Also injects `data-demo="true"` onto <html> so the
 * frontend serves bundled demo data instead of calling a (nonexistent) backend.
 *
 * Usage:
 *   node scripts/build-pages.js                  # uses default base /prime-one/
 *   BASE_PATH=/myrepo/ node scripts/build-pages.js
 *
 * Output: ./dist-pages  (publish this directory to GitHub Pages)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'dist-pages');

// Base path must start and end with '/'. Default is the repo name for project pages.
const rawBase = process.env.BASE_PATH || '/prime-one/';
const BASE = '/' + rawBase.replace(/^\/+|\/+$/g, '') + '/';
const base = BASE.replace(/\/$/, ''); // form without trailing slash for replacement

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// Rewrite root-relative URLs in HTML to include the base path.
function rewriteHtml(content) {
  let html = content;
  // Match href="..." or src="..." (single OR double quoted, matched-closing).
  // Skip protocol-relative (//) and absolute (http:/https:) URLs.
  // Group 1 = attr, group 2 = opening quote, group 3 = path, group 4 = closing quote.
  html = html.replace(
    /\b(href|src)\s*=\s*(["'])(\/(?!\/)[^"']*?)\2/g,
    (m, attr, quote, p) => {
      if (/^\/\//.test(p) || /^https?:/i.test(p)) return m;
      return `${attr}=${quote}${base}${p}${quote}`;
    }
  );
  // Mark demo mode on <html>.
  html = html.replace(/<html\b([^>]*)>/, (m, attrs) => {
    if (/data-demo=/.test(attrs)) return m.replace(/data-demo="[^"]*"/, 'data-demo="true"');
    return `<html${attrs} data-demo="true">`;
  });
  // Add a <base> as a safety net for any links we missed (after charset).
  if (!/<base\s/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <base href="${BASE}">`);
  }
  return html;
}

let files = 0;
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  if (/\.html$/i.test(file)) {
    fs.writeFileSync(dest, rewriteHtml(fs.readFileSync(file, 'utf8')));
  } else {
    fs.copyFileSync(file, dest);
  }
  files += 1;
}

// Add a .nojekyll so GitHub Pages serves the folder as-is (no Jekyll processing).
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
// Add a 404.html so unknown routes show the demo shell instead of GitHub's 404.
const fallback = path.join(OUT, '404.html');
if (!fs.existsSync(fallback)) {
  fs.copyFileSync(path.join(OUT, 'index.html'), fallback);
}

console.log(`[build-pages] base = ${BASE}`);
console.log(`[build-pages] wrote ${files} files to ${path.relative(ROOT, OUT)}/`);
