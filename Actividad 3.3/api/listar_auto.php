<?php
include("../db/conexion.php");

// Headers
header('Content-Type: application/json; charset=utf-8');

try {
    // Parámetros
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $orderBy = isset($_GET['orderBy']) ? $_GET['orderBy'] : 'id';
    $orderDir = isset($_GET['orderDir']) ? $_GET['orderDir'] : 'ASC';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    // Validar orderBy para seguridad
    $allowedFields = ['id', 'marca', 'modelo', 'anio', 'color', 'precio', 'combustible', 'transmision', 'estado', 'kilometraje'];
    if (!in_array($orderBy, $allowedFields)) {
        $orderBy = 'id';
    }

    // Validar orderDir
    if (!in_array(strtoupper($orderDir), ['ASC', 'DESC'])) {
        $orderDir = 'ASC';
    }

    $offset = ($page - 1) * $limit;

    // Construir WHERE
    $where = "1=1";
    
    if ($id) {
        $where .= " AND id = " . (int)$id;
    }
    
    if (!empty($search)) {
        $searchEscaped = $conn->real_escape_string($search);
        $where .= " AND (
            marca LIKE '%$searchEscaped%' OR 
            modelo LIKE '%$searchEscaped%' OR 
            color LIKE '%$searchEscaped%' OR 
            combustible LIKE '%$searchEscaped%' OR 
            anio LIKE '%$searchEscaped%'
        )";
    }

    // Contar total
    $countQuery = "SELECT COUNT(*) as total FROM autos WHERE $where";
    $countResult = $conn->query($countQuery);
    $total = $countResult->fetch_assoc()['total'];

    // Obtener datos
    $query = "SELECT * FROM autos WHERE $where ORDER BY $orderBy $orderDir LIMIT $limit OFFSET $offset";
    $result = $conn->query($query);

    $autos = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $autos[] = $row;
        }
    }

    // Respuesta
    echo json_encode([
        "success" => true,
        "total" => (int)$total,
        "data" => $autos
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => []
    ]);
}

$conn->close();
?>
