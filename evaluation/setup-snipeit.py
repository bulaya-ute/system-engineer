#!/usr/bin/env python3
"""Snipe-IT first-run automation: setup admin -> login -> obtain API token.

Env: SNIPE_URL (default http://localhost:8010)
      SNIPE_ADMIN_EMAIL (default audit-admin@example.com)
      SNIPE_ADMIN_PASSWORD (default AuditPass!1234)

Prints: SETUP-OK | LOGIN-OK | TOKEN <value> (pat or legacy api key) or failure lines.
"""

import os, re, sys, time, urllib.request, urllib.parse, http.cookiejar

BASE = os.environ.get('SNIPE_URL', 'http://localhost:8010').rstrip('/')
EMAIL = os.environ.get('SNIPE_ADMIN_EMAIL', 'audit-admin@example.com')
PASSWORD = os.environ.get('SNIPE_ADMIN_PASSWORD', 'AuditPass!1234')

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(jar),
    urllib.request.HTTPRedirectHandler())

def get(path):
    return opener.open(BASE + path, timeout=30).read().decode(errors='replace')

def post(path, data):
    body = urllib.parse.urlencode(data).encode()
    return opener.open(urllib.request.Request(BASE + path, data=body,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}), timeout=30)

def token_of(html):
    m = re.search(r'name="_token"\s+value="([^"]+)"', html)
    return m.group(1) if m else None

# 0. wait for the app
for i in range(60):
    try:
        get('/health' if False else '/login')
        break
    except Exception:
        time.sleep(2)
else:
    print('APP-UNREACHABLE'); sys.exit(2)

# 1. setup wizard (if fresh install)
try:
    page = get('/setup')
    have_setup = 'setup' in page.lower()
except Exception:
    page = ''
    have_setup = True

if have_setup and '_token' in (page or ''):
    t = token_of(page)
    # v6/v7 single-step user creation form
    data = {'_token': t, 'email': EMAIL, 'first_name': 'Audit', 'last_name': 'Admin',
            'password': PASSWORD, 'password_confirmation': PASSWORD}
    try:
        r = post('/setup', data)
        print('SETUP-OK', r.geturl())
    except urllib.error.HTTPError as e:
        print('SETUP-FAIL', e.code, e.read()[:200].decode(errors='replace')); sys.exit(2)
else:
    print('SETUP-SKIPPED (already installed)')

# 2. login
page = get('/login')
t = token_of(page)
if not t:
    print('LOGIN-TOKEN-MISSING'); sys.exit(2)
try:
    r = post('/login', {'_token': t, 'username': EMAIL, 'email': EMAIL, 'password': PASSWORD})
    final = r.geturl()
    if 'login' in final and 'verify' not in final:
        print('LOGIN-FAIL redirect to', final); sys.exit(2)
    print('LOGIN-OK', final)
except urllib.error.HTTPError as e:
    print('LOGIN-FAIL', e.code); sys.exit(2)

# 3. API token: try personal access tokens page, then legacy settings API page
TOKEN_RE = re.compile(r'\b(?:snipeit_pat_)?[A-Za-z0-9]{30,}\b')
def harvest(html):
    # ignore csrf/session strings
    cands = [c for c in TOKEN_RE.findall(html)
             if not c.startswith('base64') and len(c) < 120]
    return cands

for path, form_marker in [('/account/api', 'personal'), ('/settings/api', 'api')]:
    try:
        html = get(path)
    except Exception as e:
        print('PAGE-ERR', path, str(e)[:80]); continue
    if path == '/account/api':
        t = token_of(html)
        try:
            r = post('/account/api', {'_token': t, 'name': 'run-verification', 'scopes': []})
            out = r.read().decode(errors='replace')
            cands = harvest(out)
            if cands:
                print('TOKEN', cands[0]); sys.exit(0)
        except Exception as e:
            print('PAT-FAIL', str(e)[:100])

print('TOKEN-NOTFOUND'); sys.exit(2)
