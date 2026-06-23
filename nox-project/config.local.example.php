<?php
/* ============================================================
   MODELO — NÃO contém segredo. Copie este arquivo para
   "config.local.php" (mesma pasta) NO SERVIDOR e preencha a
   senha real. O config.local.php:
     - NÃO é versionado no Git (.gitignore)
     - NÃO é tocado pelo deploy automático (exclude no workflow)
   Assim a senha do e-mail vive só no servidor, em segurança.
   ------------------------------------------------------------
   Pode sobrescrever qualquer variável de CONFIG do enviar.php.
============================================================ */

$SMTP_PASS = 'COLOQUE_AQUI_A_SENHA_DO_EMAIL';

// CRM / painel de leads — grava cada lead no Supabase.
// A service_role key é um SEGREDO (acesso total ao banco): só aqui, nunca no Git.
// Supabase → Project Settings → API → Project URL e "service_role" secret.
$SUPABASE_URL         = 'https://SEU-PROJETO.supabase.co';
$SUPABASE_SERVICE_KEY = 'COLOQUE_AQUI_A_SERVICE_ROLE_KEY';
