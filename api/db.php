<?php
/**
 * Rajbari Dist Info - Global Database API
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- DATABASE CONFIGURATION ---
$host = "localhost";
$port = "5432";
$dbname = "আপনার_ডাটাবেজ_নাম";
$user = "আপনার_ইউজার_নাম";
$password = "আপনার_পাসওয়ার্ড";
// ------------------------------

try {
    if ($dbname === "আপনার_ডাটাবেজ_নাম") {
        throw new Exception("DATABASE_NOT_CONFIGURED: Please edit api/db.php and provide your actual cPanel database credentials.");
    }

    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $conn = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10
    ]);

    $conn->exec("CREATE TABLE IF NOT EXISTS rajbari_items (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "DATABASE_CONNECTION_FAILED",
        "details" => $e->getMessage()
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $category = $_GET['category'] ?? '';
    if (empty($category)) {
        echo json_encode(["status" => "online", "message" => "API is working", "time" => date('Y-m-d H:i:s')]);
        exit;
    }
    
    $stmt = $conn->prepare("SELECT * FROM rajbari_items WHERE category = ? ORDER BY id DESC");
    $stmt->execute([$category]);
    $results = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $item = json_decode($row['content'], true);
        $item['id'] = (string)$row['id'];
        $item['global_sync'] = true;
        $results[] = $item;
    }
    echo json_encode($results);
} 
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if(isset($input['category']) && isset($input['content'])) {
        $stmt = $conn->prepare("INSERT INTO rajbari_items (category, content) VALUES (?, ?)");
        $stmt->execute([$input['category'], json_encode($input['content'])]);
        echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
    } else {
        echo json_encode(["success" => false, "error" => "Invalid Input"]);
    }
} 
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if($id) {
        $stmt = $conn->prepare("DELETE FROM rajbari_items WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    }
}
?>