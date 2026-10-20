# BMT ONE — Phone variants and supplier receiving

Copy `manage.html`, `phone-variants.js`, `phone-variants.css`, and `vendor-receiving.js` into the repository root. **Do not replace `functions/`, `manage.js`, or your D1 database.**

The model menus include a broad convenience list, not verified availability or specifications. Owner must confirm actual combinations and prices. Apple RAM is not requested.

Supplier Excel/CSV can use columns: `Name,Brand,Color,Storage,RAM,Quantity,SKU`. The supplier preview exposes each variant field. On confirmation, variant fields are combined into the product name so they remain separate records in the current database schema.

IMPORTANT: Existing inventory imports and product editor do not have dedicated color/storage/RAM database columns. This patch uses unique descriptive names instead; it does not change the D1 schema. Supplier document OCR cannot reliably infer every variant; check the review table. Avoid repeating imports after partial failure.

Test on a staging deployment before using with real shop inventory. Keep your newest `manage.html` changes (including staff controls) when merging; this file was built from the all-document-receiving baseline and may not include subsequent customizations.
