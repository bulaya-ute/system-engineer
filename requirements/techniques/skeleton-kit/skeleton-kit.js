/* skeleton-kit.js v1 — monochrome structural Vue 3 component kit (global build, no modules, no network) */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.Vue) {
    throw new Error('skeleton-kit.js requires window.Vue (Vue 3 global build).');
  }

  const { createApp, ref, computed, provide, inject } = window.Vue;

  /* ---------- Feedback store ---------- */
  const STORE_KEY = 'sk-feedback-notes';
  let memoryStore = [];
  let storageWorks = null;

  function testStorage() {
    if (storageWorks !== null) return storageWorks;
    try {
      const probe = '__sk_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      storageWorks = true;
      return true;
    } catch (e) {
      storageWorks = false;
      return false;
    }
  }

  function loadNotes() {
    if (!testStorage()) return memoryStore.slice();
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return memoryStore.slice();
    }
  }

  function saveNotes(notes) {
    if (testStorage()) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(notes));
      } catch (e) {
        /* swallow quota / opaque-origin errors */
      }
    }
    memoryStore = notes.slice();
  }

  const notesRef = ref(loadNotes());

  function buildAddress(screen, component, context) {
    const parts = [screen || '', component || '', context || ''].filter(Boolean);
    return parts.join(' / ');
  }

  function parseAddress(address) {
    const parts = (address || '').split(' / ');
    return { screen: parts[0] || '', component: parts[1] || '', context: parts[2] || '' };
  }

  function useFeedback() {
    const notes = notesRef;

    function addNote(address, text) {
      const trimmed = String(text || '').trim();
      if (!trimmed) return;
      const next = notes.value.slice();
      next.push({
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        address: String(address || ''),
        note: trimmed,
        time: new Date().toISOString()
      });
      notes.value = next;
      saveNotes(next);
    }

    function deleteNote(id) {
      const next = notes.value.filter((n) => n.id !== id);
      notes.value = next;
      saveNotes(next);
    }

    function clearNotes() {
      notes.value = [];
      saveNotes([]);
    }

    function exportNotes() {
      return notes.value.map((n) => {
        const parsed = parseAddress(n.address);
        return {
          screen: parsed.screen,
          component: parsed.component,
          context: parsed.context,
          note: n.note,
          time: n.time
        };
      });
    }

    function notesFor(address) {
      return notes.value.filter((n) => n.address === address);
    }

    return { notes, addNote, deleteNote, clearNotes, exportNotes, notesFor };
  }

  /* Expose globally so the cockpit and verify scripts can reach it */
  window.skUseFeedback = useFeedback;
  window.skBuildAddress = buildAddress;
  window.skParseAddress = parseAddress;
  window.skStoreKey = STORE_KEY;

  /* ---------- Screen registry ---------- */
  const screensRef = ref([]);
  const activeScreenRef = ref(null);

  function useScreens() {
    function register(screens) {
      screensRef.value = screens || [];
      if (screensRef.value.length && !activeScreenRef.value) {
        activeScreenRef.value = screensRef.value[0].name;
      }
    }
    function navigate(name) {
      if (screensRef.value.some((s) => s.name === name)) {
        activeScreenRef.value = name;
      }
    }
    return {
      screens: screensRef,
      active: activeScreenRef,
      register,
      navigate
    };
  }

  window.skUseScreens = useScreens;

  /* ---------- Address injection ---------- */
  const ScreenKey = Symbol('sk-screen');

  function useAddress(type, context) {
    const screenName = inject(ScreenKey, ref(''));
    return computed(() => buildAddress(screenName.value, type, context));
  }

  function addressAttrs(address) {
    const a = address && address.value !== undefined ? address.value : address;
    const parsed = parseAddress(a);
    return {
      'data-sk-address': a,
      'data-sk-component': parsed.component,
      'data-sk-context': parsed.context
    };
  }

  /* ---------- Helpers ---------- */
  function humpToDash(s) {
    return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
  }

  /* ---------- Layout / atoms ---------- */

  const SkScreen = {
    name: 'sk-screen',
    props: {
      name: { type: String, default: '' },
      layout: { type: String, default: 'column' }, // column | row | stack
      gap: { type: String, default: '' },
      align: { type: String, default: '' },
      scrollY: { type: Boolean, default: false },
      height: { type: String, default: '' }
    },
    setup(props, { slots }) {
      const parent = inject(ScreenKey, ref(''));
      const myName = computed(() => props.name || parent.value);
      provide(ScreenKey, myName);
      const address = computed(() => buildAddress(myName.value, 'sk-screen', props.name || ''));
      return () => {
        const cls = ['sk-screen', 'sk-screen--' + props.layout];
        if (props.scrollY) cls.push('sk-screen--scroll-y');
        const style = {};
        if (props.gap) style.gap = props.gap;
        if (props.align) style.alignItems = props.align;
        if (props.height) style.height = props.height;
        return window.Vue.h(
          'div',
          {
            class: cls,
            style,
            'data-sk-screen': props.name || '',
            ...addressAttrs(address)
          },
          slots.default ? slots.default() : []
        );
      };
    }
  };

  function flexBox(type, baseClass) {
    return {
      name: type,
      props: {
        gap: { type: String, default: '' },
        align: { type: String, default: '' }
      },
      setup(props, { slots }) {
        const address = useAddress(type);
        return () => {
          const style = {};
          if (props.gap) style.gap = props.gap;
          if (props.align) style.alignItems = props.align;
          return window.Vue.h(
            'div',
            {
              class: baseClass,
              style,
              ...addressAttrs(address)
            },
            slots.default ? slots.default() : []
          );
        };
      }
    };
  }

  const SkRow = flexBox('sk-row', 'sk-row');
  const SkColumn = flexBox('sk-column', 'sk-column');

  const SkText = {
    name: 'sk-text',
    props: { tag: { type: String, default: 'p' } },
    setup(props, { slots }) {
      const address = useAddress('sk-text');
      return () =>
        window.Vue.h(
          props.tag,
          { class: 'sk-text', ...addressAttrs(address) },
          slots.default ? slots.default() : []
        );
    }
  };

  const SkHeading = {
    name: 'sk-heading',
    props: { level: { type: [String, Number], default: 1 } },
    setup(props, { slots }) {
      const tag = 'h' + Math.min(Math.max(parseInt(props.level, 10) || 1, 1), 6);
      const address = useAddress('sk-heading');
      return () =>
        window.Vue.h(
          tag,
          { class: 'sk-heading', ...addressAttrs(address) },
          slots.default ? slots.default() : []
        );
    }
  };

  const SkButton = {
    name: 'sk-button',
    props: {
      label: { type: String, default: '' },
      variant: { type: String, default: 'default' } // default | primary
    },
    emits: ['click'],
    setup(props, { emit, slots }) {
      const address = useAddress('sk-button', props.label || '');
      return () =>
        window.Vue.h(
          'button',
          {
            type: 'button',
            class: ['sk-button', 'sk-button--' + props.variant],
            ...addressAttrs(address),
            onClick: (e) => emit('click', e)
          },
          slots.default ? slots.default() : props.label
        );
    }
  };

  const SkCard = {
    name: 'sk-card',
    props: { title: { type: String, default: '' } },
    setup(props, { slots }) {
      const address = useAddress('sk-card', props.title || '');
      return () =>
        window.Vue.h(
          'div',
          { class: 'sk-card', ...addressAttrs(address) },
          [
            props.title ? window.Vue.h('div', { class: 'sk-card__title' }, props.title) : null,
            window.Vue.h('div', { class: 'sk-card__body' }, slots.default ? slots.default() : [])
          ]
        );
    }
  };

  const SkField = {
    name: 'sk-field',
    props: {
      label: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      value: { type: String, default: '' },
      type: { type: String, default: 'text' }
    },
    emits: ['update:value', 'input'],
    setup(props, { emit }) {
      const address = useAddress('sk-field', props.label || '');
      return () =>
        window.Vue.h(
          'label',
          { class: 'sk-field', ...addressAttrs(address) },
          [
            props.label ? window.Vue.h('span', { class: 'sk-field__label' }, props.label) : null,
            window.Vue.h('input', {
              class: 'sk-field__input',
              type: props.type,
              placeholder: props.placeholder,
              value: props.value,
              onInput: (e) => {
                emit('update:value', e.target.value);
                emit('input', e.target.value);
              }
            })
          ]
        );
    }
  };

  const SkPill = {
    name: 'sk-pill',
    props: { status: { type: String, default: '' } },
    setup(props, { slots }) {
      const address = useAddress('sk-pill', props.status || '');
      return () =>
        window.Vue.h(
          'span',
          { class: 'sk-pill', ...addressAttrs(address) },
          slots.default ? slots.default() : props.status
        );
    }
  };

  const SkDivider = {
    name: 'sk-divider',
    setup() {
      const address = useAddress('sk-divider');
      return () => window.Vue.h('hr', { class: 'sk-divider', ...addressAttrs(address) });
    }
  };

  const SkList = {
    name: 'sk-list',
    props: {
      bind: { type: Array, default: () => [] },
      cols: { type: [String, Number], default: 1 }
    },
    setup(props, { slots }) {
      const address = useAddress('sk-list');
      return () =>
        window.Vue.h(
          'div',
          {
            class: 'sk-list',
            style: { gridTemplateColumns: 'repeat(' + (props.cols || 1) + ', 1fr)' },
            ...addressAttrs(address)
          },
          (props.bind || []).map((item, index) =>
            window.Vue.h(
              'div',
              { class: 'sk-list__item', key: index },
              slots.default ? slots.default({ item, index }) : String(item)
            )
          )
        );
    }
  };

  const SkMoneyTable = {
    name: 'sk-money-table',
    props: { bind: { type: Array, default: () => [] } },
    emits: ['reversal'],
    setup(props, { emit }) {
      const address = useAddress('sk-money-table');
      const rows = computed(() => props.bind || []);
      return () =>
        window.Vue.h('table', { class: 'sk-money-table', ...addressAttrs(address) }, [
          window.Vue.h('thead', null, [
            window.Vue.h('tr', null, [
              window.Vue.h('th', null, 'Date'),
              window.Vue.h('th', null, 'Type'),
              window.Vue.h('th', null, 'Amount'),
              window.Vue.h('th', null, 'Running Balance')
            ])
          ]),
          window.Vue.h(
            'tbody',
            null,
            rows.value.map((row, index) =>
              window.Vue.h('tr', { key: index }, [
                window.Vue.h('td', null, String(row.date || '')),
                window.Vue.h('td', null, String(row.type || '')),
                window.Vue.h('td', null, String(row.amount || '')),
                window.Vue.h('td', null, [
                  String(row.runningBalance || ''),
                  row.refunded
                    ? window.Vue.h(
                        'button',
                        {
                          type: 'button',
                          class: 'sk-money-table__reversal',
                          onClick: () => emit('reversal', row)
                        },
                        'Reversal'
                      )
                    : null
                ])
              ])
            )
          )
        ]);
    }
  };

  const SkTapTarget = {
    name: 'sk-tap-target',
    props: { label: { type: String, default: '' } },
    emits: ['tap'],
    setup(props, { emit }) {
      const address = useAddress('sk-tap-target', props.label || '');
      return () =>
        window.Vue.h(
          'div',
          {
            class: 'sk-tap-target',
            role: 'button',
            tabindex: 0,
            ...addressAttrs(address),
            onClick: () => emit('tap'),
            onTouchstart: (e) => {
              e.preventDefault();
              emit('tap');
            }
          },
          props.label
        );
    }
  };

  const SkPinPad = {
    name: 'sk-pin-pad',
    props: {
      attemptsLeft: { type: [String, Number], default: null },
      pinLength: { type: [String, Number], default: 4 },
      dots: { type: Boolean, default: false }
    },
    emits: ['complete'],
    setup(props, { emit }) {
      const pin = ref('');
      const len = computed(() => parseInt(props.pinLength, 10) || 4);
      const dotsArr = computed(() =>
        Array.from({ length: len.value }, (_, i) => i < pin.value.length)
      );
      const address = useAddress('sk-pin-pad');

      function append(digit) {
        if (pin.value.length < len.value) {
          pin.value += String(digit);
          if (pin.value.length === len.value) {
            emit('complete', pin.value);
          }
        }
      }

      function clear() {
        pin.value = '';
      }

      const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'enter'];

      return () =>
        window.Vue.h('div', { class: 'sk-pin-pad', ...addressAttrs(address) }, [
          props.attemptsLeft !== null && props.attemptsLeft !== undefined
            ? window.Vue.h('div', { class: 'sk-pin-pad__attempts' }, 'Attempts left: ' + props.attemptsLeft)
            : null,
          props.dots
            ? window.Vue.h(
                'div',
                { class: 'sk-pin-pad__dots' },
                dotsArr.value.map((filled, i) =>
                  window.Vue.h('span', {
                    key: i,
                    class: ['sk-pin-pad__dot', filled ? 'sk-pin-pad__dot--filled' : '']
                  })
                )
              )
            : window.Vue.h('div', { class: 'sk-pin-pad__display' }, pin.value.replace(/./g, '•')),
          window.Vue.h(
            'div',
            { class: 'sk-pin-pad__grid' },
            digits.map((key) => {
              if (key === 'clear') {
                return window.Vue.h(
                  'button',
                  { type: 'button', class: 'sk-pin-pad__key', onClick: clear },
                  'Clear'
                );
              }
              if (key === 'enter') {
                return window.Vue.h(
                  'button',
                  {
                    type: 'button',
                    class: 'sk-pin-pad__key',
                    onClick: () => {
                      if (pin.value.length === len.value) emit('complete', pin.value);
                    }
                  },
                  'Enter'
                );
              }
              return window.Vue.h(
                'button',
                { type: 'button', class: 'sk-pin-pad__key', onClick: () => append(key) },
                key
              );
            })
          )
        ]);
    }
  };

  /* ---------- Global registration ---------- */
  const components = {
    SkScreen,
    SkRow,
    SkColumn,
    SkText,
    SkHeading,
    SkButton,
    SkCard,
    SkField,
    SkPill,
    SkDivider,
    SkList,
    SkMoneyTable,
    SkTapTarget,
    SkPinPad
  };

  window.SkeletonKitComponents = components;

  function registerSkeletonKit(app) {
    Object.entries(components).forEach(([exportName, comp]) => {
      const tag = comp.name || humpToDash(exportName);
      app.component(tag, comp);
    });
  }

  window.registerSkeletonKit = registerSkeletonKit;

  /* ---------- Auto-register on a mounted app helper ---------- */
  window.skCreateApp = function (rootComponent, selector, screens, data) {
    const app = createApp(rootComponent, data || {});
    registerSkeletonKit(app);
    return app.mount(selector || '#app');
  };
})();
