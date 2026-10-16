/* skeleton-kit verification — run with: node verify.js */
'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const KIT_DIR = '/home/bulaya/SoftwareDevelopmentProjects/system-engineer/requirements/techniques/skeleton-kit';

let pass = 0;
let fail = 0;

function check(name, fn) {
  try {
    fn();
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
  while ((match = re.exec(html)) !== null) {
    const attrs = match[1];
    if (!/\bsrc\s*=/.test(attrs)) {
      return match[2];
    }
  }
  return '';
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

function loadInline(htmlPath) {
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const inlineScript = extractInlineScript(rawHtml);
  const html = stripScripts(rawHtml);

  const dom = new JSDOM(html, {
    url: 'file://' + htmlPath,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });

  const win = dom.window;
  const vueSrc = fs.readFileSync(path.join(KIT_DIR, 'vue.global.prod.js'), 'utf8');
  const kitSrc = fs.readFileSync(path.join(KIT_DIR, 'skeleton-kit.js'), 'utf8');
  const cockpitSrc = fs.readFileSync(path.join(KIT_DIR, 'cockpit.js'), 'utf8');

  win.eval(vueSrc);
  win.eval(kitSrc);
  win.eval(cockpitSrc);
  if (inlineScript.trim()) {
    win.eval(inlineScript);
  }

  return dom;
}

async function runMainAssertions() {
  const dom = loadInline(path.join(KIT_DIR, 'example.html'));
  const win = dom.window;
  const doc = win.document;

  // Give Vue a tick to mount
  await sleep(50);

  /* ---------- Environment & globals ---------- */
  check('Vue global build loaded', () => {
    if (!win.Vue) throw new Error('window.Vue missing');
  });

  check('Vue exposes createApp', () => {
    if (typeof win.Vue.createApp !== 'function') throw new Error('Vue.createApp missing');
  });

  check('Skeleton kit globals present', () => {
    if (typeof win.skUseFeedback !== 'function') throw new Error('skUseFeedback missing');
    if (typeof win.skUseScreens !== 'function') throw new Error('skUseScreens missing');
    if (typeof win.registerSkeletonKit !== 'function') throw new Error('registerSkeletonKit missing');
    if (typeof win.skBuildAddress !== 'function') throw new Error('skBuildAddress missing');
    if (typeof win.skParseAddress !== 'function') throw new Error('skParseAddress missing');
  });

  check('Cockpit globals present', () => {
    if (typeof win.registerSkeletonKitCockpit !== 'function') throw new Error('registerSkeletonKitCockpit missing');
    if (typeof win.SkeletonKitCockpit !== 'object') throw new Error('SkeletonKitCockpit missing');
  });

  check('Component registration list contains expected components', () => {
    const names = Object.values(win.SkeletonKitComponents).map((c) => c.name);
    const expected = [
      'sk-screen', 'sk-row', 'sk-column', 'sk-text', 'sk-heading',
      'sk-button', 'sk-card', 'sk-field', 'sk-pill', 'sk-divider',
      'sk-list', 'sk-money-table', 'sk-tap-target', 'sk-pin-pad'
    ];
    expected.forEach((n) => {
      if (!names.includes(n)) throw new Error('Missing component ' + n);
    });
  });

  check('skBuildAddress composes screen / component / context', () => {
    const addr = win.skBuildAddress('Home', 'sk-button', 'Refresh');
    if (addr !== 'Home / sk-button / Refresh') throw new Error('Unexpected address: ' + addr);
  });

  check('skParseAddress splits address into three parts', () => {
    const parsed = win.skParseAddress('Home / sk-button / Refresh');
    if (parsed.screen !== 'Home') throw new Error('screen mismatch');
    if (parsed.component !== 'sk-button') throw new Error('component mismatch');
    if (parsed.context !== 'Refresh') throw new Error('context mismatch');
  });

  check('skParseAddress handles missing context', () => {
    const parsed = win.skParseAddress('Home / sk-text');
    if (parsed.screen !== 'Home') throw new Error('screen mismatch');
    if (parsed.component !== 'sk-text') throw new Error('component mismatch');
    if (parsed.context !== '') throw new Error('context should be empty');
  });

  check('Cockpit component registered as sk-cockpit', () => {
    if (win.SkeletonKitCockpit.name !== 'sk-cockpit') throw new Error('Cockpit name mismatch');
  });

  /* ---------- Screen rendering ---------- */
  check('Three screens render in DOM', () => {
    const screens = doc.querySelectorAll('[data-sk-component="sk-screen"]');
    if (screens.length !== 3) throw new Error('Expected 3 screens, got ' + screens.length);
  });

  check('Login screen name attribute set', () => {
    const login = doc.querySelector('[data-sk-screen="Login"]');
    if (!login) throw new Error('Login screen missing');
  });

  check('Home screen name attribute set', () => {
    const home = doc.querySelector('[data-sk-screen="Home"]');
    if (!home) throw new Error('Home screen missing');
  });

  check('Admin screen name attribute set', () => {
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    if (!admin) throw new Error('Admin screen missing');
  });

  check('Login screen is initially active', () => {
    const login = doc.querySelector('[data-sk-screen="Login"]');
    if (login.style.display === 'none') throw new Error('Login screen hidden');
  });

  check('Inactive screens are hidden', () => {
    const home = doc.querySelector('[data-sk-screen="Home"]');
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    if (home.style.display !== 'none') throw new Error('Home should be hidden initially');
    if (admin.style.display !== 'none') throw new Error('Admin should be hidden initially');
  });

  check('Screen layout class applied', () => {
    const login = doc.querySelector('[data-sk-screen="Login"]');
    if (!login.classList.contains('sk-screen--column')) throw new Error('Column layout class missing');
  });

  /* ---------- Cockpit navigation ---------- */
  check('Cockpit navigation lists three screens', () => {
    const navItems = doc.querySelectorAll('.sk-cockpit__nav-item');
    if (navItems.length !== 3) throw new Error('Expected 3 nav items, got ' + navItems.length);
  });

  check('Cockpit nav labels match screen names', () => {
    const labels = Array.from(doc.querySelectorAll('.sk-cockpit__nav-item')).map((b) => b.textContent.trim());
    if (labels.join(',') !== 'Login,Home,Admin') throw new Error('Unexpected nav labels: ' + labels.join(','));
  });

  check('Cockpit nav marks Login active initially', () => {
    const active = doc.querySelector('.sk-cockpit__nav-item--active');
    if (!active || active.textContent.trim() !== 'Login') throw new Error('Login not active in nav');
  });

  // Navigate to Home
  const navItems = doc.querySelectorAll('.sk-cockpit__nav-item');
  navItems[1].click();
  await sleep(10);

  check('Navigation switches active screen to Home', () => {
    const home = doc.querySelector('[data-sk-screen="Home"]');
    if (!home) throw new Error('Home screen missing');
    if (home.style.display === 'none') throw new Error('Home screen hidden after nav');
    const login = doc.querySelector('[data-sk-screen="Login"]');
    if (login.style.display !== 'none') throw new Error('Login screen still visible');
  });

  check('Cockpit nav updates active marker after navigation', () => {
    const active = doc.querySelector('.sk-cockpit__nav-item--active');
    if (!active || active.textContent.trim() !== 'Home') throw new Error('Home not active in nav');
  });

  /* ---------- Money table ---------- */
  check('Money table renders', () => {
    const table = doc.querySelector('[data-sk-component="sk-money-table"]');
    if (!table) throw new Error('Money table missing');
  });

  check('Money table has four column headers', () => {
    const headers = Array.from(doc.querySelectorAll('[data-sk-component="sk-money-table"] th'));
    if (headers.length !== 4) throw new Error('Expected 4 headers, got ' + headers.length);
  });

  check('Money table headers are Date, Type, Amount, Running Balance', () => {
    const headers = Array.from(doc.querySelectorAll('[data-sk-component="sk-money-table"] th')).map((th) => th.textContent.trim());
    if (headers.join(',') !== 'Date,Type,Amount,Running Balance') {
      throw new Error('Unexpected headers: ' + headers.join(','));
    }
  });

  check('Money table renders three rows', () => {
    const rows = doc.querySelectorAll('[data-sk-component="sk-money-table"] tbody tr');
    if (rows.length !== 3) throw new Error('Expected 3 rows, got ' + rows.length);
  });

  check('Money table first row date matches mock data', () => {
    const cell = doc.querySelector('[data-sk-component="sk-money-table"] tbody tr td');
    if (cell.textContent.trim() !== '2026-10-01') throw new Error('Unexpected first date: ' + cell.textContent);
  });

  check('Money table running balance cell rendered', () => {
    const row = doc.querySelector('[data-sk-component="sk-money-table"] tbody tr');
    const cells = row.querySelectorAll('td');
    if (cells.length !== 4) throw new Error('Expected 4 cells per row');
    if (!cells[3].textContent.includes('K 500.00')) throw new Error('Running balance missing');
  });

  check('Money table shows reversal link for refunded row only', () => {
    const rows = doc.querySelectorAll('[data-sk-component="sk-money-table"] tbody tr');
    const hasReversal = Array.from(rows).map((r) => !!r.querySelector('.sk-money-table__reversal'));
    if (hasReversal.join(',') !== 'false,false,true') {
      throw new Error('Reversal link presence mismatch: ' + hasReversal.join(','));
    }
  });

  /* ---------- Button on Home ---------- */
  check('Primary button renders with heavier border', () => {
    const btn = doc.querySelector('[data-sk-component="sk-button"]');
    if (!btn) throw new Error('Button missing');
    if (!btn.classList.contains('sk-button--primary')) throw new Error('Primary variant class missing');
  });

  /* ---------- Navigate back to Login / tap-target flow ---------- */
  navItems[0].click();
  await sleep(10);

  check('Tap target renders on Login', () => {
    const tap = doc.querySelector('[data-sk-component="sk-tap-target"]');
    if (!tap) throw new Error('Tap target missing');
  });

  check('Tap target shows label', () => {
    const tap = doc.querySelector('[data-sk-component="sk-tap-target"]');
    if (tap.textContent.trim() !== 'Tap to start') throw new Error('Unexpected label: ' + tap.textContent);
  });

  const tapTarget = doc.querySelector('[data-sk-component="sk-tap-target"]');

  check('Tap target has role=button', () => {
    if (tapTarget.getAttribute('role') !== 'button') throw new Error('role=button missing');
  });

  tapTarget.click();
  await sleep(10);

  check('Tap target click reveals pin pad', () => {
    const pad = doc.querySelector('[data-sk-component="sk-pin-pad"]');
    if (!pad) throw new Error('Pin pad did not appear');
  });

  /* ---------- Pin pad ---------- */
  const pad = doc.querySelector('[data-sk-component="sk-pin-pad"]');

  check('Pin pad displays attempts left', () => {
    const attempts = pad.querySelector('.sk-pin-pad__attempts');
    if (!attempts || !attempts.textContent.includes('3')) throw new Error('Attempts left not rendered');
  });

  check('Pin pad renders 12 keys (0-9, Clear, Enter)', () => {
    const keys = pad.querySelectorAll('.sk-pin-pad__key');
    if (keys.length !== 12) throw new Error('Expected 12 keys, got ' + keys.length);
  });

  check('Pin pad digit keys include 0-9', () => {
    const labels = Array.from(pad.querySelectorAll('.sk-pin-pad__key')).map((k) => k.textContent.trim());
    for (let d = 0; d <= 9; d++) {
      if (!labels.includes(String(d))) throw new Error('Missing digit key ' + d);
    }
  });

  check('Pin pad has Clear and Enter keys', () => {
    const labels = Array.from(pad.querySelectorAll('.sk-pin-pad__key')).map((k) => k.textContent.trim());
    if (!labels.includes('Clear')) throw new Error('Clear key missing');
    if (!labels.includes('Enter')) throw new Error('Enter key missing');
  });

  check('Pin pad renders dots', () => {
    const dots = pad.querySelectorAll('.sk-pin-pad__dot');
    if (dots.length !== 4) throw new Error('Expected 4 dots, got ' + dots.length);
  });

  // Enter PIN 1234
  const keys = Array.from(pad.querySelectorAll('.sk-pin-pad__key'));
  function clickDigit(d) {
    const key = keys.find((k) => k.textContent.trim() === String(d));
    if (!key) throw new Error('Digit key not found: ' + d);
    key.click();
  }

  [1, 2, 3].forEach(clickDigit);
  await sleep(10);

  check('Pin pad fills dots after three digits', () => {
    const filled = pad.querySelectorAll('.sk-pin-pad__dot--filled');
    if (filled.length !== 3) throw new Error('Expected 3 filled dots, got ' + filled.length);
  });

  clickDigit(4);
  await sleep(10);

  check('Pin pad complete navigates to Home', () => {
    const home = doc.querySelector('[data-sk-component="sk-screen"][data-sk-context="Home"]');
    if (!home) throw new Error('Home screen not found');
    if (home.style.display === 'none') throw new Error('Did not navigate to Home after PIN');
  });

  /* ---------- Inspect mode ---------- */
  const inspectBtn = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find(
    (b) => b.textContent.trim() === 'Inspect Mode'
  );
  check('Inspect mode button exists', () => {
    if (!inspectBtn) throw new Error('Inspect mode button missing');
  });

  inspectBtn.click();
  await sleep(10);

  check('Inspect mode button text changes to Exit Inspect', () => {
    if (!inspectBtn.textContent.includes('Exit Inspect')) throw new Error('Button text did not change');
  });

  check('Inspect mode renders overlay in preview region', () => {
    const overlay = doc.querySelector('.sk-preview-region .sk-cockpit__overlay');
    if (!overlay) throw new Error('Overlay not teleported into preview region');
  });

  check('Inspect overlay has pointer-events-none style class semantics', () => {
    const overlay = doc.querySelector('.sk-preview-region .sk-cockpit__overlay');
    if (!overlay.classList.contains('sk-cockpit__overlay')) throw new Error('Overlay class missing');
  });

  // Hover outline
  const activeScreen = doc.querySelector('[data-sk-component="sk-screen"]:not([style*="display: none"])');
  const heading = activeScreen.querySelector('[data-sk-component="sk-heading"]');
  const mouseEvent = new win.MouseEvent('mouseover', { bubbles: true, cancelable: true });
  heading.dispatchEvent(mouseEvent);
  await sleep(10);

  check('Hover adds inspect outline to component', () => {
    if (!heading.classList.contains('sk-inspect-outline')) {
      throw new Error('Outline class not added on hover');
    }
  });

  // Click opens comment modal
  const clickEvent = new win.MouseEvent('click', { bubbles: true, cancelable: true });
  heading.dispatchEvent(clickEvent);
  await sleep(10);

  check('Click in inspect mode opens comment modal', () => {
    const modal = doc.querySelector('.sk-cockpit__modal');
    if (!modal) throw new Error('Modal not rendered');
  });

  check('Comment modal shows the correct address', () => {
    const address = doc.querySelector('.sk-cockpit__modal-address');
    if (!address) throw new Error('Modal address missing');
    const text = address.textContent.trim();
    if (!text.includes('sk-heading')) throw new Error('Address missing component: ' + text);
    if (!text.includes('Home')) throw new Error('Address missing screen: ' + text);
  });

  check('Comment modal contains textarea', () => {
    const textarea = doc.querySelector('.sk-cockpit__modal-text');
    if (!textarea) throw new Error('Modal textarea missing');
  });

  check('Comment modal contains Save and Cancel buttons', () => {
    const actions = doc.querySelectorAll('.sk-cockpit__modal-actions .sk-cockpit__btn');
    const labels = Array.from(actions).map((b) => b.textContent.trim());
    if (!labels.includes('Save')) throw new Error('Save button missing');
    if (!labels.includes('Cancel')) throw new Error('Cancel button missing');
  });

  // Cancel a note
  const cancelBtn = Array.from(doc.querySelectorAll('.sk-cockpit__modal-actions .sk-cockpit__btn')).find(
    (b) => b.textContent.trim() === 'Cancel'
  );
  cancelBtn.click();
  await sleep(10);

  check('Cancel closes modal without saving note', () => {
    if (doc.querySelector('.sk-cockpit__modal')) throw new Error('Modal still open after cancel');
    const notes = doc.querySelectorAll('.sk-cockpit__note');
    if (notes.length !== 0) throw new Error('Cancel saved a note');
  });

  // Re-open modal to save a note
  heading.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(10);

  // Save a note
  const textarea = doc.querySelector('.sk-cockpit__modal-text');
  textarea.value = 'Heading feels too large';
  textarea.dispatchEvent(new win.Event('input', { bubbles: true }));

  const saveBtn = Array.from(doc.querySelectorAll('.sk-cockpit__modal-actions .sk-cockpit__btn')).find(
    (b) => b.textContent.trim() === 'Save'
  );
  saveBtn.click();
  await sleep(10);

  check('Saving note closes the modal', () => {
    if (doc.querySelector('.sk-cockpit__modal')) throw new Error('Modal still open after save');
  });

  check('Saving note adds it to notes list', () => {
    const notes = doc.querySelectorAll('.sk-cockpit__note');
    if (notes.length !== 1) throw new Error('Expected 1 note, got ' + notes.length);
    const text = notes[0].textContent;
    if (!text.includes('Heading feels too large')) throw new Error('Note text not found in list');
  });

  check('Notes counter shows 1', () => {
    const counter = doc.querySelector('.sk-cockpit__notes strong');
    if (!counter.textContent.includes('1')) throw new Error('Counter incorrect: ' + counter.textContent);
  });

  check('Note address displayed in notes list', () => {
    const note = doc.querySelector('.sk-cockpit__note-address');
    if (!note.textContent.includes('sk-heading')) throw new Error('Note address missing component');
  });

  check('notesFor returns the saved note by address', () => {
    const fb = win.skUseFeedback();
    const noteAddress = doc.querySelector('.sk-cockpit__note-address').textContent.trim();
    const matches = fb.notesFor(noteAddress);
    if (matches.length !== 1) throw new Error('Expected 1 matching note, got ' + matches.length);
    if (matches[0].note !== 'Heading feels too large') throw new Error('notesFor text mismatch');
  });

  check('localStorage or memory stores the note', () => {
    let stored = null;
    try {
      stored = win.localStorage.getItem('sk-feedback-notes');
    } catch (e) {
      /* opaque origin — memory fallback expected */
    }
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length !== 1) throw new Error('Unexpected stored note count');
      if (!parsed[0].note.includes('Heading feels too large')) throw new Error('Stored note text mismatch');
    } else {
      const exported = win.__skExportNotes();
      if (exported.length !== 1 || exported[0].note !== 'Heading feels too large') {
        throw new Error('Note not found in memory fallback');
      }
    }
  });

  check('Pin badge appears on annotated component', () => {
    const pin = doc.querySelector('.sk-cockpit__pin-layer .sk-cockpit__pin');
    if (!pin) throw new Error('Pin badge missing');
    if (pin.textContent.trim() !== '1') throw new Error('Expected pin #1, got ' + pin.textContent);
  });

  // Hide pins
  const pinsBtn = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find(
    (b) => b.textContent.trim() === 'Hide Pins'
  );
  check('Pins visibility toggle exists', () => {
    if (!pinsBtn) throw new Error('Hide Pins button missing');
  });

  pinsBtn.click();
  await sleep(10);

  check('Visibility toggle hides pins', () => {
    const pins = doc.querySelectorAll('.sk-cockpit__pin-layer .sk-cockpit__pin');
    if (pins.length !== 0) throw new Error('Expected 0 pins after hide, got ' + pins.length);
  });

  check('Visibility toggle text changes to Show Pins', () => {
    if (!pinsBtn.textContent.includes('Show Pins')) throw new Error('Button text did not change');
  });

  // Show pins again
  pinsBtn.click();
  await sleep(10);

  check('Show Pins restores pin badge', () => {
    const pin = doc.querySelector('.sk-cockpit__pin-layer .sk-cockpit__pin');
    if (!pin) throw new Error('Pin badge not restored');
  });

  /* ---------- Finish session / export ---------- */
  check('window.__skExportNotes is a function before finishing', () => {
    if (typeof win.__skExportNotes !== 'function') throw new Error('__skExportNotes missing');
  });

  check('window.__skExportNotes returns notes JSON with correct fields', () => {
    const data = win.__skExportNotes();
    if (!Array.isArray(data)) throw new Error('Export not an array');
    if (data.length !== 1) throw new Error('Expected 1 exported note, got ' + data.length);
    const note = data[0];
    if (typeof note.screen !== 'string' || !note.screen) throw new Error('Missing/invalid screen field');
    if (typeof note.component !== 'string' || !note.component) throw new Error('Missing/invalid component field');
    if (typeof note.context !== 'string') throw new Error('Missing/invalid context field');
    if (typeof note.note !== 'string' || !note.note) throw new Error('Missing/invalid note field');
    if (typeof note.time !== 'string' || !note.time) throw new Error('Missing/invalid time field');
    if (note.note !== 'Heading feels too large') throw new Error('Exported note text mismatch');
  });

  check('Finish Session button exists', () => {
    const finish = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find(
      (b) => b.textContent.trim() === 'Finish Session'
    );
    if (!finish) throw new Error('Finish Session button missing');
  });

  const finishBtn = Array.from(doc.querySelectorAll('.sk-cockpit__btn')).find(
    (b) => b.textContent.trim() === 'Finish Session'
  );
  if (typeof win.URL.createObjectURL !== 'function') {
    win.URL.createObjectURL = function (blob) {
      return 'blob:' + Math.random().toString(36);
    };
    win.URL.revokeObjectURL = function () {};
  }
  finishBtn.click();
  await sleep(10);

  check('Finish Session shows status text', () => {
    const status = doc.querySelector('.sk-cockpit__status');
    if (!status) throw new Error('Status text missing');
    if (!status.textContent.includes('Download')) throw new Error('Unexpected status: ' + status.textContent);
  });

  check('clearNotes removes all notes and pins', async () => {
    const fb = win.skUseFeedback();
    fb.clearNotes();
    await sleep(10);
    if (fb.notes.value.length !== 0) throw new Error('Notes not cleared');
    const pins = doc.querySelectorAll('.sk-cockpit__pin-layer .sk-cockpit__pin');
    if (pins.length !== 0) throw new Error('Pins still visible after clear');
    const listNotes = doc.querySelectorAll('.sk-cockpit__note');
    if (listNotes.length !== 0) throw new Error('Notes list not emptied');
  });

  /* ---------- Admin screen ---------- */
  const adminNav = Array.from(doc.querySelectorAll('.sk-cockpit__nav-item')).find(
    (b) => b.textContent.trim() === 'Admin'
  );
  adminNav.click();
  await sleep(10);

  check('Admin screen becomes visible', () => {
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    if (!admin) throw new Error('Admin screen missing');
    if (admin.style.display === 'none') throw new Error('Admin screen hidden');
  });

  check('Admin list renders four user cards', () => {
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    const items = admin.querySelectorAll('.sk-list__item');
    if (items.length !== 4) throw new Error('Expected 4 list items, got ' + items.length);
  });

  check('Admin list uses two columns', () => {
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    const list = admin.querySelector('[data-sk-component="sk-list"]');
    if (!list) throw new Error('List missing');
    if (list.style.gridTemplateColumns !== 'repeat(2, 1fr)') {
      throw new Error('List columns not set: ' + list.style.gridTemplateColumns);
    }
  });

  check('Admin cards render titles', () => {
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    const titles = admin.querySelectorAll('.sk-card__title');
    if (titles.length !== 4) throw new Error('Expected 4 card titles, got ' + titles.length);
  });

  check('Admin pills show roles', () => {
    const admin = doc.querySelector('[data-sk-screen="Admin"]');
    const pills = admin.querySelectorAll('[data-sk-component="sk-pill"]');
    if (pills.length !== 4) throw new Error('Expected 4 pills, got ' + pills.length);
  });

  return { dom, pass, fail };
}

