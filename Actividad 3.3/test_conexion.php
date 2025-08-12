<?php
include("db/conexion.php");

echo "<h2>🔍 Test de Conexión</h2>";

// Test 1: Conexión
if ($conn->connect_error) {
    echo "❌ Error de conexión: " . $conn->connect_error;
} else {
    echo "✅ Conexión exitosa<br>";
}

// Test 2: Consulta simple
$result = $conn->query("SELECT COUNT(*) as total FROM autos");
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ Total de autos en BD: " . $row['total'] . "<br>";
} else {
    echo "❌ Error en consulta: " . $conn->error . "<br>";
}

// Test 3: Mostrar algunos autos
$result = $conn->query("SELECT * FROM autos LIMIT 5");
if ($result) {
    echo "<h3>📋 Primeros 5 autos:</h3>";
    while ($row = $result->fetch_assoc()) {
        echo "- " . $row['marca'] . " " . $row['modelo'] . " (" . $row['anio'] . ")<br>";
    }
} else {
    echo "❌ Error al obtener autos: " . $conn->error;
}

$conn->close();
?>