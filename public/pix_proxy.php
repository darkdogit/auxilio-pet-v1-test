<?php
// public/pix_proxy.php

// 1. Configurações de CORS (Permite seu site React falar com este arquivo)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Se for pré-voo (OPTIONS), retorna OK e para.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Captura os dados enviados pelo seu React (O corpo do JSON)
$inputJSON = file_get_contents('php://input');

// 3. Configurações da OnexPay (Exatamente como no seu cURL)
$url = 'https://api.onexpay.com.br/v1/transactions';
$authorization = 'Basic c2tfbGl2ZV92MlViNExBUUZTTUJNOE81RzRHd09pZkVxWlpGUUpZdWtxTmo3cXFkTHM6eA==';

// 4. Inicia o cURL (Simula o comando que você mandou)
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_POST, 1);            // -X POST
curl_setopt($ch, CURLOPT_POSTFIELDS, $inputJSON); // -d '{...}'
curl_setopt($ch, CURLOPT_HTTPHEADER, [        // -H "..."
    'Authorization: ' . $authorization,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// ⚠️ Importante para Hostinger: Ignora verificação rigorosa de SSL para evitar erro de certificado no servidor compartilhado
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// 5. Executa
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Se o cURL falhar internamente (ex: servidor sem internet)
if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno no cURL: ' . curl_error($ch)]);
} else {
    // 6. Devolve a resposta exata da OnexPay para o seu site
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>