-- SOCIAL FEATURES SECURITY UPDATES
-- Run this in your Supabase SQL Editor to enable "Instagram-style" social features.

-- 1. PROFILES: Allow everyone to see profiles (Avatar, Name)
-- Drop old strict policy
drop policy if exists "Users can see own profile." on profiles;
drop policy if exists "Public profiles are viewable by everyone." on profiles; 

-- Create new public read policy
create policy "Profiles are viewable by everyone." 
on profiles for select 
using ( true ); 
-- or: using ( auth.role() = 'authenticated' ); if you want only logged in users.

-- 2. LOGS: Allow everyone to see what movies others watched
-- Drop old strict policy
drop policy if exists "Users can see own logs." on logs;
drop policy if exists "Logs viewable by everyone." on logs;

-- Create new public read policy
create policy "Logs are viewable by everyone." 
on logs for select 
using ( true );

-- 3. WATCHLIST: Optional - Keep private for now?
-- If you want to allow users to see others' watchlists, uncomment below:
/*
drop policy if exists "Users can see own watchlist." on watchlist;
create policy "Watchlists are viewable by everyone." 
on watchlist for select 
using ( true );
*/

-- 4. USER BADGES: Allow everyone to see badges
alter table user_badges enable row level security;
drop policy if exists "Badges viewable by everyone." on user_badges;
create policy "Badges viewable by everyone." 
on user_badges for select 
using ( true );

-- 5. USER SEARCH INDEX (Optional for performance)
-- Create an index on username for faster searching
create index if not exists profiles_username_idx on profiles(username);
