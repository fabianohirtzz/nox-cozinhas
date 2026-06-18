<?php
/* ============================================================
   NOX Cozinhas Industriais — Recebe o formulário de orçamento
   e envia o e-mail para a empresa.

   Hospedagem: erehost (cPanel / PHP)   ·   Domínio: noxcozinhas.com.br

   ------------------------------------------------------------
   PRÉ-REQUISITO (fazer no painel da erehost antes de funcionar):
   1. Criar a conta de e-mail  contato@noxcozinhas.com.br  no cPanel
      (na MESMA hospedagem onde o site está). É ela que aparece como
      remetente — usar o e-mail do domínio evita cair em spam.
   2. Garantir que o domínio noxcozinhas.com.br esteja apontado para a
      erehost (DNS/zona na erehost) para SPF/DKIM autenticarem o envio.

   Se algum dia os e-mails caírem em spam, o passo seguinte é trocar
   o mail() abaixo por envio via SMTP autenticado (PHPMailer) usando a
   senha da conta contato@. Deixei marcado onde isso entraria.
============================================================ */

// ---------------------- CONFIG (edite aqui) ----------------------
$DESTINO   = 'contato@noxcozinhas.com.br';   // para onde o lead chega
$REMETENTE = 'contato@noxcozinhas.com.br';   // "De" — precisa ser do domínio
$NOME_SITE = 'Site NOX Cozinhas';            // nome exibido como remetente
// -----------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');

// só aceita POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método não permitido.']);
    exit;
}

// honeypot: se o campo oculto vier preenchido, é robô — finge sucesso e ignora
if (!empty($_POST['_gotcha'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// remove quebras de linha (proteção contra header injection)
function sem_quebras($v) {
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $v));
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

// assunto (codificado em UTF-8 para acentos)
$assunto_txt = 'Orçamento NOX' . ($produto !== '' ? " — $produto" : '') . " — $nome";
$assunto     = '=?UTF-8?B?' . base64_encode($assunto_txt) . '?=';

// cabeçalhos
$headers   = [];
$headers[] = 'From: ' . sem_quebras($NOME_SITE) . ' <' . $REMETENTE . '>';
if ($email !== '') {
    $headers[] = 'Reply-To: ' . sem_quebras($nome) . ' <' . sem_quebras($email) . '>';
} else {
    $headers[] = 'Reply-To: ' . $REMETENTE;
}
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// ---- ENVIO ----
// O 5º parâmetro "-f" define o envelope-sender (ajuda no SPF em alguns servidores).
$ok = @mail($DESTINO, $assunto, $corpo, implode("\r\n", $headers), '-f' . $REMETENTE);

/* ------------------------------------------------------------
   ALTERNATIVA (se mail() cair em spam na erehost): trocar o bloco
   acima por PHPMailer com SMTP autenticado na conta contato@:
     - Host: mail.noxcozinhas.com.br (confirmar no cPanel)
     - Porta: 465 (SSL) ou 587 (TLS)
     - Usuário: contato@noxcozinhas.com.br  ·  Senha: a da conta
------------------------------------------------------------ */

if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Não foi possível enviar agora. Tente novamente em instantes.']);
}
