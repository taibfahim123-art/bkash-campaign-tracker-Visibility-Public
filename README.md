# bKash Campaign Tracker — starter website

This is a starter package for your own GitHub Pages site with the dashboard layout and Admin Upload shell. It is **not a production-ready live data system yet**.

## Intended website URL
`https://taibfahim123-art.github.io/bkash-campaign-tracker-Visibility-Public/`

## Files
- `index.html`: public dashboard layout
- `app.js`: reads an approved `public_campaign_results` view using the frontend-safe Supabase key
- `config.js`: set only your Supabase project URL and publishable/anon key here
- `admin.html`: upload page shell (no database write enabled)
- `supabase/migrations/20261020_public_view_starter.sql`: public-view starter; review access control before running
- `supabase/functions/admin-import/index.ts`: safe disabled function skeleton; writes are deliberately not enabled

## Publish on GitHub Pages
1. In your repository, choose **Add file → Upload files** and upload all package files/folders to the `main` branch.
2. Repository **Settings → Pages → Build and deployment**; choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
3. Wait for GitHub Pages deployment and open the URL above.

## Before live data
1. In Supabase Project Settings / Data API, copy Project URL and publishable/anon key. Put them in `config.js`. The publishable key is meant for browser use only when RLS is secure. Never use a `service_role` key here.
2. Review and execute the public-view migration only after understanding `security_invoker`, permissions and table RLS. The frontend query expects an approved view that may need a server-side security design update.
3. The public dashboard must not expose full wallets, full addresses, RA/MA information, wallet balances, or raw file contents. The current starter view omits full wallet and therefore does not yet implement safe exact-wallet lookup. The current search form is a placeholder and should not be treated as complete.
4. Keep Admin upload disabled until Supabase Auth is set up, at least one explicit admin is assigned, and a tested Edge Function validates file headers, report date, unique wallets, wallet normalization, categories, row counts, and idempotent upserts.
5. Preserve `campaign_targets` separately from Agent List. Agent List refresh must not erase fixed campaign targets. DTR must use `TRX DATE` (not download date).
6. Test with staging copies and verify counts before using business data.

## Important
This starter is for preview/layout and controlled next steps. It is not ready to publish actual campaign information publicly until the RLS/public-view design and authentication are reviewed and tested.
