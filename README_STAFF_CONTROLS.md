# BMT ONE — Staff controls

**Important: Back up D1 before changing schema.**

1. In Cloudflare D1 → bmt-one-db → Console, run `STAFF_MIGRATION.sql` ONCE. Do not run it twice. It removes expiry dates for currently active workers and sets old revoked accounts to Blocked.
2. Upload `manage.html`, `manage.js`, `staff-controls.css`, and `functions/api/[[path]].js` preserving paths to the GitHub repository.
3. Deploy and test as owner. Only owner can block, fire, unblock, and delete.
4. Existing staff with an already expired account will not automatically regain access; invite them again using a new password.

Block = disable access and end sessions, reversible. Fired = disable access and end sessions, reversible only by owner choosing Rehire / Unblock. Delete = permanently delete staff record; past audit logs remain. Owner accounts cannot be affected.

**Backend compatibility:** The supplied API file was based on the previously provided BMT no-card starter, with staff-control changes. If your live `functions/api/[[path]].js` has additional fixes (such as the PBKDF2 100000-iteration correction), merge these staff changes into your current working file instead of blindly overwriting it. Check the PBKDF2 setting before deployment.
