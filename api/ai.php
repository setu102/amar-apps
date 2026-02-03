
<?php
/**
 * রাজবাড়ী জেলা তথ্য সেবা - সিকিউর এআই প্রক্সি (PHP Version)
 * cPanel বা Shared Hosting-এ ব্যবহারের জন্য।
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- কনফিগারেশন ---
// এখানে আপনার জেমিনি এপিআই কী-টি বসান। 
// সিকিউরিটির জন্য এটি শুধুমাত্র আপনার হোস্টিং ফাইলে থাকবে।
$apiKey = getenv('GEMINI_API_KEY') ?: getenv('API_KEY') ?: "YOUR_ACTUAL_GEMINI_API_KEY_HERE"; 
$modelName = getenv('GEMINI_MODEL') ?: "gemini-3-flash-preview";
// -----------------

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'সার্ভারে কোনো ডাটা পৌঁছায়নি।']]);
    exit;
}

if (empty($input['contents']) || !is_array($input['contents'])) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'Invalid request: contents array is required.']]);
    exit;
}

if ($apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
    http_response_code(500);
    echo json_encode(['error' => ['message' => 'Server Configuration Error: GEMINI_API_KEY is missing.']]);
    exit;
}

$url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key=" . $apiKey;

$payload = [
    "contents" => $input['contents'],
    "tools" => !empty($input['tools']) ? $input['tools'] : [["googleSearch" => (object)[]]]
];

$systemInstruction = $input['systemInstruction'] ?? $input['system_instruction'] ?? null;
if (!empty($systemInstruction)) {
    $payload['systemInstruction'] = [
        "role" => "system",
        "parts" => [["text" => $systemInstruction]]
    ];
}

if (!empty($input['responseSchema'])) {
    $payload['responseSchema'] = $input['responseSchema'];
}

if (!empty($input['responseMimeType'])) {
    $payload['responseMimeType'] = $input['responseMimeType'];
}

$jsonData = json_encode($payload);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch) || $httpCode != 200) {
    // Fallback logic
    $options = [
        'http' => [
            'method'  => 'POST',
            'header'  => 'Content-Type: application/json',
            'content' => $jsonData,
            'ignore_errors' => true
        ]
    ];
    $context  = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
}

echo $response;
curl_close($ch);
?>
