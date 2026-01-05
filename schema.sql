-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- MOVIES (Local Cache of TMDB Data)
create table movies (
  tmdb_id integer primary key,
  title text not null,
  poster_path text,
  backdrop_path text,
  release_date date,
  runtime integer, -- in minutes
  genres jsonb, -- array of {id, name}
  production_countries jsonb, -- array of {iso_3166_1, name}
  vote_average numeric,
  overview text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table movies enable row level security;
create policy "Movies are viewable by everyone." on movies for select using (true);
create policy "Authenticated users can insert movies." on movies for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update movies." on movies for update using (auth.role() = 'authenticated');

-- LOGS ( The Diary Entry )
create table logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer references movies(tmdb_id) not null,
  watched_at date default CURRENT_DATE,
  rating numeric check (rating >= 0 and rating <= 10), -- 0 to 10 scale
  review text, -- Public review
  notes text, -- Private notes
  platform text, -- Netflix, HBO, Cinema, etc.
  format text, -- 4K, IMAX, DVD, etc.
  company text, -- Solo, Date, etc.
  is_rewatch boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table logs enable row level security;
create policy "Logs viewable by everyone." on logs for select using (true);
create policy "Users can insert their own logs." on logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own logs." on logs for update using (auth.uid() = user_id);
create policy "Users can delete their own logs." on logs for delete using (auth.uid() = user_id);

-- WATCHLIST
create table watchlist (
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer references movies(tmdb_id) not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, tmdb_id)
);

alter table watchlist enable row level security;
create policy "Watchlist viewable by everyone." on watchlist for select using (true);
create policy "Users can insert into own watchlist." on watchlist for insert with check (auth.uid() = user_id);
create policy "Users can delete from own watchlist." on watchlist for delete using (auth.uid() = user_id);

-- FUNCTION: Handle New User -> Create Profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
