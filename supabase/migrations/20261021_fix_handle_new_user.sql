-- Fix: signup 500 "Database error saving new user"
-- Jalankan di Supabase SQL Editor. JANGAN tambahkan begin/rollback di file ini:
-- SQL Editor mengeksekusi seluruh script sebagai satu transaksi, rollback akan
-- membatalkan DDL di atasnya.
--
-- Akar masalah: fungsi trigger berjalan di session GoTrue (supabase_auth_admin)
-- yang search_path-nya tidak mencakup public, sehingga INSERT INTO profiles gagal.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Jaga-jaga: pastikan role auth service boleh menjalankan trigger & schema public.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
