# BMT ONE — Supplier Delivery Receiving

Upload the four files in this ZIP to the GitHub repository root, replacing `manage.html` only. Preserve your existing `manage.js`, `inventory-console.js`, Cloudflare Functions, D1 database and assets. This package builds on the Smart Product Editor and Grouped Inventory upgrades.

Files: manage.html, vendor-receiving.js, vendor-receiving.css, README.md.

Features: product name dropdown plus custom entry, supplier memory in local browser, XLSX/CSV import, photo OCR (JPG/PNG/WebP), PDF text extraction and OCR for scanned PDF pages, line-by-line editable review, manual matching to existing SKUs, and receiving stock as increments rather than replacing totals.

Supplier spreadsheet headers: Name, Brand, Quantity, SKU (optional). Matching existing SKU is safest. Example: iPhone 16 Pro Max, Apple, 50, IP16PM. Images/PDF OCR is approximate: every line must be reviewed, particularly quantities. Scan processing loads Tesseract.js, pdf.js, or SheetJS from external CDNs, so an internet connection is required; this is client-side processing, not server-side uploads. Vendor invoices are not uploaded or saved to Cloudflare. The supplier name is remembered only in the current browser. Product records are saved to Cloudflare D1 via the existing authenticated /api/products endpoint.

IMPORTANT: This is not a transactional purchase-order system. If the network fails mid-import, some lines may already be received. Do not retry the whole delivery; reconcile before continuing. Existing stock with unknown quantity is treated as zero when receiving. Check all rows and SKU matches. No backend authentication changes are included. Verify on staging before production.
