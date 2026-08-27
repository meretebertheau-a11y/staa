# Ståa

Real Next.js version of the Ståa prototype: photo/receipt intake with AI-assisted
field extraction, an inventory list, and an analytics dashboard — backed by Supabase
(real accounts, real database, real photo storage) instead of browser-only storage.

Bank/POS sync is intentionally left out for now. Marking an item "solgt" is manual —
you enter the sale price and date yourself. That's designed to be easy to extend later
(a `terminal_transaction_id` column and one new API route, nothing else touched).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. In the SQL Editor, run everything in `supabase/schema.sql`.
3. In Storage, create a new bucket called `item-photos`. Make it public.
4. In Project Settings → API, copy your Project URL and anon public key.

## 2. Get an Anthropic API key

Go to [console.anthropic.com](https://console.anthropic.com), create an API key.
Unlike the artifact prototype, this is billed to your own Anthropic account per request —
check current pricing before heavy use.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the three values from steps 1 and 2.

## 4. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with any email/password —
this is now real authentication, so use something you'll remember.

## 5. Deploy

Same pattern as your other projects:

1. Push this folder to a new GitHub repo.
2. Import the repo in Vercel.
3. In the Vercel project's Environment Variables, add the same three values from
   `.env.local` (Vercel won't read `.env.local` itself).
4. Deploy. Optionally point a Loopia domain at it the way you did for abakusnorge.com.

## What's next

- **Barcode/SKU matching** for sales, if manual matching gets tedious.
- **Terminal sync** (Zettle/SumUp) — add a `terminal_transaction_id` column and one
  API route that reads their transactions API; everything else stays as-is.
- **PWA manifest** so it installs on your phone home screen like Grønn Moms.
