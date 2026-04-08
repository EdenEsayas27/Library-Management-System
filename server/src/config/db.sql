-- ==========================================
-- Library Management System - Base Schema
-- ==========================================

-- Optional: helps with UUID generation in Postgres
create extension if not exists "pgcrypto";

-- -------------------------
-- 1) Genres
-- -------------------------
create table if not exists public.genres (
  id bigserial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- -------------------------
-- 2) Books
-- -------------------------
create table if not exists public.books (
  id bigserial primary key,
  title text not null,
  author text not null,
  isbn text unique,
  genre_id bigint references public.genres(id) on delete set null,
  total_copies integer not null default 1 check (total_copies >= 0),
  available_copies integer not null default 1 check (available_copies >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available_copies <= total_copies)
);

-- -------------------------
-- 3) Members
-- -------------------------
create table if not exists public.members (
  id bigserial primary key,
  full_name text not null,
  email text unique,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------
-- 4) Staff (for login/JWT)
-- -------------------------
create table if not exists public.staff (
  id bigserial primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'librarian' check (role in ('admin', 'librarian')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------
-- 5) Borrow Records
-- -------------------------
create table if not exists public.borrow_records (
  id bigserial primary key,
  member_id bigint not null references public.members(id) on delete cascade,
  book_id bigint not null references public.books(id) on delete restrict,
  borrowed_at timestamptz not null default now(),
  due_date timestamptz not null,
  returned_at timestamptz null,
  created_at timestamptz not null default now(),
  check (due_date > borrowed_at)
);

-- Useful indexes
create index if not exists idx_books_genre_id on public.books(genre_id);
create index if not exists idx_books_title on public.books(title);
create index if not exists idx_borrow_member_id on public.borrow_records(member_id);
create index if not exists idx_borrow_book_id on public.borrow_records(book_id);
create index if not exists idx_borrow_due_date on public.borrow_records(due_date);
create index if not exists idx_borrow_returned_at on public.borrow_records(returned_at);

-- -----------------------------------------
-- Auto-update updated_at on changes
-- -----------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
before update on public.members
for each row execute function public.set_updated_at();

drop trigger if exists trg_staff_updated_at on public.staff;
create trigger trg_staff_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

-- -----------------------------------------
-- View used by reportController.popularGenres
-- -----------------------------------------
create or replace view public.genre_popularity as
select
  g.id as genre_id,
  g.name as genre_name,
  count(br.id)::int as borrow_count
from public.genres g
left join public.books b on b.genre_id = g.id
left join public.borrow_records br on br.book_id = b.id
group by g.id, g.name
order by borrow_count desc;