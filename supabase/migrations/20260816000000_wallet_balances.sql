-- Server-authoritative balances for WalletIO.
--
-- Balances live in `wallet_balances`, keyed by asset symbol ('USD' is the
-- cash liquidity pool). Users can read only their own rows, and no client
-- can write to the table directly: every mutation must go through the
-- security-definer RPC `walletio_apply_movement`, which applies a signed
-- delta atomically and rejects negative balances. Editing localStorage
-- therefore can't mint money — the server is the source of truth.
--
-- Ledger entries are append-only per user (RLS insert with check), so the
-- app can record its own transaction history server-side.

create extension if not exists pgcrypto;

create table if not exists public.wallet_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  name text not null default '',
  balance numeric(24, 8) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  amount numeric(24, 8) not null,
  category text not null default '',
  status text not null default 'SETTLED',
  type text not null default 'outbound',
  currency_symbol text not null default 'USD',
  created_at timestamptz not null default now()
);

alter table public.wallet_balances enable row level security;
alter table public.ledger_entries enable row level security;

-- Users may read (only) their own balances. No insert/update/delete policies:
-- mutations are exclusively performed by the RPC below.
create policy "read own balances" on public.wallet_balances
  for select using (auth.uid() = user_id);

-- Ledger: users may read and append their own entries, but not modify or
-- delete them, so history is tamper-evident.
create policy "read own ledger" on public.ledger_entries
  for select using (auth.uid() = user_id);
create policy "insert own ledger" on public.ledger_entries
  for insert with check (auth.uid() = user_id);

-- Atomically apply a signed delta to a user's balance. Returns the new
-- balance. Raises on negative results so balances can't go below zero.
create or replace function public.walletio_apply_movement(
  p_symbol text,
  p_delta numeric
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_balance numeric;
  v_name text;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_delta is null or p_delta = 0 then
    select balance into v_balance
      from public.wallet_balances
      where user_id = v_user and symbol = p_symbol;
    return v_balance;
  end if;

  v_name := case p_symbol
    when 'USD' then 'USD Cash'
    when 'BTC' then 'Bitcoin'
    when 'ETH' then 'Ethereum'
    when 'WIO' then 'WalletIO Coin'
    else p_symbol
  end;

  select balance into v_balance
    from public.wallet_balances
    where user_id = v_user and symbol = p_symbol;

  if v_balance is null then
    -- New symbol: only positive (funding) movements are allowed.
    if p_delta < 0 then
      raise exception 'insufficient balance for %', p_symbol;
    end if;
    insert into public.wallet_balances (user_id, symbol, name, balance)
      values (v_user, p_symbol, v_name, p_delta)
      returning balance into v_balance;
  else
    v_balance := v_balance + p_delta;
    if v_balance < 0 then
      raise exception 'insufficient balance for %', p_symbol;
    end if;
    update public.wallet_balances
      set balance = v_balance, updated_at = now()
      where user_id = v_user and symbol = p_symbol;
  end if;

  return v_balance;
end;
$$;

-- Only authenticated clients may invoke the movement RPC.
revoke execute on function public.walletio_apply_movement(text, numeric) from public, anon;
grant execute on function public.walletio_apply_movement(text, numeric) to authenticated;

grant select on public.wallet_balances to authenticated;
grant select, insert on public.ledger_entries to authenticated;

-- Seed a fresh account with the starter portfolio.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallet_balances (user_id, symbol, name, balance) values
    (new.id, 'USD', 'USD Cash', 42069),
    (new.id, 'BTC', 'Bitcoin', 1.248),
    (new.id, 'ETH', 'Ethereum', 18.52),
    (new.id, 'WIO', 'WalletIO Coin', 66998);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
