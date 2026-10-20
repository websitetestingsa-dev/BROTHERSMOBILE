BMT ONE — Owner-managed Featured Devices / Offers / Launches

1. BACK UP your GitHub repository and Cloudflare D1 database.
2. Cloudflare D1 > bmt-one-db > Console: execute 01_CREATE_SHOWCASE_TABLE.sql once.
3. Upload index.html, manage.html, bmt-highlights.css, bmt-highlights.js, showcase-manager.html, showcase-manager.js to repository ROOT.
4. MERGE functions/api/[[path]].js into your existing Cloudflare Pages Functions API. This file is based on the latest API handover ZIP and preserves its endpoints. If newer production edits exist, merge rather than overwrite.
5. Deploy Cloudflare Pages. Log in as OWNER; use Manage Website > Manage Showcases & Offers. Save a highlight, mark Visible, and verify on homepage.

Highlights are independent of stock inventory: the owner can announce a launch without adding it as in-stock. Image files in assets/ or R2 are NEVER deleted by highlight deletion. No demo highlights are preloaded. Public section stays hidden until at least one owner-approved highlight exists.

Security: owner-only editing, API validation, owner-only deletion. Existing authentication is reused.
NOTE: the existing legacy #offers section and its promos data are unchanged; this adds a new owner-managed featured section. If you want the legacy offers replaced entirely, share the current shop.js so we can merge safely.
