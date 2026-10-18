import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const migrationsDir = new URL('../migrations/', import.meta.url);
const testsDir = new URL('./', import.meta.url);
const db = new PGlite();

try {
  // This models Supabase's database roles and JWT sub lookup only.
  // It does not simulate OAuth, PostgREST, JWT signature checking, or hosted Auth.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    grant usage on schema public to anon, authenticated;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      aud text,
      role text
    );
    create function auth.uid() returns uuid language sql stable as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
      )::uuid;
    $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);

  for (const name of (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort()) {
    await db.exec(await readFile(new URL(name, migrationsDir), 'utf8'));
    console.log(`Migration passed: ${name}`);
  }

  for (const name of (await readdir(testsDir)).filter((name) => name.endsWith('.sql')).sort()) {
    await db.exec(await readFile(new URL(name, testsDir), 'utf8'));
    console.log(`Database assertions passed: ${name}`);
  }
  console.log('Local PostgreSQL assertions passed; hosted Google OAuth is not covered.');
} catch (error) {
  console.error('Database test failed:', error.message);
  if (error.position) console.error(`SQL error position: ${error.position}`);
  process.exitCode = 1;
} finally {
  await db.close();
}
