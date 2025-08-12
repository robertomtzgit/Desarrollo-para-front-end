<?php
include("../db/conexion.php");
header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido");
    }

    $id = (int)$_POST['id'];

    if ($id <= 0) {
        throw new Exception("ID inválido");
    }

    $query = "DELETE FROM autos WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Auto eliminado exitosamente"
        ]);
    } else {
        throw new Exception("Error al eliminar");
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
