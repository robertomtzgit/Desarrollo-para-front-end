<?php
include("../db/conexion.php");
header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido");
    }

    $id = (int)$_POST['id'];
    $marca = trim($_POST['marca']);
    $modelo = trim($_POST['modelo']);
    $anio = (int)$_POST['anio'];
    $color = trim($_POST['color']);
    $precio = (float)$_POST['precio'];
    $combustible = trim($_POST['combustible']);
    $transmision = trim($_POST['transmision']);
    $estado = trim($_POST['estado']);
    $kilometraje = (int)$_POST['kilometraje'];
    $version = trim($_POST['version']);

    if ($id <= 0 || empty($marca) || empty($modelo) || $anio <= 0 || $precio <= 0) {
        throw new Exception("Datos incompletos");
    }

    $query = "UPDATE autos SET marca=?, modelo=?, anio=?, color=?, precio=?, combustible=?, transmision=?, estado=?, kilometraje=?, version=? WHERE id=?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssisssssssi", $marca, $modelo, $anio, $color, $precio, $combustible, $transmision, $estado, $kilometraje, $version, $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Auto actualizado exitosamente"
        ]);
    } else {
        throw new Exception("Error al actualizar");
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
