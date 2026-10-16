/* shell-v2 verification — run with: node verify-shell.js */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const KIT_DIR = '/home/bulaya/SoftwareDevelopmentProjects/system-engineer/requirements/techniques/skeleton-kit';
const TARGET = '/home/bulaya/SoftwareDevelopmentProjects/nfc-loyalty-docs/spec/nfc-skeleton-v3.html';
const CSS_PATH = path.join(KIT_DIR, 'skeleton-kit.css');

let pass = 0;
let fail = 0;

async function check(name, fn) {
  try {
    await fn();
    pass++;
    console.log('PASS:', name);
  } catch (e) {
    fail++;
    console.log('FAIL:', name, '—', e.message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractInlineScript(html) {
  let match;
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let last = '';
  while ((match = re.exec(html)) !== null) {
    if (!/\bsrc\s*=/.test(match[1])) last = match[2];
  }
  return last;
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

function loadTarget() {
  const raw = fs.readFileSync(TARGET, 'utf8');
  const inlineScript = extractInlineScript(raw);
  const html = stripScripts(raw);
  const dom = new JSDOM(html, {
    url: 'file://' + TARGET,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });
  const win = dom.window;
  win.__alerts = [];
  win.alert = (m) => { win.__alerts.push(String(m)); };
  if (typeof win.URL.createObjectURL !== 'function') {
    win.URL.createObjectURL = () => 'blob:mock';
    win.URL.revokeObjectURL = () => {};
  }
  const srcs = {
    vue: fs.readFileSync(path.join(KIT_DIR, 'vue.global.prod.js'), 'utf8'),
    kit: fs.readFileSync(path.join(KIT_DIR, 'skeleton-kit.js'), 'utf8'),
    cockpit: fs.readFileSync(path.join(KIT_DIR, 'cockpit.js'), 'utf8')
  };
  win.eval(srcs.vue);
  win.eval(srcs.kit);
  win.eval(srcs.cockpit);
  win.eval(inlineScript);
  return dom;
}

let dom, win, doc;
const cssText = fs.readFileSync(CSS_PATH, 'utf8');

function sr(name) {
  return doc.querySelector('[data-sk-screen="' + name + '"]');
}
function visible(name) {
  const el = sr(name);
  return el && el.style.display !== 'none';
}
function headerBtn(textFrag) {
  return Array.from(doc.querySelectorAll('.sk-cockpit__header-actions .sk-cockpit__btn, .sk-cockpit__bar .sk-cockpit__btn')).find(
    (b) => b.textContent.trim().includes(textFrag)
  );
}
function cssHas(ruleFragment) {
  return cssText.replace(/\s+/g, ' ').includes(ruleFragment);
}

async function run() {
  dom = loadTarget();
  win = dom.window;
  doc = win.document;
  await sleep(80);

  /* ---------- Shell config ---------- */
  await check('shell title pulled from window.SK_SHELL', async () => {
    const title = doc.querySelector('.sk-cockpit__title');
    if (!title) throw new Error('title element missing');
    if (!title.textContent.includes('NFC Order Wallet')) throw new Error('unexpected title: ' + title.textContent);
  });

  await check('header contains device toggle', async () => {
    const b = headerBtn('Phone') || headerBtn('Desktop');
    if (!b) throw new Error('device toggle missing');
  });

  await check('header contains INSPECT toggle', async () => {
    const b = headerBtn('Inspect Mode');
    if (!b) throw new Error('inspect toggle missing');
  });

  await check('header contains Help [?] button', async () => {
    const b = doc.querySelector('.sk-cockpit__btn--help');
    if (!b || b.textContent.trim() !== '?') throw new Error('help button missing');
  });

  await check('header contains Finish Session button', async () => {
    const b = headerBtn('Finish Session');
    if (!b) throw new Error('finish session button missing');
  });

  /* ---------- Screen dropdown ---------- */
  await check('screens dropdown exists', async () => {
    const sel = doc.querySelector('.sk-cockpit__screen-select');
    if (!sel) throw new Error('screen select missing');
  });

  await check('screens dropdown lists all 12 screens', async () => {
    const opts = Array.from(doc.querySelectorAll('.sk-cockpit__screen-select option'));
    if (opts.length !== 12) throw new Error('expected 12 options, got ' + opts.length);
  });

  await check('screens dropdown switching navigates the preview', async () => {
    const sel = doc.querySelector('.sk-cockpit__screen-select');
    sel.value = 'c-history';
    sel.dispatchEvent(new win.Event('change', { bubbles: true }));
    await sleep(20);
    if (!visible('c-history')) throw new Error('c-history not visible after select');
    sel.value = 'c-login';
    sel.dispatchEvent(new win.Event('change', { bubbles: true }));
    await sleep(20);
    if (!visible('c-login')) throw new Error('c-login not visible after select back');
  });

  /* ---------- Add screen ---------- */
  await check('add-screen input exists', async () => {
    const input = doc.querySelector('.sk-cockpit__add-screen-input');
    if (!input) throw new Error('add screen input missing');
  });

  await check('add-screen button exists', async () => {
    const btn = doc.querySelector('.sk-cockpit__add-screen .sk-cockpit__btn');
    if (!btn || !btn.textContent.includes('Add screen')) throw new Error('add screen button missing');
  });

  await check('add-screen creates a placeholder and navigates to it', async () => {
    const input = doc.querySelector('.sk-cockpit__add-screen-input');
    const btn = doc.querySelector('.sk-cockpit__add-screen .sk-cockpit__btn');
    input.value = 'new-idea';
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
    btn.click();
    await sleep(30);

    const placeholder = sr('new-idea');
    if (!placeholder) throw new Error('placeholder screen not created');
    if (!placeholder.classList.contains('sk-screen--placeholder')) throw new Error('not a placeholder');
    if (placeholder.style.display === 'none') throw new Error('placeholder hidden');
    if (!placeholder.textContent.includes('what should this screen do')) throw new Error('placeholder text missing');

    const opts = Array.from(doc.querySelectorAll('.sk-cockpit__screen-select option'));
    if (!opts.some((o) => o.value === 'new-idea')) throw new Error('new screen not in dropdown');
  });

  await check('add-screen nav-item button also appears', async () => {
    await sleep(30);
    const items = Array.from(doc.querySelectorAll('.sk-cockpit__nav-item'));
    if (!items.some((b) => b.textContent.trim() === 'new-idea')) {
      throw new Error('new-idea nav item missing; got: ' + items.map((b) => b.textContent.trim()).join(','));
    }
  });

  /* ---------- Device toggle ---------- */
  const deviceBtn = headerBtn('Phone') || headerBtn('Desktop');
  await check('device toggle starts as desktop', async () => {
    const preview = doc.querySelector('.sk-preview-region');
    if (!preview.classList.contains('sk-preview-region--desktop')) throw new Error('desktop class missing');
  });

  await check('device toggle switches to phone width class', async () => {
    deviceBtn.click();
    await sleep(20);
    const preview = doc.querySelector('.sk-preview-region');
    if (!preview.classList.contains('sk-preview-region--phone')) throw new Error('phone class missing');
    if (preview.classList.contains('sk-preview-region--desktop')) throw new Error('desktop class still present');
  });

  await check('device toggle switches back to desktop width class', async () => {
    deviceBtn.click();
    await sleep(20);
    const preview = doc.querySelector('.sk-preview-region');
    if (!preview.classList.contains('sk-preview-region--desktop')) throw new Error('desktop class missing');
    if (preview.classList.contains('sk-preview-region--phone')) throw new Error('phone class still present');
  });

  /* ---------- Help modal ---------- */
  const helpBtn = doc.querySelector('.sk-cockpit__btn--help');
  await check('Help modal opens', async () => {
    helpBtn.click();
    await sleep(20);
    const modal = doc.querySelector('.sk-cockpit__modal--help');
    if (!modal) throw new Error('help modal not rendered');
    if (!modal.textContent.includes('NFC') || !modal.textContent.includes('wallet')) throw new Error('help content missing project name');
  });

  await check('Help modal closes via Close button', async () => {
    const close = doc.querySelector('.sk-cockpit__modal--help .sk-cockpit__modal-actions .sk-cockpit__btn');
    if (!close) throw new Error('close button missing');
    close.click();
    await sleep(20);
    if (doc.querySelector('.sk-cockpit__modal--help')) throw new Error('help modal still open');
  });

  await check('Help modal closes via Escape', async () => {
    helpBtn.click();
    await sleep(20);
    if (!doc.querySelector('.sk-cockpit__modal--help')) throw new Error('help modal did not open');
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(20);
    if (doc.querySelector('.sk-cockpit__modal--help')) throw new Error('help modal did not close on Escape');
  });

  /* ---------- Notes panel collapse ---------- */
  await check('notes panel has collapse button', async () => {
    const btn = doc.querySelector('.sk-cockpit__notes-header .sk-cockpit__btn--small');
    if (!btn) throw new Error('collapse button missing');
  });

  await check('notes panel collapses and hides list', async () => {
    const btn = doc.querySelector('.sk-cockpit__notes-header .sk-cockpit__btn--small');
    btn.click();
    await sleep(20);
    if (doc.querySelector('.sk-cockpit__notes-list')) throw new Error('notes list still visible');
  });

  await check('notes panel expands and shows list', async () => {
    const btn = doc.querySelector('.sk-cockpit__notes-header .sk-cockpit__btn--small');
    btn.click();
    await sleep(20);
    if (!doc.querySelector('.sk-cockpit__notes-list')) throw new Error('notes list not visible');
  });

  /* ---------- Inspect overlay restricted to preview region ---------- */
  let inspectBtn = headerBtn('Inspect Mode');
  await check('inspect mode toggle enters inspect', async () => {
    inspectBtn.click();
    await sleep(30);
    const overlay = doc.querySelector('.sk-preview-region .sk-cockpit__overlay');
    if (!overlay) throw new Error('overlay not teleported into preview');
  });

  await check('inspect overlay is inside preview region only', async () => {
    const preview = doc.querySelector('.sk-preview-region');
    const allOverlays = doc.querySelectorAll('.sk-cockpit__overlay');
    if (allOverlays.length !== 1) throw new Error('expected 1 overlay, got ' + allOverlays.length);
    if (!preview.contains(allOverlays[0])) throw new Error('overlay is outside preview region');
  });

  await check('inspect mode exits', async () => {
    const exit = headerBtn('Exit Inspect');
    if (!exit) throw new Error('exit inspect button missing');
    exit.click();
    await sleep(30);
    if (doc.querySelector('.sk-preview-region .sk-cockpit__overlay')) throw new Error('overlay still present');
  });

  /* ---------- Color policy sanity (assert rule presence, not hex) ---------- */
  await check('CSS defines button tint rule', async () => {
    if (!cssHas('.sk-button {')) throw new Error('.sk-button rule missing');
    if (!cssText.includes('--sk-tint-bg')) throw new Error('tint token missing');
  });

  await check('CSS defines tap-target tint rule', async () => {
    if (!cssHas('.sk-tap-target {')) throw new Error('.sk-tap-target rule missing');
  });

  await check('CSS defines field/input tint rule', async () => {
    if (!cssHas('.sk-field__input {')) throw new Error('.sk-field__input rule missing');
  });

  await check('CSS defines pin-pad tint rule', async () => {
    if (!cssHas('.sk-pin-pad {')) throw new Error('.sk-pin-pad rule missing');
  });

  await check('CSS defines card subtle fill rule', async () => {
    if (!cssHas('.sk-card {')) throw new Error('.sk-card rule missing');
  });

  await check('CSS defines money table header fill', async () => {
    if (!cssHas('.sk-money-table thead tr {')) throw new Error('money table header rule missing');
  });

  await check('CSS defines money table faint row lines (owner preference 2026-10-16: no zebra)', async () => {
    if (!cssHas('.sk-money-table tbody tr:not(:last-child) td {')) throw new Error('faint row-line rule missing');
    if (cssHas('.sk-money-table tbody tr:nth-child(even) {')) throw new Error('zebra rule present — should be removed');
  });

  await check('CSS defines negative amount sign color', async () => {
    if (!cssHas('.sk-money-table__amount--negative {')) throw new Error('negative amount rule missing');
  });

  await check('CSS defines positive amount sign color', async () => {
    if (!cssHas('.sk-money-table__amount--positive {')) throw new Error('positive amount rule missing');
  });

  await check('CSS defines semantic status pill colors', async () => {
    if (!cssHas('.sk-pill[data-sk-context="active"] {')) throw new Error('active pill rule missing');
    if (!cssHas('.sk-pill[data-sk-context="pending"] {')) throw new Error('pending pill rule missing');
    if (!cssHas('.sk-pill[data-sk-context="blocked"] {')) throw new Error('blocked pill rule missing');
  });

  await check('DOM negative money amount has sign color class', async () => {
    const neg = doc.querySelector('.sk-money-table__amount--negative');
    if (!neg) throw new Error('no negative amount cell found');
  });

  await check('DOM positive money amount has sign color class', async () => {
    const pos = doc.querySelector('.sk-money-table__amount--positive');
    if (!pos) throw new Error('no positive amount cell found');
  });

  await check('DOM status pill has semantic pastel class', async () => {
    const pill = doc.querySelector('.sk-pill[data-sk-context="active"]');
    if (!pill) throw new Error('no active pill');
  });

  await check('chrome remains dark-slate', async () => {
    const header = doc.querySelector('.sk-cockpit__header');
    if (!header) throw new Error('header missing');
    if (!cssHas('--sk-chrome-bg:')) throw new Error('chrome bg token missing');
    if (!cssHas('background: var(--sk-chrome-bg)')) throw new Error('chrome bg rule missing');
  });

  /* ---------- Re-assert comment pin/export flow ---------- */
  await check('inspect click opens comment modal with address', async () => {
    const login = sr('c-login');
    const heading = login.querySelector('[data-sk-component="sk-heading"]');
    if (!heading) throw new Error('no heading to inspect');

    inspectBtn = headerBtn('Inspect Mode');
    inspectBtn.click();
    await sleep(30);

    heading.dispatchEvent(new win.MouseEvent('mouseover', { bubbles: true, cancelable: true }));
    await sleep(10);
    heading.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
    await sleep(20);

    const modal = doc.querySelector('.sk-cockpit__modal:not(.sk-cockpit__modal--help)');
    if (!modal) throw new Error('comment modal missing');
    const addr = modal.querySelector('.sk-cockpit__modal-address');
    if (!addr || !addr.textContent.includes('c-login')) throw new Error('address wrong: ' + (addr && addr.textContent));
  });

  await check('saving a note creates a pin badge and notes list entry', async () => {
    const ta = doc.querySelector('.sk-cockpit__modal-text');
    ta.value = 'Shell v2 pin flow still works';
    ta.dispatchEvent(new win.Event('input', { bubbles: true }));
    const save = Array.from(doc.querySelectorAll('.sk-cockpit__modal-actions .sk-cockpit__btn')).find(
      (b) => b.textContent.trim() === 'Save'
    );
    save.click();
    await sleep(30);

    if (doc.querySelector('.sk-cockpit__modal:not(.sk-cockpit__modal--help)')) throw new Error('modal still open');
    const notes = doc.querySelectorAll('.sk-cockpit__note');
    if (!Array.from(notes).some((n) => n.textContent.includes('Shell v2 pin flow still works'))) {
      throw new Error('note not in list');
    }
    const pin = doc.querySelector('.sk-cockpit__pin-layer .sk-cockpit__pin');
    if (!pin) throw new Error('pin badge missing');
  });

  await check('Finish Session reports status', async () => {
    const finish = headerBtn('Finish Session');
    finish.click();
    await sleep(30);
    const status = doc.querySelector('.sk-cockpit__status');
    if (!status || !status.textContent.includes('Download')) throw new Error('status missing: ' + (status && status.textContent));
  });

  /* ---------- Summary ---------- */
  console.log('\n----------------------------');
  console.log('Total:', pass + fail);
  console.log('Passed:', pass);
  console.log('Failed:', fail);
  console.log('----------------------------');
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
