-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  name_en text,
  category text not null default 'Annet',
  brand text,
  size text,
  color text,
  buy_price numeric default 0,
  vat numeric default 0,
  expenses numeric default 0,
  potential_sale_price numeric default 0,
  date_bought date not null default current_date,
  status text not null default 'available',
  sold_price numeric,
  sold_date date,
  photo_url text,
  created_at timestamptz default now()
);

-- Migration for existing databases: run these lines if the table above
-- already exists without these columns (safe to run even if they already exist).
alter table items add column if not exists name_en text;
alter table items add column if not exists expenses numeric default 0;
alter table items add column if not exists potential_sale_price numeric default 0;

alter table items enable row level security;

create policy "Users can view own items"
  on items for select using (auth.uid() = user_id);

create policy "Users can insert own items"
  on items for insert with check (auth.uid() = user_id);

create policy "Users can update own items"
  on items for update using (auth.uid() = user_id);

create policy "Users can delete own items"
  on items for delete using (auth.uid() = user_id);

-- Storage: after running this, go to Storage in the Supabase dashboard and
-- create a bucket named "item-photos". Make it public (simplest for now —
-- swap to signed URLs later if you want photos private).
