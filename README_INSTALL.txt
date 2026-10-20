BMT ONE — Professional Featured Devices, Offers & Launches

WHAT IS UPDATED
- Public featured cards: polished black/gold layout, larger contain-fit images,
  clear text, badges, price labels, CTA, mobile layout, multiple highlights.
- Owner-approved data remains loaded from GET /api/highlights.
- No sample products, fake prices, SQL changes or database deletions.
- Existing showcase-manager.html / showcase-manager.js included from the
  last image-library update, so the owner can continue selecting images.

INSTALL IN GITHUB ROOT
1. Back up your live repository first.
2. Upload/replace: bmt-highlights.css and bmt-highlights.js.
3. index.html is included for convenience, based on the most recent Staff
   Access fix. If your live index.html has newer changes, DO NOT overwrite it.
   It only needs these existing references:
   <link rel="stylesheet" href="bmt-highlights.css">
   <script defer src="bmt-highlights.js"></script>
   and a <div id="bmtHighlightGrid"> in #owner-highlights.
4. showcase-manager.html and showcase-manager.js are optional; only replace
   if your live versions are not newer.
5. Keep all assets and Cloudflare D1 / R2 files unchanged.

IMPORTANT
- Original assets/brothers-logo.jpg and assets/hero-showcase.png are NEVER
  modified or removed by this update.
- Product photos display using object-fit: contain (not cropped).
- Only owner-visible highlights from the API appear. More than one highlight
  produces separate cards; first highlight is the large lead feature.
- No live deployment has been performed. Test desktop and mobile after deploy.
