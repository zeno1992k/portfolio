-- One account snapshot is enough for this first cloud-sync version.
-- Revision compare-and-swap prevents a stale device from overwriting another.
-- Only the two RPCs may write. Both derive the owner from auth.uid().

create or replace function public.learning_integer_is_valid(
  p_value jsonb,
  p_minimum numeric,
  p_maximum numeric
) returns boolean
language plpgsql immutable
set search_path = ''
as $$
declare
  value numeric;
begin
  if p_value is null or jsonb_typeof(p_value) <> 'number' then
    return false;
  end if;
  value := (p_value #>> '{}')::numeric;
  return value = trunc(value) and value between p_minimum and p_maximum;
end;
$$;

create or replace function public.learning_term_id_is_valid(p_value text)
returns boolean
language sql immutable
set search_path = ''
as $$
  select coalesce(
    length(p_value) between 1 and 128
      and p_value ~ '^[a-z0-9][a-z0-9_-]*$',
    false
  );
$$;

create or replace function public.learning_state_is_valid(p_state jsonb)
returns boolean
language plpgsql immutable
set search_path = ''
as $$
declare
  term_id text;
  entry jsonb;
  bookmark_count integer;
  distinct_bookmark_count integer;
begin
  if p_state is null or jsonb_typeof(p_state) <> 'object'
    or octet_length(p_state::text) > 1048576
    or p_state -> 'version' is distinct from '1'::jsonb
    or jsonb_typeof(p_state -> 'progress') is distinct from 'object'
    or jsonb_typeof(p_state -> 'bookmarks') is distinct from 'array'
    or jsonb_typeof(p_state -> 'history') is distinct from 'array'
  then
    return false;
  end if;

  if (select count(*) from jsonb_object_keys(p_state -> 'progress')) > 2000
    or jsonb_array_length(p_state -> 'bookmarks') > 2000
    or jsonb_array_length(p_state -> 'history') > 1000
  then
    return false;
  end if;

  for term_id, entry in select key, value from jsonb_each(p_state -> 'progress') loop
    if not public.learning_term_id_is_valid(term_id)
      or jsonb_typeof(entry) <> 'object'
      or not public.learning_integer_is_valid(entry -> 'dueAt', 0, 8640000000000000)
      or not public.learning_integer_is_valid(entry -> 'interval', 1, 36500)
      or not public.learning_integer_is_valid(entry -> 'reviews', 0, 1000000000)
      or entry ->> 'lastRating' is null
      or entry ->> 'lastRating' not in ('again', 'hard', 'good')
      or not public.learning_integer_is_valid(entry -> 'lastReviewedAt', 0, 8640000000000000)
    then
      return false;
    end if;
  end loop;

  for entry in select value from jsonb_array_elements(p_state -> 'bookmarks') loop
    if jsonb_typeof(entry) <> 'string'
      or not public.learning_term_id_is_valid(entry #>> '{}')
    then
      return false;
    end if;
  end loop;

  select count(*), count(distinct value)
    into bookmark_count, distinct_bookmark_count
    from jsonb_array_elements(p_state -> 'bookmarks');
  if bookmark_count <> distinct_bookmark_count then
    return false;
  end if;

  for entry in select value from jsonb_array_elements(p_state -> 'history') loop
    if jsonb_typeof(entry) <> 'object'
      or jsonb_typeof(entry -> 'id') is distinct from 'string'
      or not public.learning_term_id_is_valid(entry ->> 'id')
      or entry ->> 'rating' is null
      or entry ->> 'rating' not in ('again', 'hard', 'good')
      or not public.learning_integer_is_valid(entry -> 'at', 0, 8640000000000000)
    then
      return false;
    end if;
  end loop;

  -- A session is intentionally not validated here: it is removed before saving
  -- because two devices should not take over each other's current card.
  return true;
end;
$$;

create or replace function public.learning_settings_are_valid(p_settings jsonb)
returns boolean
language plpgsql immutable
set search_path = ''
as $$
begin
  if p_settings is null or jsonb_typeof(p_settings) <> 'object'
    or octet_length(p_settings::text) > 2048
    or jsonb_typeof(p_settings -> 'morning') is distinct from 'string'
    or jsonb_typeof(p_settings -> 'evening') is distinct from 'string'
    or jsonb_typeof(p_settings -> 'weekdaysOnly') is distinct from 'boolean'
  then
    return false;
  end if;
  return coalesce(p_settings ->> 'morning' ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
    and p_settings ->> 'evening' ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
    and (
      not (p_settings ? 'timeZone')
      or p_settings ->> 'timeZone' = 'Asia/Seoul'
    ), false);
end;
$$;

revoke all on function public.learning_integer_is_valid(jsonb, numeric, numeric) from public, anon, authenticated;
revoke all on function public.learning_term_id_is_valid(text) from public, anon, authenticated;
revoke all on function public.learning_state_is_valid(jsonb) from public, anon, authenticated;
revoke all on function public.learning_settings_are_valid(jsonb) from public, anon, authenticated;

create table public.user_learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision between 0 and 9007199254740991),
  state jsonb not null default '{"version":1,"progress":{},"bookmarks":[],"history":[],"session":null}'::jsonb,
  settings jsonb not null default '{"morning":"08:30","evening":"18:30","weekdaysOnly":true,"timeZone":"Asia/Seoul"}'::jsonb,
  applied_guest_import_ids uuid[] not null default '{}',
  applied_mutation_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint valid_learning_state check (public.learning_state_is_valid(state)),
  constraint valid_learning_settings check (public.learning_settings_are_valid(settings)),
  constraint device_session_is_local check (state -> 'session' is not distinct from 'null'::jsonb)
);

