# NOX — Painel de Leads (CRM): setup

Painel para acompanhar os leads do formulário do site, com gestão comercial
(status, orçamento, venda, observações) e relatórios (origem, conversão,
ROAS, ROI, ticket médio). Um usuário só. Banco no **mesmo projeto Supabase do
hd360**.

## Arquitetura

```
Formulário do site (index.html + main.js)
   │  captura origem (gclid / UTM / referrer) no navegador
   ▼
enviar.php  ──► envia o e-mail (SMTP, como sempre)
            └─► grava o lead no Supabase (REST, com a service_role key)
                       │
                       ▼
              Supabase: tabelas `leads` e `ad_spend`  (RLS ligado)
                       ▲
                       │ anon key + login (Supabase Auth)
   noxcozinhas.com.br/painel/  ◄── você acessa, lê e edita os leads
```

- **Gravação** do lead: feita pelo `enviar.php` com a *service_role* key (ignora
  RLS). A chave fica só no `config.local.php` do servidor — nunca no Git.
- **Leitura/edição**: o painel usa a *anon* key + login. Com o RLS ligado,
  ninguém sem login autenticado lê ou grava nada.

## Arquivos criados/alterados

| Arquivo | O quê |
|---|---|
| `nox-project/painel/index.html` | Estrutura do painel |
| `nox-project/painel/painel.css` | Estilo (Roboto, preto + amarelo/laranja) |
| `nox-project/painel/app.js` | Lógica: login, carregar, editar, relatórios |
| `nox-project/painel/config.js` | URL + anon key (você preenche) |
| `supabase/schema.sql` | Cria as tabelas + RLS (rodar no Supabase) |
| `nox-project/enviar.php` | Passou a gravar o lead no Supabase |
| `nox-project/assets/js/main.js` | Passou a capturar a origem e mandar no form |
| `nox-project/config.local.example.php` | Documenta os segredos do servidor |

---

## Passo a passo (o que você precisa fazer)

### 1. Criar as tabelas no Supabase
1. Abra o projeto do **hd360** no Supabase.
2. Menu **SQL Editor → New query**.
3. Cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique **Run**.
   - Cria `leads` e `ad_spend` com RLS ligado.

### 2. Criar o usuário (1 acesso)
1. Menu **Authentication → Users → Add user → Create new user**.
2. E-mail (ex.: `contato@noxcozinhas.com.br`) + uma senha forte. Marque
   **Auto Confirm User**.
3. Essa será a credencial de login do painel.

> Opcional (recomendado): em **Authentication → Providers → Email**, deixe
> *“Enable email signups”* **desligado** — assim ninguém cria conta nova.

### 3. Pegar as chaves
Em **Project Settings → API**:
- **Project URL**
- **anon public** key
- **service_role** key (secreta!)

### 4. Configurar o painel (anon — pode ir pro Git)
Edite [`nox-project/painel/config.js`](nox-project/painel/config.js) e cole a
**Project URL** e a **anon public** key.

### 5. Configurar o servidor (service_role — segredo)
No servidor (cPanel da erehost), no arquivo
`public_html/config.local.php` (o mesmo onde já fica a senha do e-mail),
adicione:

```php
$SUPABASE_URL         = 'https://SEU-PROJETO.supabase.co';
$SUPABASE_SERVICE_KEY = 'a_service_role_key_secreta';
```

> Modelo completo em `nox-project/config.local.example.php`. Esse arquivo
> **não** é versionado nem sobrescrito pelo deploy.

### 6. Publicar
Faça commit e push na `main`. O deploy automático (GitHub Actions → FTP)
publica tudo, inclusive `painel/`. O painel fica em:

```
https://noxcozinhas.com.br/painel/
```

---

## Como a origem é detectada

Capturada no navegador quando o visitante chega e enviada junto do formulário:

| Sinal na URL / referrer | Origem |
|---|---|
| `gclid`, `gad_source` ou `utm_medium=cpc/ppc/paid` | **Pago** |
| `utm_medium=social` ou referrer Instagram/Facebook/etc. | **Social** |
| `utm_medium=organic` ou referrer Google/Bing/etc. | **Orgânico** |
| Sem referrer (digitou o site) | **Direto** |

Regras: um toque **pago sempre vence** (para o ROAS bater com o Ads) e a
origem fica guardada por visitante. No painel dá para **corrigir a origem na
mão** em cada lead. Vale só para leads novos — os anteriores ao deploy não têm
como recuperar a origem.

## Teste rápido depois de publicar
1. Acesse `noxcozinhas.com.br/?gclid=teste123` e envie o formulário.
2. Confira o e-mail (continua chegando) **e** o lead aparecendo em `/painel/`
   com origem **Pago**.
3. Em **Relatórios**, digite o investimento do mês e veja ROAS/ROI.

## Custo
Tudo no plano que já existe do Supabase (hd360). Volume de leads de um site
institucional fica folgado no tier gratuito.
