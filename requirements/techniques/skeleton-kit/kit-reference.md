# Skeleton Kit v1 — Reference

A zero-build, Vue 3 component kit for rapid UI skeletons. Uses the global Vue build (`window.Vue`).

## Host page pattern

```html
<link rel="stylesheet" href="skeleton-kit.css">
<div id="app">
  <sk-cockpit preview-selector=".sk-preview-region"></sk-cockpit>
  <div class="sk-preview-region">
    <sk-screen name="Login" layout="column" gap="12px" v-show="active==='Login'">
      <!-- declarations -->
    </sk-screen>
  </div>
</div>
<script src="vue.global.prod.js"></script>
<script src="skeleton-kit.js"></script>
<script src="cockpit.js"></script>
<script>
  const { createApp, ref } = Vue;
  const { screens, active, register, navigate } = skUseScreens();
  const App = {
    setup() { return { active: screens.active, myData: ref([]) }; }
  };
  register([{ name: 'Login', label: 'Login' }]);
  const app = createApp(App);
  registerSkeletonKit(app);
  registerSkeletonKitCockpit(app);
  app.mount('#app');
</script>
```

Rules: `<div class="sk-preview-region">` must exist and be `position: relative`. The host page must wrap the cockpit and preview region in `<div id="app">` so the shell grid can position them. No `fetch`, no ES modules.

## Shell configuration

Set `window.SK_SHELL` before mounting the app to configure the cockpit chrome:

```js
window.SK_SHELL = {
  title: 'My Project Skeleton',
  help: 'Put the purpose of this skeleton here.\n\nINSPECT — outline and click any component to comment.\nDevice toggle switches between phone and desktop widths.\nFinish Session exports notes as JSON.'
};
```

- `title` — shown in the shell header bar.
- `help` — shown in the Help [?] modal. Plain text; split into paragraphs on blank lines.

If `window.SK_SHELL` is omitted, the shell uses sensible defaults (`Skeleton Session` + generic help).

## Address scheme

Every kit component carries `data-sk-address="Screen / component / context"`. Address is composed as `screen / component-type / context` where `context` is usually a label/title/status prop.

## Components

### Layout

- `<sk-screen name layout="column|row|stack" gap align scroll-y height>` — named viewport region.
- `<sk-row gap align>` — horizontal flex container.
- `<sk-column gap align>` — vertical flex container.

### Atoms

- `<sk-text tag="p">text</sk-text>` — paragraph/inline text.
- `<sk-heading level="1">title</sk-heading>` — h1–h6.
- `<sk-button label variant="default|primary" @click>` — button. Functional tint by default; primary is a stronger tint.
- `<sk-card title>` — subtle-fill card with optional title.
- `<sk-field label placeholder value type @input @update:value>` — label + input.
- `<sk-pill status>` — small semantic status badge (active/pending/blocked/replaced get muted pastels).
- `<sk-divider>` — horizontal rule.
- `<sk-list :bind="[]" cols="1"><template #default="{ item, index }">...</template></sk-list>` — grid list.
- `<sk-money-table :bind="rows" @reversal>` — columns: Date, Type, Amount, Running Balance; amounts prefixed with `+`/`-` get muted sign colors; reversal button rendered when `row.refunded` is truthy.
- `<sk-tap-target label @tap>` — large tinted tap box.
- `<sk-pin-pad attempts-left pin-length dots @complete>` — digit grid, Clear/Enter, emits complete PIN.

## Cockpit

`<sk-cockpit preview-selector=".sk-preview-region">`

The cockpit is the application shell. The preview region is rendered as an inset window inside it:

- Header bar: project title, device toggle (phone ⇄ desktop), INSPECT toggle, Help [?], Finish Session.
- Left sidebar: screens `<select>` dropdown, "＋ Add screen" inline input, legacy screen buttons (`.sk-cockpit__nav-item`).
- Center: preview window with a title strip showing the current screen.
- Right sidebar: collapsible notes panel with delete + empty state.
- Help modal: opens from header [?]; content from `window.SK_SHELL`.
- Inspect Mode toggle: overlays the preview, outlines the component under the pointer, click/tap opens a comment modal.
- Pins toggle: shows/hides numbered badges on annotated components.
- Notes list: all stored notes with delete.
- Finish Session: downloads `nfc-skeleton-notes-<date>.json`, copies to clipboard if available, shows status.
- Screen nav: lists screens registered via `skUseScreens().register([...])` and supports `addScreen(name)`.
- Keyboard shortcut: `i` toggles inspect mode; `Escape` closes modals.

## API globals

- `skUseFeedback()` — `{ notes, addNote, deleteNote, clearNotes, exportNotes, notesFor }`
- `skUseScreens()` — `{ screens, active, register, navigate, addScreen }`
- `skAddScreen(name)` — window shorthand; appends a placeholder screen to the registry, creates a placeholder DOM element in `.sk-preview-region`, and navigates to it.
- `window.__skExportNotes()` — returns notes JSON `[{screen, component, context, note, time}]`
- `registerSkeletonKit(app)` / `registerSkeletonKitCockpit(app)` — register components on a Vue app.

## Storage

Notes are stored in `localStorage` under `sk-feedback-notes`. If the origin is opaque (`file://`) or quota is denied, the store falls back to an in-memory array for the session.

## Styling boundary

- **Preview** (`sk-preview-region` and every `sk-*` component inside it) uses functional color-coding only: component-type tints for interactive elements, header/zebra fills for tables, muted sign colors for money, and semantic pastels for status pills. No brand colors, gradients, decorative type, or shadows-for-beauty.
- **Session chrome** (`sk-cockpit`, the inspect overlay/pins, and the comment/help modals) is styled with a distinct dark-slate visual language, system font stack, focus rings, and comfortable touch targets. It is meant to look foreign to the preview so it cannot be mistaken for the system being designed.
