# Skeleton Kit v1 — Reference

A zero-build, monochrome Vue 3 component kit for rapid UI skeletons. Uses the global Vue build (`window.Vue`).

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

Rules: `<div class="sk-preview-region">` must exist and be `position: relative`. Screens are plain custom elements. No `fetch`, no ES modules.

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
- `<sk-button label variant="default|primary" @click>` — button; variants differ only in border weight.
- `<sk-card title>` — bordered card with optional title.
- `<sk-field label placeholder value type @input @update:value>` — label + input.
- `<sk-pill status>` — small bordered status badge.
- `<sk-divider>` — horizontal rule.
- `<sk-list :bind="[]" cols="1"><template #default="{ item, index }">...</template></sk-list>` — grid list.
- `<sk-money-table :bind="rows" @reversal>` — columns: Date, Type, Amount, Running Balance; reversal button rendered when `row.refunded` is truthy.
- `<sk-tap-target label @tap>` — large bordered tap box.
- `<sk-pin-pad attempts-left pin-length dots @complete>` — digit grid, Clear/Enter, emits complete PIN.

## Cockpit

`<sk-cockpit preview-selector=".sk-preview-region">`

- Inspect Mode toggle: overlays the preview, outlines the component under the pointer, click/tap opens a comment modal.
- Pins toggle: shows/hides numbered badges on annotated components.
- Notes list: all stored notes with delete.
- Finish Session: downloads `nfc-skeleton-notes-<date>.json`, copies to clipboard if available, shows status.
- Screen nav: lists screens registered via `skUseScreens().register([...])`.
- Keyboard shortcut: `i` toggles inspect mode.

## API globals

- `skUseFeedback()` — `{ notes, addNote, deleteNote, clearNotes, exportNotes, notesFor }`
- `skUseScreens()` — `{ screens, active, register, navigate }`
- `window.__skExportNotes()` — returns notes JSON `[{screen, component, context, note, time}]`
- `registerSkeletonKit(app)` / `registerSkeletonKitCockpit(app)` — register components on a Vue app.

## Storage

Notes are stored in `localStorage` under `sk-feedback-notes`. If the origin is opaque (`file://`) or quota is denied, the store falls back to an in-memory array for the session.