async function runFallbackAssertion() {
  const rawHtml = fs.readFileSync(path.join(KIT_DIR, 'example.html'), 'utf8');
  const inlineScript = extractInlineScript(rawHtml);
  const html = stripScripts(rawHtml);

  const dom = new JSDOM(html, {
    url: 'file://' + path.join(KIT_DIR, 'example.html'),
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
  });
  const win = dom.window;

  // Remove localStorage before scripts load
  delete win.localStorage;

  const vueSrc = fs.readFileSync(path.join(KIT_DIR, 'vue.global.prod.js'), 'utf8');
  const kitSrc = fs.readFileSync(path.join(KIT_DIR, 'skeleton-kit.js'), 'utf8');
  const cockpitSrc = fs.readFileSync(path.join(KIT_DIR, 'cockpit.js'), 'utf8');

  win.eval(vueSrc);
  win.eval(kitSrc);
  win.eval(cockpitSrc);
  if (inlineScript.trim()) {
    win.eval(inlineScript);
  }

  await sleep(50);

  check('localStorage fallback path does not crash', () => {
    const fb = win.skUseFeedback();
    fb.addNote('Test / sk-button / x', 'fallback note');
    if (fb.notes.value.length !== 1) throw new Error('Note not stored in memory fallback');
    const exported = fb.exportNotes();
    if (exported[0].note !== 'fallback note') throw new Error('Exported fallback note mismatch');
  });

  check('Fallback notes survive clearNotes', () => {
    const fb = win.skUseFeedback();
    fb.clearNotes();
    if (fb.notes.value.length !== 0) throw new Error('clearNotes did not empty memory fallback');
  });
}

async function main() {
  console.log('Running skeleton-kit verification...\n');
  await runMainAssertions();
  await runFallbackAssertion();

  console.log('\n----------------------------');
  console.log('Total:', pass + fail);
  console.log('Passed:', pass);
  console.log('Failed:', fail);
  console.log('----------------------------');

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
