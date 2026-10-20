# BMT ONE — Grouped Crystal Inventory

## What changed
- Current products are now grouped by **item type**, with expandable category panels and group-level product and unit counts.
- Each individual product displays its **own stock quantity**, price, SKU, stock status, and Edit/Delete actions.
- **+ / −** buttons update only the selected product quantity through the existing authenticated `/api/products` endpoint.
- Delete now requires typing `DELETE`, names the exact product and SKU, and calls the existing API with **that individual SKU**. Deleting a category is not supported.
- Search, filters, Excel import, staff access, and existing login are preserved.

## Deploy
Copy `manage.html`, `manage.js`, `inventory-console.js`, `inventory-console.css` into the ROOT of the existing GitHub repo. Commit to main and wait for Cloudflare Pages deployment. **Do not replace the functions folder, DB, or owner accounts.**

## Important inventory note
Existing entries like `Smartphones` or `Phone cases & covers` are generic product records, not containers. Delete one only removes that one database row, not all other product rows. If you have only one generic entry for an entire product line, add each real item (unique SKU) using Product editor or Excel import; then remove the generic placeholder. No quantity or brand inventory is fabricated.

The API uses one D1 record per SKU; the category grouping is visual only. Changes affect the live database. Test with a sample product first.
