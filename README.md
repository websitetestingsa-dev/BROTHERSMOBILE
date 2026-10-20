# BMT ONE smart product editor — drop-in patch

Copy `manage.html`, `product-memory.js`, `product-memory.css` to the root of your existing GitHub repository. Keep your existing `manage.js`, `inventory-console.js`, `inventory-console.css`, `functions/`, D1 database and assets unchanged. This `manage.html` is based on the previously delivered grouped inventory dashboard.

Suggestions include common brand and product choices plus product names/brands/image paths from the authenticated `/api/products` response. Choices are also remembered in the current browser using localStorage. Brand and product name fields remain editable, so custom items can be added. Quantity quick buttons are presets, not stock adjustments; saving is still required.

**Important:** Browser memory is per browser/device, while actual products and quantities remain in Cloudflare D1. Suggestions do not create stock records or alter inventory until Save and publish is used. The `Clear this browser’s suggestions` button does not delete products.
