-- BADGES
create table user_badges (
  user_id uuid references profiles(id) on delete cascade not null,
  badge_code text not null, -- 'NOVATO', 'CRITIC', etc.
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, badge_code)
);

alter table user_badges enable row level security;
create policy "Badges viewable by everyone." on user_badges for select using (true);
create policy "System/Users can insert own badges." on user_badges for insert with check (auth.uid() = user_id);
