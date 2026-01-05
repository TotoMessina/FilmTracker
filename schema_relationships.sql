-- SOCIAL GRAPH
-- Run this in Supabase SQL Editor

create table if not exists relationships (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- RLS
alter table relationships enable row level security;

-- 1. Read: Everyone can see who follows who
create policy "Relationships are viewable by everyone." 
on relationships for select 
using ( true );

-- 2. Insert: Users can only follow others as themselves
create policy "Users can follow others." 
on relationships for insert 
with check ( auth.uid() = follower_id );

-- 3. Delete: Users can unfollow (delete their own row)
create policy "Users can unfollow." 
on relationships for delete 
using ( auth.uid() = follower_id );

-- 4. Count indexes for performance
create index if not exists relationships_follower_idx on relationships(follower_id);
create index if not exists relationships_following_idx on relationships(following_id);
