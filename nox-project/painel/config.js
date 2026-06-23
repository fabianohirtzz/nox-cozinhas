/* ============================================================
   NOX — Painel de Leads · configuração do Supabase
   ------------------------------------------------------------
   Estes dois valores são PÚBLICOS por natureza (a anon key é
   feita para rodar no navegador). A segurança vem das políticas
   RLS + login: sem usuário autenticado, ninguém lê nem grava.

   Onde pegar (mesmo projeto Supabase do hd360):
   Supabase → Project Settings → API
     • Project URL      →  SUPABASE_URL
     • Project API keys → "anon public"  →  SUPABASE_ANON_KEY
============================================================ */
window.NOX_CONFIG = {
  SUPABASE_URL: 'https://euzmbswywwhmicjlszqw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1em1ic3d5d3dobWljamxzenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDEyODYsImV4cCI6MjA5NjAxNzI4Nn0.oSIv6fSKVxO9Umuii6xt98cT0yoSqepTIzVCdcocfuU'
};
