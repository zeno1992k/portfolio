-- Run against a disposable Supabase database with an owner/admin connection.
-- The auth fixture and all learning records are rolled back at the end.
-- This is plain PostgreSQL assertion SQL, not a pgTAP/pg_prove suite.
begin;

insert into auth.users (id, email, aud, role) values
  ('11111111-1111-4111-8111-111111111111', 'learning-a@example.test', 'authenticated', 'authenticated'),
  ('22222222-2222-4222-8222-222222222222', 'learning-b@example.test', 'authenticated', 'authenticated');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{}', true);
do $$
begin
  begin
    perform public.get_learning_state();
    raise exception 'Anonymous get was permitted';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.push_learning_state(0, '{"version":1,"progress":{},"bookmarks":[],"history":[]}'::jsonb);
    raise exception 'Anonymous push was permitted';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.push_learning_state(0, '{"version":1,"progress":{},"bookmarks":[],"history":[]}'::jsonb,
      null, null, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    raise exception 'Anonymous mutation upload was permitted';
  exception when insufficient_privilege then null;
  end;
  begin
    perform * from public.user_learning_state;
    raise exception 'Anonymous table read was permitted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
do $$
begin
  begin
    perform public.get_learning_state();
    raise exception 'Missing user ID was permitted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
do $$
declare
  result jsonb;
  saved jsonb;
  initial_state jsonb := '{
    "version":1,
    "progress":{"closure":{"dueAt":1791500000000,"interval":3,"reviews":8,"lastRating":"good","lastReviewedAt":1791240800000}},
    "bookmarks":["closure"],
    "history":[{"id":"closure","rating":"good","at":1791240800000}],
    "session":{"ids":["closure"],"index":0,"revealed":true,"ratings":[],"startedAt":1791240800000}
  }'::jsonb;
