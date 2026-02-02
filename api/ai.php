
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
$apiKey = getenv('API_KEY') ?: "YOUR_ACTUAL_GEMINI_API_KEY_HERE"; 
$modelName = "gemini-3-flash-preview";
// -----------------

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(['error' => ['message' => 'সার্ভারে কোনো ডাটা পৌঁছায়নি।']]);
    exit;
}

$url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key=" . $apiKey;

$payload = [
    "contents" => $input['contents'] ?? [],
    "tools" => [["googleSearch" => (object)[]]]
];

if (isset($input['system_instruction'])) {
    $payload['systemInstruction'] = [
        "role" => "system",
        "parts" => [["text" => $input['system_instruction']]]
    ];
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
