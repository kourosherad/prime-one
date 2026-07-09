#!/usr/bin/env node
/**
 * Download vendor CSS/JS + the Vazirmatn font so the site is fully self-hosted
 * (no dependency on jsdelivr/cloudflare CDNs, which can be blocked/throttled
 * in some regions — the most likely cause of the "unstyled page" issue).
 *
 * Output: public/assets/vendor/{css,js,fonts,webfonts}
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const VENDOR = path.join(ROOT, 'public', 'assets', 'vendor');

const files = [
  // Vazirmatn font CSS + its woff2 files
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css', to: 'css/vazirmatn.css' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2', to: 'webfonts/Vazirmatn-Regular.woff2' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Bold.woff2', to: 'webfonts/Vazirmatn-Bold.woff2' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Black.woff2', to: 'webfonts/Vazirmatn-Black.woff2' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Medium.woff2', to: 'webfonts/Vazirmatn-Medium.woff2' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-SemiBold.woff2', to: 'webfonts/Vazirmatn-SemiBold.woff2' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-ExtraBold.woff2', to: 'webfonts/Vazirmatn-ExtraBold.woff2' },
  { from: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Light.woff2', to: 'webfonts/Vazirmatn-Light.woff2' },
  // AOS
  { from: 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css', to: 'css/aos.css' },
  { from: 'https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js', to: 'js/aos.js' },
  // Swiper
  { from: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', to: 'css/swiper.min.css' },
  { from: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', to: 'js/swiper.min.js' },
  // GSAP
  { from: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', to: 'js/gsap.min.js' },
  // Chart.js
  { from: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js', to: 'js/chart.umd.min.js' },
  // Font Awesome CSS + webfonts
  { from: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css', to: 'css/fontawesome.min.css' },
];

const faFontFiles = [
  'fa-solid-900.woff2', 'fa-regular-400.woff2', 'fa-brands-400.woff2',
  'fa-solid-900.ttf', 'fa-regular-400.ttf', 'fa-brands-400.ttf',
];
for (const f of faFontFiles) {
  files.push({ from: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/${f}`, to: `webfonts/${f}` });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', (err) => {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        reject(err);
      });
  });
}

(async () => {
  fs.mkdirSync(path.join(VENDOR, 'css'), { recursive: true });
  fs.mkdirSync(path.join(VENDOR, 'js'), { recursive: true });
  fs.mkdirSync(path.join(VENDOR, 'webfonts'), { recursive: true });

  let ok = 0, fail = 0;
  for (const f of files) {
    const dest = path.join(VENDOR, f.to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    try {
      await download(f.from, dest);
      const kb = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`  OK  ${f.to} (${kb} KB)`);
      ok++;
    } catch (e) {
      console.error(`  FAIL ${f.to} — ${e.message}`);
      fail++;
    }
  }

  // Patch the Vazirmatn CSS to reference the local webfonts path (relative).
  const vazir = path.join(VENDOR, 'css', 'vazirmatn.css');
  if (fs.existsSync(vazir)) {
    let css = fs.readFileSync(vazir, 'utf8');
    css = css.replace(/url\(["']?\.?\/?fonts\/webfonts\//g, "url('../webfonts/");
    css = css.replace(/url\(["']?https:\/\/[^)"']+\/webfonts\//g, "url('../webfonts/");
    fs.writeFileSync(vazir, css);
    console.log('  patched vazirmatn.css font paths -> ../webfonts/');
  }
  // Patch Font Awesome CSS to reference local webfonts.
  const fa = path.join(VENDOR, 'css', 'fontawesome.min.css');
  if (fs.existsSync(fa)) {
    let css = fs.readFileSync(fa, 'utf8');
    css = css.replace(/\.\.\/webfonts\//g, '../webfonts/');
    // Font Awesome 6 free uses ../webfonts/ already; ensure it's correct.
    fs.writeFileSync(fa, css);
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})();
