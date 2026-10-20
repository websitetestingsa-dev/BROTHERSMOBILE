# BMT ONE — Crystal Inventory Upgrade

## Deploy
Upload the **contents** of this ZIP to your GitHub repository, keeping Cloudflare Pages connected to main. **IMPORTANT:** Your currently deployed PBKDF2 login may have newer fixes than the old starter in this archive. Before uploading, **keep your live `functions/` folder unchanged**, and preserve the current `manage.js` auth behavior. The only required code changes are `manage.html`, `manage.js` (inventory event + metadata lines), `inventory-console.js`, `inventory-console.css`, `contact-crystal.css`, `index.html` (one CSS link), `inventory-template.csv`. The `functions/` folder is included for reference but must not overwrite the working production version.

## Excel import
1. Open `inventory-template.csv` in Excel and replace example rows with real stock. Save as CSV or Excel .xlsx.
2. Visit `/manage.html`, sign in, and choose file in **Import Excel inventory**.
3. Preview rows, then click **Confirm and publish inventory**.
4. Matching SKU/ID updates an existing record; a new SKU creates a record. Nothing is deleted automatically.
5. Prices and quantities may be blank (unknown). 0 quantity means out of stock.
6. Add your own protector brand in the Brand column and protector grade in Protector Quality. For custom type, put a custom string in Item Type.

## Important
- Only `Phones`, `Accessories`, `Other` are supported by existing Cloudflare API. Detailed item types and quality are preserved in product description (no database migration required).
- New products are visible in the database-driven **Shop Stock** section, not automatically inserted into the static hero/brand showcases.
- No actual inventory has been inferred from concept images. Template entries are EXAMPLES and should not be published until replaced with real items.
- Import makes one authenticated request per row; for large sheets this takes time. If interrupted, rerun the same SKU sheet safely.
- The import is not atomic: if row 20 fails, rows 1–19 may already have been saved. A reimport updates matching SKU records.
- XLSX parser is fetched from SheetJS CDN when used; CSV works without that CDN.
- This project retains the existing authentication and API architecture. No changes to the Cloudflare D1 schema are needed.
