# BMT ONE — Obsidian Crystal UI upgrade

## What's new
- Obsidian-black, champagne-gold, transparent optical-crystal visual theme, with restrained icy-blue highlights.
- Four large 3D crystal-orb navigation objects, each containing an **existing photographic product asset** (not emoji or flat icons).
- Rounded liquid-glass CTA buttons, crystalline navigation, enhanced product cards, and hover/focus interactions.
- Matching Crystal Control styling for the existing owner/staff management page.
- Responsive layout, keyboard focus states, reduced-motion support, and existing light/dark switch support.

## Deploy to GitHub / Cloudflare Pages
1. Extract this ZIP.
2. In your GitHub `BROTHERSMOBILE` repository, upload/replace the **contents** of the extracted folder in the repository root. Do not upload the outer folder as a nested directory.
3. Ensure `index.html`, `manage.html`, `functions/`, `assets/`, `obsidian-crystal.css`, `crystal-manage.css` and `obsidian-crystal.js` are at the expected paths.
4. Commit, wait for Cloudflare Pages to deploy, and hard-refresh the live site.
5. Verify public catalog, owner login, product updates, staff access, theme toggle and mobile menu.

## IMPORTANT: Login fix from your live project
This ZIP was built from the **older uploaded starter**, not a fresh GitHub export. The uploaded starter's `functions/api/[[path]].js` may still use PBKDF2 **210000 iterations**, which caused a Cloudflare error in your earlier deployment. **Do not overwrite the working GitHub `functions/` folder or `manage.js` with this ZIP's older copies.** Keep your current production versions of those files. Only replace `index.html`, `manage.html`, and add the three new CSS/JS files; the existing assets already in GitHub are reused. If you upload the full ZIP blindly, you may break the working login.

## What remains unchanged
No D1 schema, database binding, API endpoints, product data, or password storage was intentionally modified by this design update. The old local-only admin overlay was removed from the public `index.html`; the Staff Login link continues to go to `/manage.html`.

## Asset realism
The orbit uses existing smartphone, earbuds, service emblem and showcase imagery. No external icon service or additional backend is required.
