<?php
$allowed_origins = [
    "https://esattendance.netlify.app",
    "http://192.168.0.100:5173",
    "http://localhost:5173"
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ---- DB CONFIG ----
$host = "localhost";
$port = 3306;
$user = "gb";
$password = "GaneshBiz123$";
$dbname = "eyespace";

// ---- CONNECT ----
$conn = new mysqli($host, $user, $password, $dbname, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

// ---- FUNCTIONS ----
function loginDetails($conn, $emp_id, $pass) {
    $stmt = $conn->prepare("CALL `attendance_login`(?, ?)");
    if (!$stmt) {
        return ["error" => $conn->error];
    }

    $stmt->bind_param("is", $emp_id, $pass);

    if (!$stmt->execute()) {
        $error = $stmt->error;
        $stmt->close();
        return ["error" => $error];
    }

    $result = $stmt->get_result();
    $rows = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    $stmt->close();

    return $rows[0] ?? ["error" => "No data"];
}

function claimDevice($conn, $emp_id) {
    // Update query instead of stored procedure
    $emp_id = intval($emp_id); // sanitize
    $sql = "UPDATE emp_master SET device_claimed = 'Y' WHERE emp_id = $emp_id";

    if ($conn->query($sql) === TRUE) {
        // Fetch updated row to return status + maybe token
        $res = $conn->query("SELECT emp_id, device_claimed, token FROM emp_master WHERE emp_id = $emp_id LIMIT 1");
        $row = $res ? $res->fetch_assoc() : null;
        return $row ?: ["error" => "No record found"];
    } else {
        return ["error" => $conn->error];
    }
}

// ---- ROUTER ----
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "POST") {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'login':
            $emp_id = intval($_POST['emp_id'] ?? 0);
            $pass = $_POST['pass'] ?? '';
            $data = loginDetails($conn, $emp_id, $pass);
            break;

        case 'claimDevice':
            $emp_id = intval($_POST['emp_id'] ?? 0);
            $data = claimDevice($conn, $emp_id);
            break;

        default:
            $data = ["error" => "Invalid POST action"];
    }

    echo json_encode($data, JSON_PRETTY_PRINT);

} elseif ($method === "GET") {
    echo json_encode(["message" => "API is alive"], JSON_PRETTY_PRINT);

} elseif ($method === "OPTIONS") {
    http_response_code(200);
}

$conn->close();
?>
