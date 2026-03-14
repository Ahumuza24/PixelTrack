# Security Best Practices Report

## Executive Summary
I reviewed the React + Supabase codebase for common frontend security pitfalls and backend authorization weaknesses. Critical authz issues found in the database schema were fixed during this review (role escalation via signup metadata, overly broad employee task access, and self‑service role changes). Remaining issues are defense‑in‑depth items: a missing CSP/security headers configuration and permissive CORS on admin Edge Functions.

## Findings

### Medium

**1) REACT-CSP-001 — CSP/security headers not configured in repo**

- **Location:** `index.html` lines 3-11
- **Evidence:** The HTML shell contains no CSP meta tag and the repo has no server/edge header config.
- **Impact:** Without a CSP and related headers, the app lacks browser-level defense‑in‑depth against XSS and clickjacking.
- **Fix:** Configure CSP and security headers at the edge/server (preferred). If static hosting is the only option, add a CSP `<meta http-equiv>` tag early in the `<head>` and set headers (frame-ancestors, nosniff, referrer-policy) at the CDN/edge.
- **Mitigation:** Start with CSP report‑only mode to reduce breakage, then enforce.
- **False positive notes:** If CSP is already applied by hosting infrastructure, verify at runtime headers.

### Low

**2) FE-CORS-001 — Edge Functions allow any origin**

- **Location:** `supabase/functions/_shared/utils.ts` lines 11-13
- **Evidence:** `Access-Control-Allow-Origin` is set to `"*"`.
- **Impact:** Broad CORS makes it easier for any origin to call admin functions if a valid token is present in the browser, reducing defense‑in‑depth.
- **Fix:** Restrict `Access-Control-Allow-Origin` to your production and staging domains. Consider allowing localhost only in development.
- **Mitigation:** Keep strict admin checks (already present) and monitor function usage.
- **False positive notes:** If these functions are never called from browsers, you can tighten CORS to an internal allowlist or remove it.

## Resolved During Review

**R-1) AUTHZ-ROLE-001 — Role escalation via signup metadata**

- **Location:** `supabase/schema.sql` lines 242-251
- **Resolution:** The `handle_new_user` trigger now forces role to `employee` instead of trusting `raw_user_meta_data.role`.

**R-2) AUTHZ-RLS-001 — Employees could read all tasks**

- **Location:** `supabase/schema.sql` lines 159-172
- **Resolution:** RLS now limits employees to tasks they are assigned to or created.

**R-3) AUTHZ-RLS-002 — Users could update their own role/client_id**

- **Location:** `supabase/schema.sql` lines 96-105
- **Resolution:** RLS `WITH CHECK` now prevents self‑service role and client assignment changes.
