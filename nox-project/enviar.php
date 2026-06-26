<?php
/* ============================================================
   NOX Cozinhas Industriais — Recebe o formulário de orçamento
   e envia o e-mail para a empresa via SMTP AUTENTICADO.

   Hospedagem: erehost (cPanel)   ·   Domínio: noxcozinhas.com.br

   POR QUE SMTP (e não mail()):
   A erehost bloqueia o envio via função mail() do PHP sem
   autenticação ("Saída não autenticada - PHP SCRIPT"). Por isso
   autenticamos na conta contato@noxcozinhas.com.br via SMTP.

   ------------------------------------------------------------
   CONFIG (preencher abaixo). Os dados de SMTP estão no cPanel em:
   "Contas de E-mail" -> contato@ -> "Conectar Dispositivos"
   (procure Servidor de Saída SMTP, Porta e tipo SSL/TLS).
============================================================ */

// ---------------------- CONFIG (edite aqui) ----------------------
$SMTP_HOST   = 'mail.noxcozinhas.com.br';      // servidor de saída (ver cPanel)
$SMTP_PORT   = 465;                            // 465 = SSL  |  587 = TLS
$SMTP_SECURE = 'ssl';                          // 'ssl' p/ porta 465  |  'tls' p/ porta 587
$SMTP_USER   = 'contato@noxcozinhas.com.br';   // usuário = e-mail completo
$SMTP_PASS   = 'COLOQUE_AQUI_A_SENHA_DO_EMAIL';// senha da conta de e-mail

$DESTINO   = 'contato@noxcozinhas.com.br';     // para onde o lead chega
$REMETENTE = 'contato@noxcozinhas.com.br';     // "De" — precisa ser a conta autenticada
$NOME_SITE = 'Site NOX Cozinhas';              // nome exibido como remetente

// Supabase (CRM/painel de leads). A SERVICE ROLE key é segredo:
// deixe vazia aqui e defina o valor real no config.local.php (no servidor).
$SUPABASE_URL         = 'https://SEU-PROJETO.supabase.co';  // Project URL (mesmo projeto do hd360)
$SUPABASE_SERVICE_KEY = '';                                 // service_role key — NUNCA versionar
// -----------------------------------------------------------------

// Credenciais sensíveis vêm de um arquivo que existe SÓ no servidor:
// nunca vai pro Git nem é sobrescrito pelo deploy automático (FTP).
// Crie uma vez no servidor (mesma pasta deste arquivo) o config.local.php:
//   <?php  $SMTP_PASS = 'a_senha_real_do_email';
if (is_file(__DIR__ . '/config.local.php')) {
    require __DIR__ . '/config.local.php';
}

header('Content-Type: application/json; charset=utf-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

// só aceita POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido.']);
    exit;
}

/* Resposta a um envio identificado como spam: registra o motivo no log do
   servidor e FINGE SUCESSO (HTTP 200 ok). Assim o bot não percebe o bloqueio
   e não fica tentando variações. Os bloqueios ficam no error_log do cPanel. */
function bloqueiaSpam($motivo) {
    error_log('NOX form spam bloqueado: ' . $motivo
        . ' | IP '    . ($_SERVER['REMOTE_ADDR'] ?? '?')
        . ' | nome='  . substr((string) ($_POST['nome']  ?? ''), 0, 60)
        . ' | email=' . substr((string) ($_POST['email'] ?? ''), 0, 80));
    echo json_encode(['ok' => true]);
    exit;
}

// honeypot: se o campo oculto vier preenchido, é robô — finge sucesso e ignora
if (!empty($_POST['_gotcha'])) {
    bloqueiaSpam('honeypot preenchido');
}

// time-trap + presença de JS: o formulário real só envia via fetch (JS), que
// carimba em "_t" quantos milissegundos o visitante levou para preencher.
// Bot que posta direto no enviar.php (sem rodar nosso JS) vem SEM o carimbo e
// cai aqui; quem preenche rápido demais (< 3s) também é tratado como robô.
$tempoPreenchimento = isset($_POST['_t']) ? (int) $_POST['_t'] : -1;
if ($tempoPreenchimento < 0) {
    bloqueiaSpam('sem carimbo de tempo (post direto / sem JS)');
}
if ($tempoPreenchimento < 3000) {
    bloqueiaSpam('preenchido rápido demais (' . $tempoPreenchimento . 'ms)');
}

function campo($k) {
    return isset($_POST[$k]) ? trim((string) $_POST[$k]) : '';
}