begin
  result := public.get_learning_state();
  if result ->> 'ok' <> 'true' or result ->> 'revision' <> '0'
    or result #> '{state,progress}' <> '{}'::jsonb
    or result #>> '{settings,morning}' <> '08:30'
  then raise exception 'New account defaults are incorrect: %', result; end if;

  result := public.push_learning_state(0, initial_state,
    '{"morning":"09:00","evening":"19:00","weekdaysOnly":false}'::jsonb,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  if result ->> 'ok' <> 'true' or result ->> 'revision' <> '1'
    or result #>> '{state,progress,closure,reviews}' <> '8'
    or result #> '{state,session}' <> 'null'::jsonb
    or result #>> '{settings,timeZone}' <> 'Asia/Seoul'
    or result #>> '{settings,morning}' <> '09:00'
  then raise exception 'Valid push did not preserve progress/settings or strip session: %', result; end if;
  saved := result -> 'state';

  -- A repeated import may contain stale/different data. Return current state.
  result := public.push_learning_state(0, jsonb_set(initial_state, '{bookmarks}', '[]'::jsonb), null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  if result ->> 'importAlreadyApplied' <> 'true' or result ->> 'revision' <> '1'
    or result -> 'state' <> saved
  then raise exception 'Repeated guest import was not idempotent: %', result; end if;

  -- Simulate a second device using a stale revision.
  result := public.push_learning_state(0, jsonb_set(initial_state, '{bookmarks}', '[]'::jsonb));
  if result ->> 'ok' <> 'false' or result ->> 'conflict' <> 'true'
    or result ->> 'revision' <> '1' or result -> 'state' <> saved
  then raise exception 'Stale device overwrote current data: %', result; end if;

  result := public.push_learning_state(1, jsonb_set(initial_state, '{bookmarks}', '[]'::jsonb));
  if result ->> 'revision' <> '2' or result #> '{state,bookmarks}' <> '[]'::jsonb
    or result #>> '{settings,morning}' <> '09:00'
  then raise exception 'CAS retry or null settings preservation failed: %', result; end if;

  result := public.push_learning_state(0, initial_state, null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  if result ->> 'importAlreadyApplied' <> 'true' or result ->> 'revision' <> '2'
    or result #> '{state,bookmarks}' <> '[]'::jsonb
  then raise exception 'Old import resurrected a subsequently deleted bookmark: %', result; end if;

  begin
    perform public.push_learning_state(2, jsonb_set(initial_state, '{progress,closure,dueAt}', '"not a timestamp"'::jsonb));
    raise exception 'Invalid timestamp was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.push_learning_state(2, initial_state,
      '{"morning":"99:99","evening":"19:00","weekdaysOnly":false}'::jsonb);
    raise exception 'Invalid commute time was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.push_learning_state(-1, initial_state);
    raise exception 'Negative revision was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.push_learning_state(2, jsonb_set(initial_state, '{bookmarks}', '["closure","closure"]'::jsonb));
    raise exception 'Duplicate bookmarks were accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.push_learning_state(2, jsonb_set(initial_state, '{history,0,id}', '123'::jsonb));
    raise exception 'Numeric history term ID was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.push_learning_state(2, initial_state,
      '{"morning":"09:00","evening":"19:00","weekdaysOnly":false,"timeZone":null}'::jsonb);
    raise exception 'Null time zone was accepted';
  exception when invalid_parameter_value then null;
  end;
  if public.get_learning_state() ->> 'revision' <> '2' then
    raise exception 'Rejected payload mutated the account';
  end if;

  -- An ordinary upload committed, but its HTTP response was lost.
  result := public.push_learning_state(2, initial_state, null, null,
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  if result ->> 'revision' <> '3' or result ->> 'mutationAlreadyApplied' <> 'false'
    or result #> '{state,bookmarks}' <> '["closure"]'::jsonb
  then raise exception 'Fresh ordinary mutation did not apply: %', result; end if;

  -- A different device then deletes the bookmark before the first device retries.
  result := public.push_learning_state(3, jsonb_set(initial_state, '{bookmarks}', '[]'::jsonb), null, null,
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc');
  if result ->> 'revision' <> '4' or result #> '{state,bookmarks}' <> '[]'::jsonb then
    raise exception 'Later ordinary bookmark deletion did not apply: %', result;
  end if;

  -- Retry keeps the UUID: even stale revision/different valid body returns canonical data.
  result := public.push_learning_state(2, jsonb_set(initial_state, '{bookmarks}', '["promise"]'::jsonb), null, null,
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  if result ->> 'ok' <> 'true' or result ->> 'conflict' <> 'false'
    or result ->> 'mutationAlreadyApplied' <> 'true' or result ->> 'importAlreadyApplied' <> 'false'
    or result ->> 'revision' <> '4' or result #> '{state,bookmarks}' <> '[]'::jsonb
  then raise exception 'Lost ordinary ACK retry resurrected a deleted bookmark: %', result; end if;
  result := public.push_learning_state(4, initial_state, null, null,
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  if result ->> 'mutationAlreadyApplied' <> 'true' or result ->> 'revision' <> '4'
    or result #> '{state,bookmarks}' <> '[]'::jsonb
  then raise exception 'Current-revision duplicate mutation overwrote canonical data: %', result; end if;

  begin
    update public.user_learning_state set revision = 99 where user_id = auth.uid();
    raise exception 'Direct table updates were permitted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
do $$
declare
  result jsonb;
  count_rows integer;
begin
  result := public.get_learning_state();
  if result ->> 'revision' <> '0' or result #> '{state,bookmarks}' <> '[]'::jsonb then
    raise exception 'Account B received account A data: %', result;
  end if;
  select count(*) into count_rows from public.user_learning_state
    where user_id = '11111111-1111-4111-8111-111111111111';
  if count_rows <> 0 then raise exception 'RLS exposed another account'; end if;
  select count(*) into count_rows from public.user_learning_state;
  if count_rows <> 1 then raise exception 'RLS did not restrict the snapshot to its owner'; end if;

  -- Mutation UUIDs are isolated by auth.uid(), not globally shared across accounts.
  result := public.push_learning_state(0,
    '{"version":1,"progress":{},"bookmarks":["promise"],"history":[]}'::jsonb,
    null, null, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  if result ->> 'revision' <> '1' or result ->> 'mutationAlreadyApplied' <> 'false'
    or result #> '{state,bookmarks}' <> '["promise"]'::jsonb
  then raise exception 'Account B reused UUID was confused with account A: %', result; end if;
  result := public.push_learning_state(0,
    '{"version":1,"progress":{},"bookmarks":[],"history":[]}'::jsonb,
    null, null, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  if result ->> 'mutationAlreadyApplied' <> 'true' or result ->> 'revision' <> '1'
    or result #> '{state,bookmarks}' <> '["promise"]'::jsonb
  then raise exception 'Account B duplicate mutation was not isolated/idempotent: %', result; end if;

  begin
    insert into public.user_learning_state (user_id)
      values ('11111111-1111-4111-8111-111111111111');
    raise exception 'Cross-account insert was permitted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
delete from auth.users where id = '22222222-2222-4222-8222-222222222222';
do $$
begin
  if exists (select 1 from public.user_learning_state where user_id = '22222222-2222-4222-8222-222222222222') then
    raise exception 'Account deletion did not cascade to its learning data';
  end if;
end;
$$;

rollback;
