# BMT ONE — Permanent Crystal Image Library

Upload the following files into the EXISTING BROTHERSMOBILE repository, keeping folder paths intact:
- `manage.html` (built from latest All Document Receiving dashboard)
- `crystal-image-library.js`, `crystal-image-library.css`
- `image-library.json` (initial catalog of images from your earlier BMT package)
- `scripts/build_image_library.py`
- `.github/workflows/update-image-library.yml`

**Important:** Do NOT replace existing `functions/`, `manage.js`, `inventory-console.js`, `vendor-receiving.js`, `product-memory.js`, or your `assets/` folder. All must remain in the repo.

## How it works
- Owner opens Product Editor → Browse saved images → chooses image. Image path and thumbnail appear immediately.
- Images are independent static files under `assets/`. Deleting inventory records does not delete files.
- Add pictures to GitHub `assets/phones/`, `assets/covers/`, etc. The GitHub Action automatically rebuilds `image-library.json` on pushes to main, then Cloudflare Pages redeploys.
- If GitHub Actions lacks repository write permission, go to Settings → Actions → General → Workflow permissions → Read and write permissions, OR run `python scripts/build_image_library.py` and commit `image-library.json` manually.
- Initial manifest lists images from the prior BMT site archive. If your current repository has a different set, run the generator and commit the refreshed manifest. Missing files show as broken thumbnails until fixed.
- This is an image *picker*, not an image upload tool. Images are added through GitHub and cannot be deleted from Manage.
- Do not use inventory deletion to remove an image. Remove the file from GitHub when you want the asset unavailable on the live site. Git history may still contain older copies, and CDN caches may take time to clear.
- Product images in the storefront will continue to work if their saved paths exist.

## Test
1. Upload files; wait for Cloudflare Pages deployment.
2. Sign in to `/manage.html`.
3. Click Browse saved images, choose a thumbnail, and save a product.
4. Delete that product and confirm its image URL still opens directly.
5. Add an image in GitHub `assets/`, commit, wait for the manifest action and deployment, and confirm it appears in picker.

No D1 migration or backend authentication changes.
