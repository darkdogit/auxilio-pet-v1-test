<?php
// Arquivo: public/webhook.php

// --- CONFIGURAÇÕES ---
// URL do seu projeto Supabase
$supabaseUrl = 'https://bctsswiwqjaauxgzwxfa.supabase.co';

// CHAVE SERVICE_ROLE (Secret) - Pegue no Supabase: Project Settings > API > service_role
// CORREÇÃO: Adicionei as aspas '' ao redor da chave abaixo
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdHNzd2l3cWphYXV4Z3p3eGZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4NjgwOCwiZXhwIjoyMDg0MDYyODA4fQ.zcTgtdxtEyGG0QeOTz4Z800Bvry0N4_tLohQq9JKiNg'; 
// ---------------------

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// 1. Recebe o aviso da OnexPay
$input = file_get_contents('php://input');
$json = json_decode($input, true);

// 2. Cria um Log para você ver se está funcionando (Salva em webhook_log.txt)
$logEntry = "[" . date('Y-m-d H:i:s') . "] IP: " . $_SERVER['REMOTE_ADDR'] . "\nTYPE: " . ($json['type'] ?? 'N/A') . "\nPAYLOAD: " . $input . "\n----------------\n";
file_put_contents('webhook_log.txt', $logEntry, FILE_APPEND);

// 3. Valida se tem dados
if (!$json || !isset($json['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Sem dados']);
    exit;
}

// 4. Verifica se é uma transação
$type = $json['type'] ?? '';
if ($type !== 'transaction') {
    echo json_encode(['message' => 'Ignorado (Nao eh transacao)']);
    exit;
}

// 5. Pega os dados importantes
$data = $json['data'];
$statusOnex = $data['status'] ?? 'unknown'; // paid, pending, etc
$emailCliente = $data['customer']['email'] ?? null;
$idTransacao = $data['id'] ?? null;

// Traduz o status da OnexPay para o nosso banco
$statusDb = 'pending';
if ($statusOnex === 'paid' || $statusOnex === 'approved' || $statusOnex === 'succeeded') {
    $statusDb = 'paid';
} elseif ($statusOnex === 'refused' || $statusOnex === 'failed') {
    $statusDb = 'failed';
}

// 6. Atualiza o Supabase (Se tiver email)
if ($emailCliente) {
    // Monta a URL para atualizar o usuário que tem esse email
    $url = $supabaseUrl . '/rest/v1/registrations?email=eq.' . urlencode($emailCliente);

    $updateData = json_encode([
        'payment_status' => $statusDb,
        'payment_id' => (string)$idTransacao,
        'payment_data' => $json // Salva o JSON completo por segurança
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $updateData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey,
        'Content-Type: application/json',
        'Prefer: return=minimal'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        http_response_code(200);
        echo json_encode(['success' => true, 'status_updated_to' => $statusDb]);
    } else {
        http_response_code(500);
        file_put_contents('webhook_log.txt', "ERRO SUPABASE: $httpCode - $response\n", FILE_APPEND);
        echo json_encode(['error' => 'Erro ao atualizar banco']);
    }
} else {
    echo json_encode(['message' => 'Email nao encontrado no JSON']);
}
?>