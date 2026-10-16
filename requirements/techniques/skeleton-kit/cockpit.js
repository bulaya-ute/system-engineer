/* cockpit.js v2 — <sk-cockpit> application shell for skeleton-kit */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.Vue || !window.skUseFeedback || !window.skUseScreens) {
    throw new Error('cockpit.js requires skeleton-kit.js and window.Vue.');
  }

  const { ref, computed, watch, nextTick, onMounted, onUnmounted, h, Teleport } = window.Vue;

  const DEFAULT_TITLE = 'Skeleton Session';
  const DEFAULT_HELP = [
    'This is an interactive skeleton — a throwaway prototype used to capture feedback on flow and structure.',
    '',
    '• INSPECT — outline and click or tap any component in the preview to add a pinned note.',
    '• [?] Help — opens this modal.',
    '• Device toggle — switch the preview between phone (~390 px) and desktop widths.',
    '• Finish Session — exports all captured notes as JSON.',
    '',
    'Notes are stored locally and survive page refresh.'
  ].join('\n');

  function readShellConfig() {
    const cfg = window.SK_SHELL || {};
    return {
      title: String(cfg.title || DEFAULT_TITLE),
      help: String(cfg.help || DEFAULT_HELP)
    };
  }

  const SkCockpit = {
    name: 'sk-cockpit',
    props: {
      previewSelector: { type: String, default: '.sk-preview-region' }
    },
    setup(props) {
      const shellConfig = readShellConfig();
      const { notes, addNote, deleteNote, exportNotes } = window.skUseFeedback();
      const { screens, active, navigate, addScreen } = window.skUseScreens();

      const inspectMode = ref(false);
      const pinsVisible = ref(true);
      const modalOpen = ref(false);
      const modalAddress = ref('');
      const modalText = ref('');
      const statusText = ref('');
      const hoveredEl = ref(null);

      const device = ref('desktop');
      const helpModalOpen = ref(false);
      const notesCollapsed = ref(false);
      const addScreenInput = ref('');

      function getPreview() {
        return document.querySelector(props.previewSelector);
      }

      function buildAddressFromEl(el) {
        return el.getAttribute('data-sk-address') || '';
      }

      function findAddressable(el) {
        const preview = getPreview();
        while (el && el !== preview) {
          if (el.hasAttribute && el.hasAttribute('data-sk-address')) return el;
          el = el.parentElement;
        }
        return null;
      }

      function clearOutline() {
        if (hoveredEl.value) {
          hoveredEl.value.classList.remove('sk-inspect-outline');
          hoveredEl.value = null;
        }
      }

      function setOutline(el) {
        clearOutline();
        if (el) {
          el.classList.add('sk-inspect-outline');
          hoveredEl.value = el;
        }
      }

      function openModal(target) {
        modalAddress.value = buildAddressFromEl(target);
        modalText.value = '';
        modalOpen.value = true;
      }

      function onMouseOver(e) {
        if (!inspectMode.value) return;
        const target = findAddressable(e.target);
        setOutline(target);
      }

      function onClick(e) {
        if (!inspectMode.value) return;
        const target = findAddressable(e.target);
        if (target) {
          e.preventDefault();
          e.stopPropagation();
          openModal(target);
        }
      }

      function onTouchStart(e) {
        if (!inspectMode.value) return;
        const touch = e.touches[0];
        const target = findAddressable(document.elementFromPoint(touch.clientX, touch.clientY));
        if (target) {
          e.preventDefault();
          openModal(target);
        }
      }

      function onKeyDown(e) {
        if (e.key === 'Escape') {
          if (modalOpen.value) {
            e.preventDefault();
            modalOpen.value = false;
          } else if (helpModalOpen.value) {
            e.preventDefault();
            helpModalOpen.value = false;
          }
        } else if ((e.key === 'i' || e.key === 'I') && !modalOpen.value && !helpModalOpen.value) {
          toggleInspect();
        }
      }

      watch(modalOpen, (open) => {
        if (open) {
          nextTick(() => {
            const ta = document.querySelector('.sk-cockpit__modal-text');
            if (ta && typeof ta.focus === 'function') {
              ta.focus();
            }
          });
        }
      });

      function toggleInspect() {
        inspectMode.value = !inspectMode.value;
        if (!inspectMode.value) {
          clearOutline();
          modalOpen.value = false;
          pinsVisible.value = true;
        }
      }

      function togglePins() {
        pinsVisible.value = !pinsVisible.value;
      }

      function saveNote() {
        const text = modalText.value.trim();
        if (text && modalAddress.value) {
          addNote(modalAddress.value, text);
        }
        modalOpen.value = false;
      }

      function finishSession() {
        const data = exportNotes();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nfc-skeleton-notes-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const payload = JSON.stringify(data, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(payload)
            .then(() => {
              statusText.value = 'Downloaded and copied to clipboard.';
            })
            .catch(() => {
              statusText.value = 'Downloaded (clipboard unavailable).';
            });
        } else {
          statusText.value = 'Downloaded.';
        }
      }

      window.__skExportNotes = function () {
        return exportNotes();
      };

      const annotatedPins = computed(() => {
        if (!inspectMode.value || !pinsVisible.value) return [];
        const preview = getPreview();
        if (!preview) return [];
        const previewRect = preview.getBoundingClientRect();
        const all = Array.from(preview.querySelectorAll('[data-sk-address]'));
        const annotated = [];
        let number = 1;
        all.forEach((el) => {
          const addr = buildAddressFromEl(el);
          if (notes.value.some((n) => n.address === addr)) {
            const rect = el.getBoundingClientRect();
            annotated.push({
              number: number++,
              left: rect.left - previewRect.left,
              top: rect.top - previewRect.top
            });
          }
        });
        return annotated;
      });

      function syncPlaceholders() {
        const preview = getPreview();
        if (!preview) return;
        preview.querySelectorAll('.sk-screen--placeholder').forEach((el) => {
          el.style.display = el.getAttribute('data-sk-screen') === active.value ? 'block' : 'none';
        });
      }

      function applyDeviceClass() {
        const preview = getPreview();
        if (!preview) return;
        preview.classList.remove('sk-preview-region--phone', 'sk-preview-region--desktop');
        preview.classList.add('sk-preview-region--' + device.value);
      }

      function toggleDevice() {
        device.value = device.value === 'desktop' ? 'phone' : 'desktop';
      }

      function doAddScreen() {
        const name = addScreenInput.value.trim();
        if (!name) return;
        addScreen(name);
        addScreenInput.value = '';
      }

      function helpParagraphs() {
        return shellConfig.help.split(/\n\n+/).filter(Boolean);
      }

      const activeLabel = computed(() => {
        const s = screens.value.find((s) => s.name === active.value);
        return (s && (s.label || s.name)) || active.value || '—';
      });

      watch(active, syncPlaceholders);
      watch(device, applyDeviceClass);

      onMounted(() => {
        const preview = getPreview();
        if (preview) {
          preview.addEventListener('mouseover', onMouseOver, true);
          preview.addEventListener('click', onClick, true);
          preview.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
        }
        document.addEventListener('keydown', onKeyDown);
        applyDeviceClass();
        syncPlaceholders();
      });

      onUnmounted(() => {
        const preview = getPreview();
        if (preview) {
          preview.removeEventListener('mouseover', onMouseOver, true);
          preview.removeEventListener('click', onClick, true);
          preview.removeEventListener('touchstart', onTouchStart, { capture: true });
        }
        document.removeEventListener('keydown', onKeyDown);
        clearOutline();
      });

      return () => {
        const previewExists = !!getPreview();
        const deviceLabel = device.value === 'phone' ? 'Phone' : 'Desktop';
        const inspectLabel = inspectMode.value ? 'Exit Inspect' : 'Inspect Mode';
        const collapseLabel = notesCollapsed.value ? 'Show' : 'Hide';

        return h('div', { class: 'sk-cockpit' }, [
          /* ---------- Header ---------- */
          h('header', { class: 'sk-cockpit__header' }, [
            h('div', { class: 'sk-cockpit__title' }, shellConfig.title),
            h('div', { class: 'sk-cockpit__header-actions sk-cockpit__bar' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: 'sk-cockpit__btn sk-cockpit__btn--device',
                  onClick: toggleDevice,
                  onTouchstart: (e) => {
                    e.preventDefault();
                    toggleDevice();
                  }
                },
                deviceLabel
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: ['sk-cockpit__btn', inspectMode.value ? 'sk-cockpit__btn--active' : ''],
                  onClick: toggleInspect,
                  onTouchstart: (e) => {
                    e.preventDefault();
                    toggleInspect();
                  }
                },
                inspectLabel
              ),
              inspectMode.value
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: 'sk-cockpit__btn',
                      onClick: togglePins,
                      onTouchstart: (e) => {
                        e.preventDefault();
                        togglePins();
                      }
                    },
                    pinsVisible.value ? 'Hide Pins' : 'Show Pins'
                  )
                : null,
              h(
                'button',
                {
                  type: 'button',
                  class: 'sk-cockpit__btn sk-cockpit__btn--help',
                  onClick: () => {
                    helpModalOpen.value = true;
                  },
                  onTouchstart: (e) => {
                    e.preventDefault();
                    helpModalOpen.value = true;
                  }
                },
                '?'
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: 'sk-cockpit__btn sk-cockpit__btn--finish',
                  onClick: finishSession,
                  onTouchstart: (e) => {
                    e.preventDefault();
                    finishSession();
                  }
                },
                'Finish Session'
              )
            ])
          ]),

          /* ---------- Body grid items ---------- */
          h('div', { class: 'sk-cockpit__body' }, [
            /* Left sidebar */
            h('aside', { class: 'sk-cockpit__sidebar sk-cockpit__sidebar--left' }, [
              h('div', { class: 'sk-cockpit__nav' }, [
                screens.value.length
                  ? h(
                      'select',
                      {
                        class: 'sk-cockpit__screen-select',
                        value: active.value || '',
                        onChange: (e) => navigate(e.target.value)
                      },
                      screens.value.map((s) =>
                        h('option', { value: s.name, key: s.name }, s.label || s.name)
                      )
                    )
                  : null,

                h('div', { class: 'sk-cockpit__add-screen' }, [
                  h('input', {
                    class: 'sk-cockpit__add-screen-input',
                    type: 'text',
                    placeholder: 'Screen name',
                    value: addScreenInput.value,
                    onInput: (e) => {
                      addScreenInput.value = e.target.value;
                    },
                    onKeydown: (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        doAddScreen();
                      }
                    }
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'sk-cockpit__btn sk-cockpit__btn--small',
                      onClick: doAddScreen
                    },
                    '＋ Add screen'
                  )
                ]),

                screens.value.length
                  ? screens.value.map((s) =>
                      h(
                        'button',
                        {
                          type: 'button',
                          class: [
                            'sk-cockpit__nav-item',
                            active.value === s.name ? 'sk-cockpit__nav-item--active' : ''
                          ],
                          onClick: () => navigate(s.name)
                        },
                        s.label || s.name
                      )
                    )
                  : null
              ])
            ]),

            /* Preview title strip */
            h('div', { class: 'sk-cockpit__preview-title' }, [
              h('span', null, activeLabel.value),
              h('span', { class: 'sk-cockpit__preview-device' }, deviceLabel)
            ]),

            /* Right sidebar */
            h('aside', { class: 'sk-cockpit__sidebar sk-cockpit__sidebar--right' }, [
              h('div', { class: 'sk-cockpit__notes' }, [
                h('div', { class: 'sk-cockpit__notes-header' }, [
                  h('strong', null, 'Notes (' + notes.value.length + ')'),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'sk-cockpit__btn sk-cockpit__btn--small',
                      onClick: () => {
                        notesCollapsed.value = !notesCollapsed.value;
                      }
                    },
                    collapseLabel
                  )
                ]),

                !notesCollapsed.value
                  ? h(
                      'div',
                      { class: 'sk-cockpit__notes-list' },
                      notes.value.length
                        ? notes.value.map((n) =>
                            h('div', { key: n.id, class: 'sk-cockpit__note' }, [
                              h('div', { class: 'sk-cockpit__note-address' }, n.address),
                              h('div', null, n.note),
                              h(
                                'button',
                                {
                                  type: 'button',
                                  class: 'sk-cockpit__note-delete',
                                  onClick: () => deleteNote(n.id)
                                },
                                'Delete'
                              )
                            ])
                          )
                        : h('div', { class: 'sk-cockpit__empty' }, 'No notes yet.')
                    )
                  : null
              ]),

              statusText.value
                ? h('div', { class: 'sk-cockpit__status' }, statusText.value)
                : null
            ])
          ]),

          /* ---------- Help modal ---------- */
          helpModalOpen.value
            ? h('div', { class: 'sk-cockpit__modal sk-cockpit__modal--help' }, [
                h('div', { class: 'sk-cockpit__modal-title' }, 'Help'),
                h(
                  'div',
                  { class: 'sk-cockpit__modal-body' },
                  helpParagraphs().map((p, i) => h('p', { key: i }, p))
                ),
                h('div', { class: 'sk-cockpit__modal-actions' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'sk-cockpit__btn',
                      onClick: () => {
                        helpModalOpen.value = false;
                      }
                    },
                    'Close'
                  )
                ])
              ])
            : null,

          /* ---------- Comment modal ---------- */
          modalOpen.value
            ? h('div', { class: 'sk-cockpit__modal' }, [
                h('div', { class: 'sk-cockpit__modal-title' }, 'Add note'),
                h('div', { class: 'sk-cockpit__modal-address' }, modalAddress.value),
                h('textarea', {
                  class: 'sk-cockpit__modal-text',
                  value: modalText.value,
                  onInput: (e) => {
                    modalText.value = e.target.value;
                  }
                }),
                h('div', { class: 'sk-cockpit__modal-actions' }, [
                  h('button', { type: 'button', class: 'sk-cockpit__btn', onClick: saveNote }, 'Save'),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'sk-cockpit__btn',
                      onClick: () => {
                        modalOpen.value = false;
                      }
                    },
                    'Cancel'
                  )
                ])
              ])
            : null,

          /* ---------- Inspect overlay + pins (teleported into preview) ---------- */
          previewExists && Teleport
            ? h(
                Teleport,
                { to: props.previewSelector },
                inspectMode.value
                  ? [
                      h('div', { class: 'sk-cockpit__overlay', 'aria-hidden': 'true' }),
                      pinsVisible.value
                        ? h(
                            'div',
                            { class: 'sk-cockpit__pin-layer' },
                            annotatedPins.value.map((p) =>
                              h(
                                'span',
                                {
                                  key: p.number,
                                  class: 'sk-cockpit__pin',
                                  style: { left: p.left + 'px', top: p.top + 'px' }
                                },
                                p.number
                              )
                            )
                          )
                        : null
                    ]
                  : []
              )
            : null
        ]);
      };
    }
  };

  window.SkeletonKitCockpit = SkCockpit;

  /* Register on an app instance */
  window.registerSkeletonKitCockpit = function (app) {
    app.component('sk-cockpit', SkCockpit);
  };
})();