alter table public.user_learning_state enable row level security;
revoke all on table public.user_learning_state from public, anon, authenticated;
grant select on table public.user_learning_state to authenticated;

create policy "Account owners can read their learning snapshot"
  on public.user_learning_state for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.get_learning_state()
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  snapshot public.user_learning_state%rowtype;
begin
  if owner_id is null then
    raise exception 'Sign in is required' using errcode = '42501';
  end if;

  insert into public.user_learning_state (user_id) values (owner_id)
    on conflict (user_id) do nothing;
  select * into strict snapshot from public.user_learning_state where user_id = owner_id;

  return jsonb_build_object(
    'ok', true,
    'revision', snapshot.revision,
    'state', snapshot.state,
    'settings', snapshot.settings,
    'updatedAt', snapshot.updated_at
  );
end;
$$;

create or replace function public.push_learning_state(
  p_expected_revision bigint,
  p_state jsonb,
  p_settings jsonb default null,
  p_import_id uuid default null,
  p_mutation_id uuid default null
) returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  snapshot public.user_learning_state%rowtype;
  next_state jsonb;
  next_settings jsonb;
begin
  if owner_id is null then
    raise exception 'Sign in is required' using errcode = '42501';
  end if;
  if p_expected_revision is null or p_expected_revision < 0
    or p_expected_revision > 9007199254740991
  then
    raise exception 'Invalid expected revision' using errcode = '22023';
  end if;
  if not public.learning_state_is_valid(p_state) then
    raise exception 'Invalid learning state' using errcode = '22023';
  end if;
  if p_settings is not null and not public.learning_settings_are_valid(p_settings) then
    raise exception 'Invalid learning settings' using errcode = '22023';
  end if;

  insert into public.user_learning_state (user_id) values (owner_id)
    on conflict (user_id) do nothing;
  select * into strict snapshot from public.user_learning_state
    where user_id = owner_id for update;

  -- Resolve lost responses before CAS, including after a later device edit.
  -- Each upload keeps its UUID and exact snapshot until an ACK is durable.
  if (p_import_id is not null and p_import_id = any(snapshot.applied_guest_import_ids))
    or (p_mutation_id is not null and p_mutation_id = any(snapshot.applied_mutation_ids))
  then
    return jsonb_build_object(
      'ok', true,
      'conflict', false,
      'importAlreadyApplied', coalesce(p_import_id = any(snapshot.applied_guest_import_ids), false),
      'mutationAlreadyApplied', coalesce(p_mutation_id = any(snapshot.applied_mutation_ids), false),
      'revision', snapshot.revision,
      'state', snapshot.state,
      'settings', snapshot.settings,
      'updatedAt', snapshot.updated_at
    );
  end if;

  if snapshot.revision <> p_expected_revision then
    return jsonb_build_object(
      'ok', false,
      'conflict', true,
      'importAlreadyApplied', false,
      'mutationAlreadyApplied', false,
      'revision', snapshot.revision,
      'state', snapshot.state,
      'settings', snapshot.settings,
      'updatedAt', snapshot.updated_at
    );
  end if;

  next_state := jsonb_build_object(
    'version', 1,
    'progress', p_state -> 'progress',
    'bookmarks', p_state -> 'bookmarks',
    'history', p_state -> 'history',
    'session', null
  );
  next_settings := case when p_settings is null then snapshot.settings
    else jsonb_build_object(
      'morning', p_settings -> 'morning',
      'evening', p_settings -> 'evening',
      'weekdaysOnly', p_settings -> 'weekdaysOnly',
      'timeZone', 'Asia/Seoul'
    ) end;

  update public.user_learning_state set
    state = next_state,
    settings = next_settings,
    revision = revision + 1,
    applied_guest_import_ids = case when p_import_id is null
      then applied_guest_import_ids
      else array_append(applied_guest_import_ids, p_import_id)
    end,
    applied_mutation_ids = case when p_mutation_id is null
      then applied_mutation_ids
      else array_append(applied_mutation_ids, p_mutation_id)
    end,
    updated_at = clock_timestamp()
  where user_id = owner_id
  returning * into snapshot;

  return jsonb_build_object(
    'ok', true,
    'conflict', false,
    'importAlreadyApplied', false,
    'mutationAlreadyApplied', false,
    'revision', snapshot.revision,
    'state', snapshot.state,
    'settings', snapshot.settings,
    'updatedAt', snapshot.updated_at
  );
end;
$$;

revoke all on function public.get_learning_state() from public, anon, authenticated;
revoke all on function public.push_learning_state(bigint, jsonb, jsonb, uuid, uuid) from public, anon, authenticated;
grant execute on function public.get_learning_state() to authenticated;
grant execute on function public.push_learning_state(bigint, jsonb, jsonb, uuid, uuid) to authenticated;
