-- IGP admin workbook, PostgreSQL / Supabase. Run as database owner.
create extension if not exists pgcrypto;
create table public.partners (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (code ~ '^[A-Z0-9_]+$')
);
create table public.user_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','child_sponsor','ape','partner','associate')),
 partner_id uuid references public.partners(id), display_name text,
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check ((role = 'partner') = (partner_id is not null))
);
create function public.igp_role() returns text language sql stable security definer set search_path = ''
as $$ select role from public.user_profiles where id = (select auth.uid()) $$;
create function public.igp_partner_id() returns uuid language sql stable security definer set search_path = ''
as $$ select partner_id from public.user_profiles where id = (select auth.uid()) $$;
create table public.partner_grants (
 id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id),
 fiscal_year integer not null check (fiscal_year between 2000 and 2100),
 entered_total numeric(18,2), prior_year_unutilised numeric(18,2), entered_effective_grant numeric(18,2),
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(partner_id,fiscal_year)
);
create table public.partner_grant_items (
 id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id),
 fiscal_year integer not null check (fiscal_year between 2000 and 2100),
 category text not null, amount numeric(18,2) not null,
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(partner_id,fiscal_year,category)
);
create table public.partner_metrics (
 id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id),
 fiscal_year integer not null check (fiscal_year between 2000 and 2100),
 metric text not null, unit text not null check(unit in ('people','target_people','unspecified')),
 value numeric(18,3) not null,
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(partner_id,fiscal_year,metric)
);
create table public.partner_schedules (
 id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id),
 fiscal_year integer not null check (fiscal_year between 2000 and 2100), month integer not null check(month between 1 and 12),
 amount numeric(18,2), source_formula text, cached_amount numeric(18,2),
 verification_status text not null default 'verified' check(verification_status in ('verified','unverified_external_formula')),
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(partner_id,fiscal_year,month),
 check ((verification_status='verified' and amount is not null and source_formula is null)
 or (verification_status='unverified_external_formula' and amount is null and source_formula is not null))
);
create table public.petty_cash_monthly (
 id uuid primary key default gen_random_uuid(), fiscal_year integer not null check(fiscal_year between 2000 and 2100),
 month integer not null check(month between 1 and 12), category text not null, amount numeric(18,2) not null,
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(fiscal_year,month,category)
);
create table public.audit_events (
 id bigint generated always as identity primary key, table_name text not null, record_id uuid not null,
 action text not null check(action in ('INSERT','UPDATE','DELETE')),
 old_row jsonb, new_row jsonb, actor_id uuid, occurred_at timestamptz not null default now()
);
create function public.igp_audit_row() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if tg_op='INSERT' then
  insert into public.audit_events(table_name,record_id,action,new_row,actor_id)
  values(tg_table_name,new.id,tg_op,to_jsonb(new),auth.uid());
  return new;
 elsif tg_op='UPDATE' then
  new.version:=old.version+1; new.updated_at:=now();
  insert into public.audit_events(table_name,record_id,action,old_row,new_row,actor_id)
  values(tg_table_name,new.id,tg_op,to_jsonb(old),to_jsonb(new),auth.uid());
  return new;
 else
  insert into public.audit_events(table_name,record_id,action,old_row,actor_id)
  values(tg_table_name,old.id,tg_op,to_jsonb(old),auth.uid());
  return old;
 end if;
end $$;
create trigger audit_partners before insert or update or delete on public.partners for each row execute function public.igp_audit_row();
create trigger audit_user_profiles before insert or update or delete on public.user_profiles for each row execute function public.igp_audit_row();
create trigger audit_partner_grants before insert or update or delete on public.partner_grants for each row execute function public.igp_audit_row();
create trigger audit_partner_grant_items before insert or update or delete on public.partner_grant_items for each row execute function public.igp_audit_row();
create trigger audit_partner_metrics before insert or update or delete on public.partner_metrics for each row execute function public.igp_audit_row();
create trigger audit_partner_schedules before insert or update or delete on public.partner_schedules for each row execute function public.igp_audit_row();
create trigger audit_petty_cash_monthly before insert or update or delete on public.petty_cash_monthly for each row execute function public.igp_audit_row();
alter table public.partners enable row level security;
alter table public.user_profiles enable row level security;
alter table public.partner_grants enable row level security;
alter table public.partner_grant_items enable row level security;
alter table public.partner_metrics enable row level security;
alter table public.partner_schedules enable row level security;
alter table public.petty_cash_monthly enable row level security;
alter table public.audit_events enable row level security;
create policy partners_read on public.partners for select to authenticated using (
 public.igp_role() in ('admin','child_sponsor','ape') or id=public.igp_partner_id());
create policy partners_admin_write on public.partners for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy profiles_read on public.user_profiles for select to authenticated using(id=(select auth.uid()) or public.igp_role()='admin');
create policy profiles_admin_write on public.user_profiles for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy grants_read on public.partner_grants for select to authenticated using(public.igp_role()='admin' or partner_id=public.igp_partner_id());
create policy grants_admin_write on public.partner_grants for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy grant_items_read on public.partner_grant_items for select to authenticated using(public.igp_role()='admin' or partner_id=public.igp_partner_id());
create policy grant_items_admin_write on public.partner_grant_items for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy metrics_read on public.partner_metrics for select to authenticated using(
 public.igp_role()='admin' or partner_id=public.igp_partner_id()
 or (public.igp_role()='child_sponsor' and metric in ('CS','ECC','EA 12K','EA 15K','EA','Social Worker','PSW'))
 or (public.igp_role()='ape' and metric='APE'));
create policy metrics_admin_write on public.partner_metrics for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy schedules_read on public.partner_schedules for select to authenticated using(public.igp_role()='admin' or partner_id=public.igp_partner_id());
create policy schedules_admin_write on public.partner_schedules for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy petty_cash_admin on public.petty_cash_monthly for all to authenticated using(public.igp_role()='admin') with check(public.igp_role()='admin');
create policy audit_admin_read on public.audit_events for select to authenticated using(public.igp_role()='admin');
revoke all on public.audit_events from anon,authenticated;
grant select on public.audit_events to authenticated;
grant select,insert,update,delete on public.partners,public.user_profiles,public.partner_grants,
 public.partner_grant_items,public.partner_metrics,public.partner_schedules,public.petty_cash_monthly to authenticated;
create view public.partner_grant_reconciliation with (security_invoker=true) as
select g.partner_id,g.fiscal_year,g.entered_total,coalesce(sum(i.amount),0)::numeric(18,2) as item_total,
 g.prior_year_unutilised,g.entered_effective_grant,
 (g.entered_total-g.prior_year_unutilised)::numeric(18,2) as expected_effective_grant
from public.partner_grants g left join public.partner_grant_items i
 on i.partner_id=g.partner_id and i.fiscal_year=g.fiscal_year
group by g.partner_id,g.fiscal_year,g.entered_total,g.prior_year_unutilised,g.entered_effective_grant;
create view public.partner_schedule_totals with (security_invoker=true) as
select partner_id,fiscal_year,sum(amount)::numeric(18,2) as verified_total,
 count(*) filter(where verification_status='unverified_external_formula') as unresolved_cells
from public.partner_schedules group by partner_id,fiscal_year;
grant select on public.partner_grant_reconciliation,public.partner_schedule_totals to authenticated;
