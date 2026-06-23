-- ============================================================
-- NOX Cozinhas — Painel de Leads
-- Rode este script no Supabase do hd360:
--   Supabase → SQL Editor → New query → cole tudo → Run
-- Cria as tabelas `leads` e `ad_spend` com RLS.
--   • A gravação do lead pelo site usa a SERVICE ROLE key
--     (no enviar.php), que ignora RLS por design.
--   • O painel usa a ANON key + login: só o usuário autenticado
--     consegue ler/editar. Sem login, ninguém vê nada.
-- ============================================================

-- ---------- TABELA: leads ----------
create table if not exists public.leads (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),

  -- preenchido pelo formulário do site
  nome         text,
  empresa      text,
  telefone     text,
  email        text,
  setor        text,
  produto      text,
  cidade       text,
  descricao    text,

  -- rastreio de origem (capturado no navegador e enviado pelo form)
  origem        text,          -- pago | organico | social | direto (detecção automática)
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  gclid         text,
  referrer      text,
  landing_page  text,

  -- gestão comercial (preenchido à mão no painel)
  status         text not null default 'semresposta',  -- semresposta|atendimento|negociacao|venda|perdido
  origem_manual  text,                                  -- sobrescreve a origem detectada
  orcamento      numeric not null default 0,
  venda          numeric not null default 0,
  observacoes    text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- usuário autenticado (o vendedor) tem acesso total
drop policy if exists "leads_auth_all" on public.leads;
create policy "leads_auth_all" on public.leads
  for all to authenticated using (true) with check (true);
-- (a service role usada no enviar.php ignora RLS — não precisa de policy de insert público)


-- ---------- TABELA: ad_spend (investimento mensal em Ads) ----------
create table if not exists public.ad_spend (
  month       text primary key,          -- 'YYYY-MM'
  amount      numeric not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.ad_spend enable row level security;

drop policy if exists "ad_spend_auth_all" on public.ad_spend;
create policy "ad_spend_auth_all" on public.ad_spend
  for all to authenticated using (true) with check (true);

-- mantém updated_at em dia
create or replace function public.touch_ad_spend() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists ad_spend_touch on public.ad_spend;
create trigger ad_spend_touch before update on public.ad_spend
  for each row execute function public.touch_ad_spend();
