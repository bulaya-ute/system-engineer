/* nfc-skeleton-v3 verification — run with: node verify-v3.js */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const KIT_DIR = '/home/bulaya/SoftwareDevelopmentProjects/system-engineer/requirements/techniques/skeleton-kit';
const TARGET = '/home/bulaya/SoftwareDevelopmentProjects/nfc-loyalty-docs/spec/nfc-skeleton-v3.html';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, fn) {
  try {
    fn();
    pass++;
  } catch (e) {
    fail++;
    failures.push(name + ' — ' + e.message);
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

/* ---------- Part 0: kit paths resolve from the file location ---------- */
function checkKitPaths() {
  const raw = fs.readFileSync(TARGET, 'utf8');
  const dir = path.dirname(TARGET);
  const refs = [
    'href="../../system-engineer/requirements/techniques/skeleton-kit/skeleton-kit.css"',
    'src="../../system-engineer/requirements/techniques/skeleton-kit/vue.global.prod.js"',
    'src="../../system-engineer/requirements/techniques/skeleton-kit/skeleton-kit.js"',
    'src="../../system-engineer/requirements/techniques/skeleton-kit/cockpit.js"'
  ];
  const files = ['skeleton-kit.css', 'vue.global.prod.js', 'skeleton-kit.js', 'cockpit.js'];
  check('v3 file references the kit via relative ../../ paths (not the manager-suggested 5-up path)', () => {
    refs.forEach((r) => {
      if (!raw.includes(r)) throw new Error('missing reference: ' + r);
    });
  });
  files.forEach((f, i) => {
    check('kit file resolves + exists from spec/: ' + f, () => {
      const resolved = path.resolve(dir, refs[i].match(/href="([^"]+)"|src="([^"]+)"/).slice(1).find(Boolean));
      if (!fs.existsSync(resolved)) throw new Error('does not exist: ' + resolved);
      if (path.dirname(resolved) !== KIT_DIR) throw new Error('resolved outside kit dir: ' + resolved);
      if (fs.readFileSync(resolved).length < 100) throw new Error('file empty: ' + resolved);
    });
  });
  check('no other script/link references in v3 stay within the kit dir (zero network, no CDN)', () => {
    const outrefs = raw.match(/(src|href)="(?!#)[^"]+"/g) || [];
    outrefs.forEach((r) => {
      if (r.includes('http')) throw new Error('absolute/remote ref found: ' + r);
    });
  });
}

/* ---------- Loading ---------- */
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

/* ---------- DOM helpers ---------- */
let dom, win, doc;

function sr(name) {
  return doc.querySelector('[data-sk-screen="' + name + '"]');
}
function visible(name) {
  const el = sr(name);
  return el && el.style.display !== 'none';
}
function hidden(name) {
  const el = sr(name);
  return el && el.style.display === 'none';
}
function screenText(name) {
  return (sr(name) || { textContent: '' }).textContent;
}
function buttons(rootEl) {
  return Array.from(rootEl.querySelectorAll('.sk-button')).filter((b) => !b.classList.contains('sk-cockpit__btn'));
}
function btn(label, rootEl) {
  const scope = rootEl || doc;
  return buttons(scope).find((b) => b.textContent.trim() === label);
}
function navBtn(label) {
  return Array.from(doc.querySelectorAll('.sk-cockpit__nav-item')).find((b) => b.textContent.trim() === label);
}
function cardsOf(screenEl) {
  return Array.from(screenEl.querySelectorAll('.sk-card'));
}
function cardByTitle(screenEl, titleFrag) {
  return cardsOf(screenEl).find((c) => {
    const t = c.querySelector('.sk-card__title');
    return t && t.textContent.includes(titleFrag);
  });
}
function padIn(screenEl) {
  return screenEl.querySelector('[data-sk-component="sk-pin-pad"]');
}
function padKeys(pad) {
  return Array.from(pad.querySelectorAll('.sk-pin-pad__key'));
}
function clickPadDigits(pad, digits) {
  const keys = padKeys(pad);
  digits.forEach((d) => {
    const k = keys.find((x) => x.textContent.trim() === String(d));
    if (!k) throw new Error('digit key missing: ' + d);
    k.click();
  });
}
function filledDots(pad) {
  return pad.querySelectorAll('.sk-pin-pad__dot--filled').length;
}
function setInput(fieldLabel, screenName, value) {
  const screen = sr(screenName);
  const label = Array.from(screen.querySelectorAll('label.sk-field, .sk-field')).find(
    (l) => l.querySelector('.sk-field__label') && l.querySelector('.sk-field__label').textContent.trim() === fieldLabel
  );
  if (!label) throw new Error('field not found: ' + fieldLabel);
  const input = label.querySelector('input');
  input.value = value;
  input.dispatchEvent(new win.Event('input', { bubbles: true }));
  return input;
}
function moneyTables(screenEl) {
  return Array.from(screenEl.querySelectorAll('[data-sk-component="sk-money-table"]'));
}

/* ---------- Main ---------- */
async function run() {
  dom = loadTarget();
  win = dom.window;
  doc = win.document;
  await sleep(80);

  /* ---------- Environment ---------- */
  check('Vue global build loaded', () => {
    if (!win.Vue) throw new Error('window.Vue missing');
  });
  check('kit globals present', () => {
    if (!win.skUseFeedback || !win.skUseScreens || !win.registerSkeletonKit) throw new Error('kit globals missing');
  });
  check('cockpit registered (sk-cockpit renders bar + nav + notes)', () => {
    if (!doc.querySelector('.sk-cockpit__bar')) throw new Error('cockpit bar missing');
    if (!doc.querySelector('.sk-cockpit__nav')) throw new Error('cockpit nav missing');
    if (!doc.querySelector('.sk-cockpit__notes')) throw new Error('cockpit notes missing');
  });

  /* ---------- Screens render ---------- */
  const screenNames = ['c-login', 'c-pending', 'c-home', 'c-history', 'a-login', 'a-dash',
    'a-customers', 'a-customer-detail', 'a-checkout', 'a-cards', 'a-alerts', 'a-audit'];
  check('all 12 screens render in DOM', () => {
    screenNames.forEach((n) => {
      if (!sr(n)) throw new Error('missing screen ' + n);
    });
  });
  check('c-login is initially the only visible screen', () => {
    if (!visible('c-login')) throw new Error('c-login hidden');
    ['c-pending', 'c-home', 'c-history', 'a-login', 'a-dash', 'a-customers',
      'a-customer-detail', 'a-checkout', 'a-cards', 'a-alerts', 'a-audit'].forEach((n) => {
      if (!hidden(n)) throw new Error(n + ' should be hidden initially');
    });
  });
  check('every sk-screen carries a data-sk-address', () => {
    screenNames.forEach((n) => {
      if (!sr(n).getAttribute('data-sk-address')) throw new Error('no address on ' + n);
    });
  });

  /* ---------- Cockpit nav ---------- */
  check('cockpit nav lists all 12 screens', () => {
    if (doc.querySelectorAll('.sk-cockpit__nav-item').length !== 12) throw new Error('nav item count wrong');
  });
  check('cockpit nav marks c-login active initially', () => {
    const act = doc.querySelector('.sk-cockpit__nav-item--active');
    if (!act || act.textContent.trim() !== 'c-login') throw new Error('wrong active nav: ' + (act && act.textContent));
  });
  navBtn('c-history').click();
  await sleep(10);
  check('cockpit nav switches to c-history and back to c-login', () => {
    if (!visible('c-history')) throw new Error('c-history not visible');
    navBtn('c-login').click();
    return new Promise((r) => setTimeout(r, 10));
  });
  await sleep(10);
  check('nav back to c-login works', () => {
    if (!visible('c-login')) throw new Error('c-login not visible after nav back');
  });

  /* ---------- Customer login walk ---------- */
  check('c-login has tap target + [?] why tap first + crossover', () => {
    const scr = sr('c-login');
    if (!scr.querySelector('[data-sk-component="sk-tap-target"]')) throw new Error('tap target missing');
    if (!btn('[?] why tap first', scr)) throw new Error('[?] why tap first missing');
    if (!btn('staff console (a-login) →', scr)) throw new Error('crossover missing');
  });
  sr('c-login').querySelector('[data-sk-component="sk-tap-target"]').click();
  await sleep(20);
  check('tap → c-pending visible with context (CARD-0001 / Nkosi Banda)', () => {
    if (!visible('c-pending')) throw new Error('c-pending hidden');
    const t = screenText('c-pending');
    if (!t.includes('CARD-0001')) throw new Error('card id missing');
    if (!t.includes('Nkosi Banda')) throw new Error('customer missing');
    if (hidden('c-login')) {} else throw new Error('c-login should be hidden now');
  });
  check('c-pending pad shows attempts-left 5 warning text', () => {
    const scr = sr('c-pending');
    if (!scr.textContent.includes('(of 5) — 5 wrong PINs BLOCK the card')) throw new Error('warning text missing');
    if (!screenText('c-pending').includes('Confirm it\'s you — enter your PIN on YOUR phone')) throw new Error('confirm heading missing');
  });
  let pad = padIn(sr('c-pending'));
  check('c-pending pad exists: attempts 5, 12 keys, 4 dots', () => {
    if (!pad) throw new Error('pad missing');
    if (!pad.textContent.includes('Attempts left: 5')) throw new Error('attempts 5 missing');
    if (padKeys(pad).length !== 12) throw new Error('expected 12 keys');
    if (pad.querySelectorAll('.sk-pin-pad__dot').length !== 4) throw new Error('dots not 4');
  });
  clickPadDigits(pad, [9, 9, 9, 9]);
  await sleep(20);
  check('wrong PIN shows attempts-left 4 + WRONG PIN message + cleared pad', () => {
    pad = padIn(sr('c-pending'));
    if (!pad.textContent.includes('Attempts left: 4')) throw new Error('attempts 4 missing');
    if (!screenText('c-pending').includes('WRONG PIN.')) throw new Error('WRONG PIN missing');
    if (filledDots(pad) !== 0) throw new Error('pad not cleared');
  });
  clickPadDigits(pad, [9, 9, 9, 9]);
  await sleep(15);
  clickPadDigits(padIn(sr('c-pending')), [9, 9, 9, 9]);
  await sleep(15);
  clickPadDigits(padIn(sr('c-pending')), [9, 9, 9, 9]);
  await sleep(15);
  check('after 4 wrong attempts → attempts left 1, still not blocked', () => {
    if (!padIn(sr('c-pending')).textContent.includes('Attempts left: 1')) throw new Error('attempts 1 missing');
    const scr = sr('c-pending');
    if (cardByTitle(scr, 'CARD BLOCKED')) throw new Error('blocked too early');
  });
  clickPadDigits(padIn(sr('c-pending')), [9, 9, 9, 9]);
  await sleep(20);
  check('5th wrong PIN → blocked banner (no pad, unlock + give-up buttons)', () => {
    const scr = sr('c-pending');
    const blockedCard = cardByTitle(scr, 'CARD BLOCKED (pending confirmation)');
    if (!blockedCard) throw new Error('blocked banner missing');
    if (!blockedCard.textContent.includes('BLOCKED BANNER')) throw new Error('banner text missing');
    if (!blockedCard.textContent.includes('Sign-in failed; no session.')) throw new Error('failed-session text missing');
    if (!blockedCard.textContent.includes('unlocked by an admin only')) throw new Error('admin-unlock note missing');
    if (!btn('Admin unlock (mock)', blockedCard)) throw new Error('unlock button missing');
    if (!btn('Give up for now', blockedCard)) throw new Error('give up button missing');
    if (padIn(scr)) throw new Error('pin pad should be gone when blocked');
  });
  btn('Admin unlock (mock)', sr('c-pending')).click();
  await sleep(20);
  check('admin unlock restores pad with attempts 5 + cancels banner', () => {
    const scr = sr('c-pending');
    if (!padIn(scr)) throw new Error('pad not restored');
    if (!padIn(scr).textContent.includes('Attempts left: 5')) throw new Error('attempts not reset');
    if (cardByTitle(scr, 'CARD BLOCKED (pending confirmation)')) throw new Error('banner still present');
  });
  clickPadDigits(padIn(sr('c-pending')), [1, 2, 3, 4]);
  await sleep(20);
  check('correct PIN 1234 → c-home with balance + history', () => {
    if (!visible('c-home')) throw new Error('c-home not visible');
    const scr = sr('c-home');
    if (!scr.textContent.includes('ZMW 268.50')) throw new Error('balance missing');
    if (!scr.textContent.includes('Nkosi Banda (0977 000 001)')) throw new Error('identity line missing');
    if (!scr.textContent.includes('CARD-0001 [active]')) throw new Error('cards line missing');
  });
  check('NO pay provision anywhere on c-home (or the whole page)', () => {
    const payText = doc.body.textContent.includes('Pay for an order');
    if (payText) throw new Error('"Pay for an order" text found');
    buttons(sr('c-home')).forEach((b) => {
      if (/pay/i.test(b.textContent)) throw new Error('pay-like button: ' + b.textContent);
    });
    screenNames.forEach((n) => {
      if (/checkout/i.test(n) && n.indexOf('c-') === 0) throw new Error('customer checkout screen present');
    });
  });
  check('c-home money table: 5 rows, correct columns, sign-prefixed amounts, 1 reversal (T-102)', () => {
    const t = moneyTables(sr('c-home'))[0];
    if (!t) throw new Error('table missing');
    const headers = Array.from(t.querySelectorAll('th')).map((x) => x.textContent.trim());
    if (headers.join(',') !== 'Date,Type,Amount,Running Balance') throw new Error('headers: ' + headers.join(','));
    const rows = t.querySelectorAll('tbody tr');
    if (rows.length !== 5) throw new Error('rows: ' + rows.length);
    const first = rows[0];
    if (first.textContent.indexOf('-18.50') !== -1 || first.textContent.indexOf('2026-10-15') === -1) {}
    if (!rows[0].textContent.includes('+36.00') || !rows[0].textContent.includes('268.50')) throw new Error('top row wrong: ' + rows[0].textContent);
    const reversals = t.querySelectorAll('.sk-money-table__reversal');
    if (reversals.length !== 1) throw new Error('reversals: ' + reversals.length);
  });
  btn('view full history →', sr('c-home')).click();
  await sleep(20);
  check('c-history full list: 6 rows + refund-question [?] button + back link', () => {
    if (!visible('c-history')) throw new Error('c-history not visible');
    const scr = sr('c-history');
    const t = moneyTables(scr)[0];
    if (t.querySelectorAll('tbody tr').length !== 6) throw new Error('expected 6 rows');
    if (t.querySelectorAll('.sk-money-table__reversal').length !== 1) throw new Error('reversal count wrong');
    if (!btn('[?] request refund (pick a REDEEM row)', scr)) throw new Error('request refund [?] missing');
    if (!scr.textContent.includes('who may refund? customer itself, or only staff?')) throw new Error('refund question text missing');
  });
  doc.querySelector('[data-sk-screen="c-history"] .sk-money-table__reversal').click();
  await sleep(10);
  check('reversal click alerts with the refund reference (R-103)', () => {
    if (!win.__alerts.length) throw new Error('no alert');
    if (!win.__alerts[win.__alerts.length - 1].includes('R-103')) throw new Error('wrong ref: ' + win.__alerts[win.__alerts.length - 1]);
  });

  /* ---------- Admin login ---------- */
  navBtn('a-login').click();
  await sleep(10);
  check('a-login fields + crossover to customer app', () => {
    const scr = sr('a-login');
    if (!btn('customer app (c-login) →', scr)) throw new Error('crossover missing');
  });
  btn('Sign in', sr('a-login')).click();
  await sleep(10);
  check('empty sign-in shows missing-fields message and stays on a-login', () => {
    if (!sr('a-login').textContent.includes('Missing username or password (mock: anything works).')) throw new Error('msg missing');
    if (!visible('a-login')) throw new Error('should stay on a-login');
  });
  setInput('Username', 'a-login', 'manager1');
  setInput('Password', 'a-login', 'secret');
  btn('Sign in', sr('a-login')).click();
  await sleep(20);
  check('sign in → a-dash with today numbers + alerts row', () => {
    if (!visible('a-dash')) throw new Error('a-dash hidden');
    const t = screenText('a-dash');
    if (!t.includes('Deposits (EARN)')) throw new Error('deposits missing');
    if (!t.includes('Checkouts (REDEEM)')) throw new Error('checkouts missing');
    if (!t.includes('Refunds (REFUND)')) throw new Error('refunds missing');
    if (!t.includes('Active cards')) throw new Error('cards missing');
    if (!t.includes('Alerts needing attention')) throw new Error('alerts missing');
  });

  /* ---------- Admin checkout (success walk) ---------- */
  btn('a-checkout', sr('a-dash')).click();
  await sleep(20);
  check('a-checkout step 1 amount visible after fresh entry', () => {
    if (!visible('a-checkout')) throw new Error('a-checkout hidden');
    if (!cardByTitle(sr('a-checkout'), 'Step 1 — amount')) throw new Error('step 1 missing');
  });
  btn('Next: customer taps card', sr('a-checkout')).click();
  await sleep(10);
  check('empty amount rejected with message', () => {
    if (!screenText('a-checkout').includes('Enter an amount greater than 0.')) throw new Error('validation msg missing');
  });
  setInput('Amount', 'a-checkout', '12.50');
  btn('Next: customer taps card', sr('a-checkout')).click();
  await sleep(20);
  check('step 2 tap: 4 active-card customer choices + inactive-tap simulation + back', () => {
    const scr = sr('a-checkout');
    if (!cardByTitle(scr, 'Step 2 — customer taps card')) throw new Error('step 2 missing');
    const choices = buttons(scr).filter((b) => /^C-000\d · /.test(b.textContent.trim()));
    if (choices.length !== 4) throw new Error('choices: ' + choices.length);
    if (!btn('Simulate tap with NON-ACTIVE card', scr)) throw new Error('inactive sim missing');
    if (!btn('← change amount', scr)) throw new Error('back button missing');
  });
  btn(buttons(sr('a-checkout')).map((b) => b.textContent.trim()).find((l) => l.startsWith('C-0001 ·')), sr('a-checkout')).click();
  await sleep(20);
  check('step 3 pin pad (customer-facing) shown with attempts 5', () => {
    const scr = sr('a-checkout');
    if (!cardByTitle(scr, 'Step 3 — customer-facing PIN pad (handed to customer)')) throw new Error('step 3 missing');
    const p = padIn(scr);
    if (!p.textContent.includes('Attempts left: 5')) throw new Error('attempts missing');
  });
  clickPadDigits(padIn(sr('a-checkout')), [1, 2, 3, 4]);
  await sleep(20);
  check('step 4 confirm shows amount + customer + card', () => {
    const scr = sr('a-checkout');
    if (!cardByTitle(scr, 'Step 4 — confirm')) throw new Error('step 4 missing');
    const t = screenText('a-checkout');
    if (!t.includes('Amount: ZMW 12.50 · customer: Nkosi Banda · card: CARD-0001')) throw new Error('confirm text wrong');
    if (!btn('Confirm and charge', scr)) throw new Error('confirm button missing');
    if (!btn('Cancel', scr)) throw new Error('cancel missing');
  });
  btn('Confirm and charge', sr('a-checkout')).click();
  await sleep(20);
  check('result success: title, new balance, refund hint, 3-row table, done/history buttons', () => {
    const scr = sr('a-checkout');
    const title = cardsOf(scr).map((c) => (c.querySelector('.sk-card__title') || { textContent: '' }).textContent).join('|');
    if (!title.includes('SUCCESS — charged ZMW 12.50')) throw new Error('success title missing');
    const t = screenText('a-checkout');
    if (!t.includes('New balance: ZMW 256.00 (was ZMW 268.50)')) throw new Error('balance line missing');
    if (!t.includes('REFUND HINT')) throw new Error('refund hint missing');
    const resultCard = cardByTitle(scr, 'SUCCESS');
    const table = resultCard.querySelector('[data-sk-component="sk-money-table"]');
    if (table.querySelectorAll('tbody tr').length !== 3) throw new Error('result table rows wrong');
    if (!btn('Done', resultCard)) throw new Error('Done missing');
    if (!btn('View history', resultCard)) throw new Error('View history missing');
  });

  /* ---------- Admin checkout (insufficient + blocked walks) ---------- */
  navBtn('a-dash').click();
  await sleep(10);
  btn('a-checkout', sr('a-dash')).click();
  await sleep(20);
  check('re-entering a-checkout resets to step 1', () => {
    if (!cardByTitle(sr('a-checkout'), 'Step 1 — amount')) throw new Error('no reset');
  });
  setInput('Amount', 'a-checkout', '500000');
  btn('Next: customer taps card', sr('a-checkout')).click();
  await sleep(15);
  const nk = buttons(sr('a-checkout')).find((b) => b.textContent.trim().startsWith('C-0001 ·'));
  nk.click();
  await sleep(15);
  clickPadDigits(padIn(sr('a-checkout')), [1, 2, 3, 4]);
  await sleep(15);
  btn('Confirm and charge', sr('a-checkout')).click();
  await sleep(20);
  check('insufficient balance → FAILED result, no money moved + Try again', () => {
    const scr = sr('a-checkout');
    const title = cardsOf(scr).map((c) => { const t = c.querySelector('.sk-card__title'); return t ? t.textContent : ''; }).join('|');
    if (!title.includes('FAILED')) throw new Error('failed title missing');
    if (!screenText('a-checkout').includes('FAILED — insufficient balance.')) throw new Error('reason missing');
    if (!screenText('a-checkout').includes('No money moved.')) throw new Error('no-money-moved missing');
    if (!btn('Try again', scr)) throw new Error('Try again missing');
  });
  btn('Back', sr('a-checkout')).click();
  await sleep(10);
  navBtn('a-dash').click();
  await sleep(10);
  btn('a-checkout', sr('a-dash')).click();
  await sleep(20);
  setInput('Amount', 'a-checkout', '5');
  btn('Next: customer taps card', sr('a-checkout')).click();
  await sleep(15);
  buttons(sr('a-checkout')).find((b) => b.textContent.trim().startsWith('C-0001 ·')).click();
  await sleep(15);
  for (let i = 0; i < 5; i++) {
    clickPadDigits(padIn(sr('a-checkout')), [9, 9, 9, 9]);
    await sleep(15);
    if (cardByTitle(sr('a-checkout'), 'CARD BLOCKED')) break;
  }
  check('checkout 5 wrong PINs → CARD BLOCKED banner with unlock', () => {
    const scr = sr('a-checkout');
    const blockedCard = cardByTitle(scr, 'CARD BLOCKED');
    if (!blockedCard) throw new Error('blocked card missing');
    if (!blockedCard.textContent.includes('BLOCKED BANNER')) throw new Error('banner text missing');
    if (!blockedCard.textContent.includes('No money moved.')) throw new Error('no money moved missing');
    if (!btn('Admin unlock (mock)', blockedCard)) throw new Error('unlock missing');
  });
  btn('Admin unlock (mock)', sr('a-checkout')).click();
  await sleep(20);
  check('admin unlock returns to pin step and card CARD-0001 is active again (a-cards view)', () => {
    if (!cardByTitle(sr('a-checkout'), 'Step 3 — customer-facing PIN pad (handed to customer)')) throw new Error('not back at pin step');
    const cardsText = screenText('a-cards');
    if (!cardsText.includes('CARD-0001')) throw new Error('CARD-0001 not in cards view');
    const row = cardsOf(sr('a-cards')).find((c) => {
      const t = c.querySelector('.sk-card__title');
      return t && t.textContent.includes('CARD-0001');
    });
    if (!row) throw new Error('card row missing');
    if (!row.textContent.includes('active')) throw new Error('CARD-0001 not active after unlock');
  });
  navBtn('a-dash').click();
  await sleep(10);

  /* ---------- a-customers + a-customer-detail + set-PIN ---------- */
  navBtn('a-customers').click();
  await sleep(10);
  check('a-customers lists 5 customers with cards/balance', () => {
    const scr = sr('a-customers');
    const items = scr.querySelectorAll('.sk-list__item');
    if (items.length !== 5) throw new Error('items: ' + items.length);
    if (!scr.textContent.includes('0977 000 001')) throw new Error('phone missing');
  });
  setInput('Search', 'a-customers', 'zulu');
  await sleep(15);
  check('working search narrows to Bupe Zulu only + empty-search message exists', () => {
    const scr = sr('a-customers');
    const items = scr.querySelectorAll('.sk-list__item');
    if (items.length !== 1) throw new Error('filtered items: ' + items.length);
    if (!scr.textContent.includes('Bupe Zulu')) throw new Error('Bupe missing');
    if (scr.textContent.includes('Nkosi Banda')) throw new Error('Nkosi should be filtered out');
  });
  setInput('Search', 'a-customers', 'zzz-nothing');
  await sleep(15);
  check('no-match shows "No customers match" message', () => {
    if (!screenText('a-customers').includes('No customers match')) throw new Error('empty message missing');
  });
  setInput('Search', 'a-customers', '');
  await sleep(15);
  btn('detail → Nkosi Banda', sr('a-customers')).click();
  await sleep(20);
  check('customer-detail: info + multi-card list with status pills', () => {
    const scr = sr('a-customer-detail');
    if (!visible('a-customer-detail')) throw new Error('not visible');
    if (!scr.textContent.includes('a-customer-detail (Nkosi Banda)')) throw new Error('title missing');
    if (!scr.textContent.includes('joined: 2026-09-30')) throw new Error('info missing');
    if (!scr.textContent.includes('ZMW 256.00')) throw new Error('updated balance missing');
    const pills = Array.from(scr.querySelectorAll('[data-sk-component="sk-pill"]')).map((p) => p.textContent.trim());
    if (pills.join(',') !== 'active,pending') throw new Error('pills: ' + pills.join(','));
    if (!scr.textContent.includes('Lifecycle caption')) throw new Error('lifecycle caption missing');
  });
  check('customer-detail action controls present (set PIN + 5 [?] buttons + money table)', () => {
    const scr = sr('a-customer-detail');
    ['[?] add card', '[?] block card', '[?] replace card', 'set PIN (customer-facing PIN pad modal)',
      '[?] deposit (unbuilt flow)', '[?] refund a transaction'].forEach((l) => {
      if (!btn(l, scr)) throw new Error('missing control: ' + l);
    });
    const t = moneyTables(scr)[0];
    if (t.querySelectorAll('tbody tr').length !== 7) throw new Error('detail history rows wrong (6 mock + 1 checkout)');
    if (t.querySelectorAll('.sk-money-table__reversal').length !== 1) throw new Error('reversal link missing');
  });
  btn('set PIN (customer-facing PIN pad modal)', sr('a-customer-detail')).click();
  await sleep(20);
  check('set-PIN modal (in-screen card, never a prompt box) with pad', () => {
    const scr = sr('a-customer-detail');
    const modal = cardByTitle(scr, 'Set new PIN — Nkosi Banda');
    if (!modal) throw new Error('modal missing');
    if (!modal.textContent.includes('replaces a prompt box')) throw new Error('note missing');
    if (padKeys(padIn(modal)).length !== 12) throw new Error('pad keys missing');
  });
  clickPadDigits(padIn(cardByTitle(sr('a-customer-detail'), 'Set new PIN')), [9, 8, 7, 6]);
  await sleep(15);
  btn('Set PIN', sr('a-customer-detail')).click();
  await sleep(20);
  check('set-PIN commits: mock message + modal closes + audit entry', () => {
    const scr = sr('a-customer-detail');
    if (!scr.textContent.includes('MOCK: PIN set for Nkosi Banda.')) throw new Error('msg missing');
    if (cardByTitle(scr, 'Set new PIN — Nkosi Banda')) throw new Error('modal still open');
  });

  /* ---------- a-cards filters + caption ---------- */
  navBtn('a-cards').click();
  await sleep(10);
  check('a-cards: 8 card rows each with [?] row action; caption present', () => {
    const scr = sr('a-cards');
    const items = scr.querySelectorAll('.sk-list__item');
    if (items.length !== 8) throw new Error('cards: ' + items.length);
    if (buttons(scr).filter((b) => b.textContent.trim() === '[?] row action').length !== 8) throw new Error('[?] row actions wrong');
    if (!scr.textContent.includes("pending → active (on first tap / staff activation)")) throw new Error('caption transitions missing');
    if (!btn("[?] is 'deleted' a state or never allowed?", scr)) throw new Error('deleted-state [?] missing');
  });
  btn('blocked', sr('a-cards')).click();
  await sleep(15);
  check('status filter=blocked → only CARD-0003 (Taonga)', () => {
    const scr = sr('a-cards');
    const items = scr.querySelectorAll('.sk-list__item');
    if (items.length !== 1) throw new Error('filtered: ' + items.length);
    if (!scr.textContent.includes('CARD-0003') || !scr.textContent.includes('Taonga Mwansa')) throw new Error('wrong card');
  });
  buttons(sr('a-cards')).find((b) => b.textContent.trim().startsWith('C-0001 ·')).click();
  await sleep(15);
  check('combined status=blocked + customer=C-0001 → zero rows message', () => {
    const scr = sr('a-cards');
    if (scr.querySelectorAll('.sk-list__item').length !== 0) throw new Error('expected 0 rows');
    if (!scr.textContent.includes('No cards match filters.')) throw new Error('empty text missing');
  });
  btn('(all)', sr('a-cards')).click();
  await sleep(15);
  const allBtns = buttons(sr('a-cards')).filter((b) => b.textContent.trim() === '(all)');
  allBtns[allBtns.length - 1].click();
  await sleep(15);
  check('status + customer filters reset → 8 rows again', () => {
    if (sr('a-cards').querySelectorAll('.sk-list__item').length !== 8) throw new Error('reset failed');
  });

  /* ---------- a-alerts (one resolves, one fails visibly) ---------- */
  navBtn('a-alerts').click();
  await sleep(10);
  check('a-alerts lists 4 alerts', () => {
    if (sr('a-alerts').querySelectorAll('.sk-list__item').length !== 4) throw new Error('alerts: wrong count');
  });
  const al1 = cardByTitle(sr('a-alerts'), 'AL-001');
  btn('Resolve', al1).click();
  await sleep(15);
  check('resolvable alert resolves with OK status', () => {
    const c = cardByTitle(sr('a-alerts'), 'AL-001');
    if (!c.textContent.includes('(resolved)')) throw new Error('resolved marker missing');
    if (!c.textContent.includes('OK — resolved')) throw new Error('ok status missing');
  });
  const al3 = cardByTitle(sr('a-alerts'), 'AL-003');
  btn('Resolve', al3).click();
  await sleep(15);
  check('failing alert shows VISIBLE error (old system bug reproduced)', () => {
    const c = cardByTitle(sr('a-alerts'), 'AL-003');
    if (!c.textContent.includes('ERROR: resolve FAILED — old system report API does not accept a resolve')) throw new Error('error not visible');
  });

  /* ---------- a-audit (live entries appended) ---------- */
  navBtn('a-audit').click();
  await sleep(10);
  check('a-audit lists who/what/when incl. live actions from this session', () => {
    const scr = sr('a-audit');
    const items = scr.querySelectorAll('.sk-list__item');
    if (items.length < 5) throw new Error('audit rows: ' + items.length);
    const t = scr.textContent;
    ['signed in to console', 'RESOLVED alert AL-001', 'checkout ZMW 12.50 via CARD-0001 (Nkosi Banda)',
      'set new PIN for Nkosi Banda', 'unlocked card CARD-0001 (Nkosi Banda)'].forEach((frag) => {
      if (!t.includes(frag)) throw new Error('missing audit entry: ' + frag);
    });
  });

  /* ---------- Post-checkout money semantics + sign-out ---------- */
  navBtn('c-history').click();
  await sleep(10);
  check('c-history reflects the mock checkout: new REDEEM row on top (-12.50, running 256.00)', () => {
    const t = moneyTables(sr('c-history'))[0];
    const rows = t.querySelectorAll('tbody tr');
    if (rows.length !== 7) throw new Error('rows: ' + rows.length);
    const top = rows[0].textContent;
    if (!top.includes('2026-10-16 (now, mock)') || !top.includes('-12.50') || !top.includes('256.00')) {
      throw new Error('top row wrong: ' + top);
    }
  });
  check('reversal button on the refunded row only; REFUND row shows +35.00', () => {
    const t = moneyTables(sr('c-history'))[0];
    const rows = Array.from(t.querySelectorAll('tbody tr'));
    const refundedIdx = rows.findIndex((r) => r.querySelector('.sk-money-table__reversal'));
    if (refundedIdx !== 5) throw new Error('reversal row index: ' + refundedIdx);
    if (!rows[refundedIdx].textContent.includes('2026-10-11')) throw new Error('wrong refunded row');
    if (!rows.some((r) => r.textContent.includes('+35.00') && !r.querySelector('.sk-money-table__reversal'))) {
      throw new Error('REFUND row +35.00 missing');
    }
  });
  navBtn('c-home').click();
  await sleep(10);
  btn('sign out', sr('c-home')).click();
  await sleep(10);
  check('sign out → back to c-login', () => {
    if (!visible('c-login')) throw new Error('not back at c-login');
  });
  navBtn('c-home').click();
  await sleep(10);
  check('c-home guarded when nobody is signed in (no crash, notice shown)', () => {
    if (!screenText('c-home').includes('No signed-in customer')) throw new Error('guard notice missing');
    if (moneyTables(sr('c-home')).length !== 0) throw new Error('table rendered without session');
  });
  navBtn('a-dash').click();
  await sleep(10);
  check('dash alert count still shows the full alert list size (4)', () => {
    if (!screenText('a-dash').includes('Alerts needing attention: 4')) throw new Error('alert count wrong');
  });

  /* ---------- Address composition on a contextual control + second comment round ---------- */
  navBtn('a-alerts').click();
  await sleep(10);
  check('component address carries screen / component / context (Resolve button)', () => {
    const b = doc.querySelector('[data-sk-component="sk-button"][data-sk-context="Resolve"]');
    if (!b) throw new Error('Resolve button with context missing');
    if (b.getAttribute('data-sk-address') !== 'a-alerts / sk-button / Resolve') {
      throw new Error('address wrong: ' + b.getAttribute('data-sk-address'));
    }
  });
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'i', bubbles: true }));
  await sleep(10);
  check('inspect re-entered via keyboard for the second comment round', () => {
    if (!Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.includes('Exit Inspect'))) throw new Error('inspect not on');
  });
  const al2 = cardByTitle(sr('a-alerts'), 'AL-002');
  const resolveBtn = btn('Resolve', al2);
  resolveBtn.dispatchEvent(new win.MouseEvent('mouseover', { bubbles: true, cancelable: true }));
  await sleep(10);
  check('inspect hover still outlines contextual buttons', () => {
    if (!resolveBtn.classList.contains('sk-inspect-outline')) throw new Error('outline missing');
  });
  resolveBtn.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(10);
  check('comment modal opens with the Resolve button address', () => {
    const modal = doc.querySelector('.sk-cockpit__modal');
    if (!modal) throw new Error('modal missing');
    const addr = doc.querySelector('.sk-cockpit__modal-address').textContent.trim();
    if (addr !== 'a-alerts / sk-button / Resolve') throw new Error('address: ' + addr);
  });
  const mt2 = doc.querySelector('.sk-cockpit__modal-text');
  mt2.value = 'Resolve should confirm with staff before marking done';
  mt2.dispatchEvent(new win.Event('input', { bubbles: true }));
  Array.from(doc.querySelectorAll('.sk-cockpit__modal-actions .sk-cockpit__btn')).find((b) => b.textContent.trim() === 'Save').click();
  await sleep(10);
  check('note saved → modal closes, note lands in notes list with address + pin badges', () => {
    if (doc.querySelector('.sk-cockpit__modal')) throw new Error('modal still open');
    const notes = doc.querySelectorAll('.sk-cockpit__note');
    if (notes.length !== 1) throw new Error('notes: ' + notes.length);
    if (!notes[0].textContent.includes('Resolve should confirm with staff before marking done')) throw new Error('note text missing');
    if (!doc.querySelector('.sk-cockpit__note-address').textContent.includes('a-alerts / sk-button / Resolve')) throw new Error('address missing');
    if (doc.querySelectorAll('.sk-cockpit__pin-layer .sk-cockpit__pin').length < 1) throw new Error('no pin badge');
  });
  check('AL-002 was NOT resolved by the inspect click (inspect swallows the click)', () => {
    const c = cardByTitle(sr('a-alerts'), 'AL-002');
    if (c.textContent.includes('(resolved)')) throw new Error('resolve leaked through inspect mode');
  });
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'i', bubbles: true }));
  await sleep(10);
  check('inspect off again after the second comment round', () => {
    if (!Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.includes('Inspect Mode'))) throw new Error('inspect stuck on');
  });

  /* ---------- Inspect mode + comment modal + pins + finish ---------- */
  navBtn('c-login').click();
  await sleep(10);
  const inspectBtn = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.trim() === 'Inspect Mode');
  check('inspect mode button exists', () => {
    if (!inspectBtn) throw new Error('missing');
  });
  inspectBtn.click();
  await sleep(10);
  check('inspect overlay teleported into preview region', () => {
    if (!doc.querySelector('.sk-preview-region .sk-cockpit__overlay')) throw new Error('overlay missing');
    if (!inspectBtn.textContent.includes('Exit Inspect')) throw new Error('button text did not flip');
  });
  const heading = sr('c-login').querySelector('[data-sk-component="sk-heading"]');
  heading.dispatchEvent(new win.MouseEvent('mouseover', { bubbles: true, cancelable: true }));
  await sleep(10);
  check('hover outlines a component (sk-inspect-outline)', () => {
    if (!heading.classList.contains('sk-inspect-outline')) throw new Error('outline class missing');
  });
  heading.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(10);
  check('inspect click opens comment modal with correct address', () => {
    const modal = doc.querySelector('.sk-cockpit__modal');
    if (!modal) throw new Error('modal missing');
    const addr = doc.querySelector('.sk-cockpit__modal-address').textContent.trim();
    if (!addr.startsWith('c-login / sk-heading')) throw new Error('address wrong: ' + addr);
  });
  const modalText = doc.querySelector('.sk-cockpit__modal-text');
  modalText.value = 'What should the tap sign-in feel like?';
  modalText.dispatchEvent(new win.Event('input', { bubbles: true }));
  Array.from(doc.querySelectorAll('.sk-cockpit__modal-actions .sk-cockpit__btn')).find((b) => b.textContent.trim() === 'Save').click();
  await sleep(10);
  check('save → modal closes, note lands in notes list with address + pin badge', () => {
    if (doc.querySelector('.sk-cockpit__modal')) throw new Error('modal still open');
    const notes = Array.from(doc.querySelectorAll('.sk-cockpit__note'));
    if (notes.length !== 2) throw new Error('notes: ' + notes.length);
    if (!notes.some((n) => n.textContent.includes('What should the tap sign-in feel like?'))) throw new Error('note text missing');
    if (!notes.some((n) => n.textContent.includes('c-login / sk-heading'))) throw new Error('address missing');
    const pins = Array.from(doc.querySelectorAll('.sk-cockpit__pin-layer .sk-cockpit__pin'));
    if (!pins.some((p) => p.textContent.trim() === '2')) throw new Error('pin #2 missing');
  });
  const pinsToggle = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.trim() === 'Hide Pins');
  pinsToggle.click();
  await sleep(10);
  check('Hide Pins hides badges; label flips to Show Pins', () => {
    if (doc.querySelectorAll('.sk-cockpit__pin-layer .sk-cockpit__pin').length !== 0) throw new Error('pins still visible');
    if (!pinsToggle.textContent.includes('Show Pins')) throw new Error('label did not flip');
  });
  pinsToggle.click();
  await sleep(10);
  check('Show Pins restores badge', () => {
    if (!doc.querySelector('.sk-cockpit__pin-layer .sk-cockpit__pin')) throw new Error('badge not restored');
  });
  check('__skExportNotes returns JSON with correct fields (finish-session payload)', () => {
    const data = win.__skExportNotes();
    if (!Array.isArray(data) || data.length !== 2) throw new Error('export shape wrong: ' + data.length);
    data.forEach((n) => {
      ['screen', 'component', 'context', 'note', 'time'].forEach((f) => {
        if (typeof n[f] !== 'string') throw new Error('field missing: ' + f);
      });
    });
    const heading = data.find((n) => n.screen === 'c-login' && n.component === 'sk-heading');
    const resolve = data.find((n) => n.screen === 'a-alerts' && n.component === 'sk-button' && n.context === 'Resolve');
    if (!heading) throw new Error('heading note missing from export');
    if (!resolve) throw new Error('resolve note missing from export');
  });
  const finishBtn = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.trim() === 'Finish Session');
  finishBtn.click();
  await sleep(10);
  check('Finish Session reports a download/copy status', () => {
    const st = doc.querySelector('.sk-cockpit__status');
    if (!st || !st.textContent.includes('Download')) throw new Error('status: ' + (st && st.textContent));
  });
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'i', bubbles: true }));
  await sleep(10);
  check('keyboard shortcut i toggles inspect mode (off first — inspect was on)', () => {
    if (!Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.includes('Inspect Mode'))) throw new Error('still in inspect after i');
  });
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'i', bubbles: true }));
  await sleep(10);
  check('keyboard shortcut i toggles inspect mode (on again)', () => {
    if (!Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find((b) => b.textContent.includes('Exit Inspect'))) throw new Error('not in inspect after i');
  });
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'i', bubbles: true }));
  await sleep(10);

  /* ---------- Summary ---------- */
  console.log('\n----------------------------');
  console.log('Total:', pass + fail);
  console.log('Passed:', pass);
  console.log('Failed:', fail);
  failures.forEach((f) => console.log('  FAILED:', f));
  console.log('----------------------------');
  process.exit(fail > 0 ? 1 : 0);
}

checkKitPaths();
run().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
