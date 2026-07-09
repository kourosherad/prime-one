#!/usr/bin/env node
// Rewrite CDN references in all HTML files under public/ to local
// /assets/vendor/ paths. Run once after fetch-vendors.js. Idempotent.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const replacements = [
  // Vazirmatn font (CSS only here; fonts resolved relative to the CSS)
  ['https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css', '/assets/vendor/css/vazirmatn.css'],
  // AOS
  ['https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css', '/assets/vendor/css/aos.css'],
  ['https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js', '/assets/vendor/js/aos.js'],
  // Swiper
  ['https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', '/assets/vendor/css/swiper.min.css'],
  ['https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', '/assets/vendor/js/swiper.min.js'],
  // GSAP
  ['https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', '/assets/vendor/js/gsap.min.js'],
  // Chart.js
  ['https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js', '/assets/vendor/js/chart.umd.min.js'],
  // Font Awesome
  ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css', '/assets/vendor/css/fontawesome.min.css'],
];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

let totalChanges = 0;
for (const file of walk(PUBLIC)) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    totalChanges++;
    console.log('updated:', path.relative(ROOT, file));
  }
}
console.log(`\nDone. ${totalChanges} files updated.`);
