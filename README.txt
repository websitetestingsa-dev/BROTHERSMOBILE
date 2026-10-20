BMT ONE — Grouped Inventory Manager

Files: manage.html, inventory-publishing.js, inventory-publishing.css

INSTALL:
1. Back up current manage.html and inventory-publishing.js.
2. Upload these three files to the same directory as manage.html in GitHub.
3. Do not overwrite your API or run SQL: this UI uses the existing /api/products and /api/products/publish/:id endpoints.
4. Sign in as owner, refresh, and test search, category filter, pagination, Save as draft and Publish.

IMPORTANT:
- Based on the latest locally available manage.html from the previous BMT mobile/private-stock package. Compare with live GitHub before replacing if newer edits exist.
- Category grouping is computed from existing product names/brands/categories. No product records are deleted or reclassified in D1.
- Existing product editor/importer remains on page. For true single-workflow publishing, review existing manage.js and importer logic separately.
- Server must enforce private drafts and completeness; this UI cannot guarantee public catalog privacy on its own.
- Existing products marked published but incomplete may still be labeled published in D1; public API must filter incomplete products.
