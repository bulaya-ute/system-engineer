# Kit verification suites

Run from a scratch dir with jsdom available (suites resolve jsdom from the
working directory's node_modules):

    mkdir -p /tmp/kitverify && cd /tmp/kitverify && npm init -y && npm install jsdom
    node /path/to/skeleton-kit/verify/verify.js        # kit components (73)
    node /path/to/skeleton-kit/verify/verify-v3.js     # NFC v3 declaration (80)
    node /path/to/skeleton-kit/verify/verify-shell.js  # shell v2 (41)

Standard: all suites green + a real-browser Chromium render before any kit
change reaches a session. Suites are updated WITH behavior changes (e.g.
2026-10-16: zebra assertion replaced by faint-row-lines per owner
preference).