$nome      = campo('nome');
$empresa   = campo('empresa');
$telefone  = campo('telefone');
$email     = campo('email');
$setor     = campo('setor');
$produto   = campo('produto');
$cidade    = campo('cidade');
$descricao = campo('descricao');

// heurística de conteúdo: links e BBCode num pedido de orçamento B2B são sinal
// forte de spam automatizado (divulgação, SEO, etc). Bloqueia sem alarde.
$conteudo = "$nome $empresa $cidade $descricao";
if (preg_match('~https?://|www\.\S|\[/?(?:url|link)|</?a\b~i', $conteudo)) {
    bloqueiaSpam('link/BBCode no conteúdo');
}

// validação mínima no servidor
if ($nome === '' || ($email === '' && $telefone === '')) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Preencha ao menos o nome e um contato (telefone ou e-mail).']);
    exit;
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'O e-mail informado parece inválido.']);
    exit;
}

// corpo do e-mail (texto puro)
$corpo  = "Nova solicitação de orçamento pelo site:\n\n";
$corpo .= "Nome:               $nome\n";
$corpo .= "Empresa:            $empresa\n";
$corpo .= "Telefone/WhatsApp:  $telefone\n";
$corpo .= "E-mail:             $email\n";
$corpo .= "Setor:              $setor\n";
$corpo .= "Produto/Projeto:    $produto\n";
$corpo .= "Cidade/UF:          $cidade\n\n";
$corpo .= "Descrição:\n" . ($descricao !== '' ? $descricao : '(não informada)') . "\n\n";
$corpo .= "------------------------------------------\n";
$corpo .= "Enviado em " . date('d/m/Y') . " as " . date('H:i') . "\n";

$assunto = 'Orçamento NOX' . ($produto !== '' ? " — $produto" : '') . " — $nome";

/* ------------------------------------------------------------
   Grava o lead no Supabase (painel de leads). Usa a service_role
   key — que ignora o RLS por design. Roda ANTES do e-mail para
   nunca perder o lead, e não bloqueia o envio se falhar.
------------------------------------------------------------ */
function salvarSupabase($url, $key, array $dados) {
    if ($url === '' || $key === '' || strpos($url, 'SEU-PROJETO') !== false || !function_exists('curl_init')) {
        return;
    }
    $ch = curl_init(rtrim($url, '/') . '/rest/v1/leads');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_HTTPHEADER     => [
            'apikey: ' . $key,
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
            'Prefer: return=minimal',
        ],
        CURLOPT_POSTFIELDS     => json_encode($dados, JSON_UNESCAPED_UNICODE),
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($resp === false || $code < 200 || $code >= 300) {
        error_log('NOX Supabase insert falhou (' . $code . '): ' . $resp);
    }
    curl_close($ch);
}

salvarSupabase($SUPABASE_URL, $SUPABASE_SERVICE_KEY, [
    'nome'         => $nome,
    'empresa'      => $empresa,
    'telefone'     => $telefone,
    'email'        => $email,
    'setor'        => $setor,
    'produto'      => $produto,
    'cidade'       => $cidade,
    'descricao'    => $descricao,
    'origem'       => campo('origem'),
    'utm_source'   => campo('utm_source'),
    'utm_medium'   => campo('utm_medium'),
    'utm_campaign' => campo('utm_campaign'),
    'utm_term'     => campo('utm_term'),
    'utm_content'  => campo('utm_content'),
    'gclid'        => campo('gclid'),
    'referrer'     => campo('referrer'),
    'landing_page' => campo('landing_page'),
]);

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = $SMTP_USER;
    $mail->Password   = $SMTP_PASS;
    $mail->SMTPSecure = $SMTP_SECURE; // 'ssl' ou 'tls'
    $mail->Port       = $SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($REMETENTE, $NOME_SITE);
    $mail->addAddress($DESTINO);
    if ($email !== '') {
        $mail->addReplyTo($email, $nome !== '' ? $nome : $email);
    }

    $mail->Subject = $assunto;
    $mail->Body    = $corpo;
    $mail->isHTML(false);

    $mail->send();
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    http_response_code(500);
    // ErrorInfo fica no log do servidor; não expõe detalhe técnico ao visitante
    error_log('NOX form SMTP error: ' . $mail->ErrorInfo);
    echo json_encode(['ok' => false, 'error' => 'Não foi possível enviar agora. Tente novamente ou use o WhatsApp.']);
}
