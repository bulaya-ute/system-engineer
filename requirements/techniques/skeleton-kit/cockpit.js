/* cockpit.js v1 — <sk-cockpit> session control panel for skeleton-kit */
(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.Vue || !window.skUseFeedback || !window.skUseScreens) {
    throw new Error('cockpit.js requires skeleton-kit.js and window.Vue.');
  }

  const { ref, computed, watch, nextTick, onMounted, onUnmounted, h, Teleport } = window.Vue;

  const SkCockpit = {
    name: 'sk-cockpit',
    props: {
      previewSelector: { type: String, default: '.sk-preview-region' }
    },
    setup(props) {
      const { notes, addNote, deleteNote, exportNotes } = window.skUseFeedback();
      const { screens, active, navigate } = window.skUseScreens();

      const inspectMode = ref(false);
      const pinsVisible = ref(true);
      const modalOpen = ref(false);
      const modalAddress = ref('');
      const modalText = ref('');
      const statusText = ref('');
      const hoveredEl = ref(null);

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
        if (e.key === 'Escape' && modalOpen.value) {
          e.preventDefault();
          modalOpen.value = false;
        } else if ((e.key === 'i' || e.key === 'I') && !modalOpen.value) {
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

      onMounted(() => {
        const preview = getPreview();
        if (preview) {
          preview.addEventListener('mouseover', onMouseOver, true);
          preview.addEventListener('click', onClick, true);
          preview.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
        }
        document.addEventListener('keydown', onKeyDown);
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
        return h('div', { class: 'sk-cockpit' }, [
          h('div', { class: 'sk-cockpit__bar' }, [
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
              inspectMode.value ? 'Exit Inspect' : 'Inspect Mode'
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
                class: 'sk-cockpit__btn',
                onClick: finishSession,
                onTouchstart: (e) => {
                  e.preventDefault();
                  finishSession();
                }
              },
              'Finish Session'
            ),
            statusText.value
              ? h('span', { class: 'sk-cockpit__status' }, statusText.value)
              : null
          ]),

          screens.value.length
            ? h(
                'div',
                { class: 'sk-cockpit__nav' },
                screens.value.map((s) =>
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
              )
            : null,

          h('div', { class: 'sk-cockpit__notes' }, [
            h('strong', null, 'Notes (' + notes.value.length + ')'),
            notes.value.length
              ? notes.value.map((n) =>
                  h('div', { key: n.id, class: 'sk-cockpit__note' }, [
                    h('div', { class: 'sk-cockpit__note-address' }, n.address),
                    h('div', null, n.note),
                    h(
                      'button',
                      { type: 'button', class: 'sk-cockpit__note-delete', onClick: () => deleteNote(n.id) },
                      'Delete'
                    )
                  ])
                )
              : h('div', { class: 'sk-cockpit__empty' }, 'No notes yet.')
          ]),

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
                  h(
                    'button',
                    { type: 'button', class: 'sk-cockpit__btn', onClick: saveNote },
                    'Save'
                  ),
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
