-- Phase 3: Intelligence Features

-- 1. Add cast_data to movies table for "Connections"
ALTER TABLE movies 
ADD COLUMN cast_data jsonb;

-- 2. Create hidden_items table for "Blacklist"
create table hidden_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text default 'movie', -- 'movie' or 'tv'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, tmdb_id)
);

alter table hidden_items enable row level security;
create policy "Users can view own hidden items." on hidden_items for select using (auth.uid() = user_id);
create policy "Users can insert own hidden items." on hidden_items for insert with check (auth.uid() = user_id);
create policy "Users can delete own hidden items." on hidden_items for delete using (auth.uid() = user_id);
