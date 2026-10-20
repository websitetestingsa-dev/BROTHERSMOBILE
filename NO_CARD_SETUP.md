# BMT ONE — password login (no Zero Trust / R2 / local Node required to prepare files)

## CRITICAL: existing project is NOT ready for password login until ALL steps are done

1. Back up your D1 database. In D1 > bmt-one-db > Console, execute `auth_migration.sql` ONE STATEMENT AT A TIME. The two ALTER TABLE commands must be executed only once.
2. Choose a strong unique owner password (at least 16 characters). Generate a PBKDF2-SHA256 hash locally with Python 3 (already installed on your Windows machine). Open PowerShell and run `python create_owner_sql.py` from the extracted folder. It will prompt for your owner email and password and create `owner_setup.sql`. It does NOT upload or store the plaintext password. Never share `owner_setup.sql` publicly.
3. In D1 Console execute the SQL from `owner_setup.sql`, then delete that local SQL file after confirming login. This sets the owner role and password.
4. IMPORTANT: Cloudflare Pages drag-and-drop deployments DO NOT deploy the `functions/` directory as active Pages Functions. A public static upload of this ZIP alone will NOT provide secure login or working API. You must deploy the whole project using a supported Pages Functions deployment method (Wrangler CLI or Git-based Pages build). A one-time Node.js/Wrangler installation or a Git-based workflow is necessary for Pages Functions; there is no safe static-only workaround.
5. Ensure Pages > Settings > Bindings > D1 has variable `DB` bound to `bmt-one-db` in Production. Deploy the `bmt_cloudflare` directory as a Pages project WITH Functions using Wrangler or Git. Do not deploy the Python setup script, SQL files, or guides as public assets; keep them outside the deployed static directory.
6. Visit https://bmt-one.pages.dev/api/catalog (public read), https://bmt-one.pages.dev/manage.html (login). Verify unauthenticated GET /api/me returns 401, and unauthenticated POST /api/products returns 401.
7. Sign in as owner; create staff users with long unique passwords and short expirations. Staff should change passwords by owner reissuing credentials (password-change self-service not implemented). Sessions expire in 8 hours.

## Security limitations and notes
- This version uses PBKDF2-SHA256 with 210,000 iterations and unique random salt, HttpOnly Secure SameSite=Strict cookies, opaque random session tokens hashed in D1, 8-hour expiry, server-side role checks, and basic D1 login attempt throttling.
- This is custom password authentication, not Microsoft/Apple SSO, MFA or passkeys. A security review and production testing are recommended before real staff access.
- Passwords are never sent by email automatically. Do not reuse passwords. Do not share credentials in ChatGPT.
- No R2 needed: reference images already in `assets/`. Dashboard image upload is intentionally disabled. Adding a new image requires redeploying site assets.
- Existing products/promos remain in D1. Run only the migration, not schema.sql/seed.sql again.
- Cloudflare may change dashboard, billing, or deployment options. No paid Zero Trust plan is needed for this custom login, but check Cloudflare account limits and pricing.
