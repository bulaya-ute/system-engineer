#!/usr/bin/env python3
"""Snipe-IT exemplar run-verification (V-01..V-07) against a live instance.

Env: SNIPE_URL (default http://localhost:8010), SNIPE_TOKEN (API key).
Prints one line per check: id, PASS/FAIL/BLOCKED, evidence. Exit 0 if all ran.

Usage: python3 scripts/verify-snipeit.py
"""

import json, os, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

BASE = os.environ.get('SNIPE_URL', 'http://localhost:8010').rstrip('/')
TOKEN = os.environ.get('SNIPE_TOKEN', '')

def call(method, path, body=None, headers=None):
    req = urllib.request.Request(BASE + path,
                                 data=None if body is None else json.dumps(body).encode(),
                                 method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')
    if TOKEN:
        req.add_header('Authorization', f'Bearer {TOKEN}')
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            try:
                payload = json.loads(raw) if raw else {}
            except Exception:
                payload = {'raw': raw[:200].decode(errors='replace')}
            return r.status, payload
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            payload = json.loads(raw) if raw else {}
        except Exception:
            payload = {'raw': raw[:200].decode(errors='replace')}
        return e.code, payload

results = []
def record(vid, verdict, evidence):
    results.append((vid, verdict, evidence))
    print(f'{vid} {verdict}: {evidence[:140]}')

def seed():
    """Idempotent-ish: create category/manufacturer/statuslabels/model/user, return ids."""
    ids = {}
    def ensure(path, body, key):
        code, page = call('GET', path + '?limit=50')
        rows = page.get('rows', []) if isinstance(page, dict) else []
        if code == 200 and rows:
            for r in rows:
                if r.get('name') == body.get('name'):
                    return r.get('id')
        c, p = call('POST', path, body)
        if c in (200, 201):
            return p.get('id') if 'id' in p else (p.get('payload') or {}).get('id')
        return None

    ids['category'] = ensure('/api/v1/categories', {
        'name': 'AUDIT Laptops', 'category_type': 'hardware',
        'notes': 'run-verification V-01'}, 'name')
    ids['manufacturer'] = ensure('/api/v1/manufacturers', {'name': 'AUDIT Maker'}, 'name')
    ids['status_ok'] = ensure('/api/v1/statuslabels', {
        'name': 'AUDIT Deployable', 'type': 'deployable'}, 'name')
    ids['status_pending'] = ensure('/api/v1/statuslabels', {
        'name': 'AUDIT Pending', 'type': 'pending'}, 'name')
    if ids['manufacturer'] and ids['category']:
        c, page = call('GET', '/api/v1/models?limit=50')
        rows = page.get('rows', []) if isinstance(page, dict) else []
        model_id = next((r['id'] for r in rows if r.get('name') == 'AUDIT Model 14'), None)
        if not model_id:
            c, p = call('POST', '/api/v1/models', {
                'name': 'AUDIT Model 14', 'model_number': 'AM14',
                'manufacturer_id': ids['manufacturer'], 'category_id': ids['category']})
            model_id = (p.get('id') or (p.get('payload') or {}).get('id')) if c in (200, 201) else None
        ids['model'] = model_id
    c, page = call('GET', '/api/v1/users?limit=50')
    rows = page.get('rows', []) if isinstance(page, dict) else []
    user_id = next((r['id'] for r in rows if r.get('username') == 'audituser1'), None)
    if not user_id:
        c, p = call('POST', '/api/v1/users', {
            'first_name': 'Audit', 'last_name': 'User', 'username': 'audituser1',
            'email': 'audituser1@example.com', 'password': 'Passw0rd!'})
        user_id = (p.get('id') or (p.get('payload') or {}).get('id')) if c in (200, 201) else None
    ids['user'] = user_id
    return ids

def make_asset(tag, status_id):
    ids = make_asset.ids
    c, p = call('POST', '/api/v1/hardware', {
        'asset_tag': tag, 'status_id': status_id, 'model_id': ids['model'],
        'name': tag, 'notes': 'run-verification'})
    aid = (p.get('id') or (p.get('payload') or {}).get('id')) if c in (200, 201) else None
    return c, aid, p

def main():
    if not TOKEN:
        print('SNIPE_TOKEN not set'); sys.exit(2)
    code, _ = call('GET', '/api/v1/hardware?limit=1')
    if code == 401:
        print('API unreachable or token invalid'); sys.exit(2)

    ids = seed()
    make_asset.ids = ids
    stamp = str(int(time.time()))

    # V-01 checkout -> checkin round trip
    tag = f'AUD-{stamp}-01'
    c, aid, p = make_asset(tag, ids['status_ok'])
    if not aid:
        record('V-01', 'BLOCKED', f'asset create {c}: {json.dumps(p)[:120]}')
    else:
        c1, p1 = call('POST', f'/api/v1/hardware/{aid}/checkout', {
            'assigned_user': ids['user'], 'note': 'V-01 checkout'})
        c2, p2 = call('POST', f'/api/v1/hardware/{aid}/checkin', {'note': 'V-01 checkin'})
        ok = c1 in (200, 201) and c2 in (200, 201)
        record('V-01', 'PASS' if ok else 'FAIL',
               f'create={c} checkout={c1}/{json.dumps(p1)[:60]} checkin={c2}/{json.dumps(p2)[:60]}')

    # V-02 duplicate tag rejected
    c, p = make_asset(tag, ids['status_ok'])
    record('V-02', 'PASS' if c in (400, 409, 422) else 'FAIL',
           f'duplicate create -> {c}: {json.dumps(p)[:110]}')

    # V-05 status meta-type gates checkout
    tag5 = f'AUD-{stamp}-05'
    c, aid5, _ = make_asset(tag5, ids['status_pending'])
    if aid5:
        c5, p5 = call('POST', f'/api/v1/hardware/{aid5}/checkout', {
            'assigned_user': ids['user'], 'note': 'V-05'})
        record('V-05', 'PASS' if c5 in (400, 409, 422) else 'FAIL',
               f'pending-label checkout -> {c5}: {json.dumps(p5)[:110]}')
    else:
        record('V-05', 'BLOCKED', 'pending asset not created')

    # V-03 consumable qty never negative
    c, cons = call('POST', '/api/v1/consumables', {
        'name': f'AUD pens {stamp}', 'category_id': ids['category'], 'qty': 2})
    cons_id = (cons.get('id') or (cons.get('payload') or {}).get('id')) if c in (200, 201) else None
    if cons_id:
        c, p = call('POST', f'/api/v1/consumables/{cons_id}/checkout', {
            'assigned_to': ids['user'], 'qty': 2})
        c2, p2 = call('POST', f'/api/v1/consumables/{cons_id}/checkout', {
            'assigned_to': ids['user'], 'qty': 1})
        # overdraw attempt after stock 0
        record('V-03', 'PASS' if c in (200, 201) and c2 in (400, 409) else 'FAIL',
               f'first={c} overdraw={c2}: {json.dumps(p2)[:100]}')
    else:
        record('V-03', 'BLOCKED', f'consumable create {c}: {json.dumps(cons)[:100]}')

    # V-04 license seats never oversold
    c, lic = call('POST', '/api/v1/licenses', {
        'name': f'AUD office {stamp}', 'seats': 1, 'category_id': ids['category'],
        'manufacturer_id': ids['manufacturer']})
    lic_id = (lic.get('id') or (lic.get('payload') or {}).get('id')) if c in (200, 201) else None
    if lic_id:
        c1, p1 = call('POST', f'/api/v1/licenses/{lic_id}/seats', {'assigned_to': ids['user']})
        c2, p2 = call('POST', f'/api/v1/licenses/{lic_id}/seats', {'assigned_to': ids['user']})
        # second seat on a 1-seat license must be blocked (or 409-empty-seat class)
        blocked = c2 in (400, 409, 422)
        record('V-04', 'PASS' if blocked else 'FAIL',
               f'seat1={c1} seat2={c2}: {json.dumps(p2)[:100]}')
    else:
        record('V-04', 'BLOCKED', f'license create {c}: {json.dumps(lic)[:100]}')

    # V-06 company isolation (read-side probe only; full mode toggle via UI/tinker)
    record('V-06', 'PENDING', 'requires full_multi_company_support toggle + company seed — manual/DB step')

    # V-07 import error-batched
    record('V-07', 'PENDING', 'requires multipart CSV upload — extend harness if needed')

    print('\nSUMMARY:', {v: [r[1] for r in results].count(v) for v in ('PASS', 'FAIL', 'BLOCKED', 'PENDING')})

if __name__ == '__main__':
    main()
