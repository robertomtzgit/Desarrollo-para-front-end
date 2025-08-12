-- 🦇 Script de Base de Datos para Sistema de Gestión de Autos
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS autos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autos_db;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS autos;

-- Crear tabla de autos con campos mejorados
CREATE TABLE autos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    color VARCHAR(30) NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    combustible ENUM('Gasolina', 'Diesel', 'Híbrido', 'Eléctrico') NOT NULL DEFAULT 'Gasolina',
    transmision ENUM('Manual', 'Automática', 'CVT') DEFAULT 'Manual',
    estado ENUM('Nuevo', 'Usado', 'Seminuevo') DEFAULT 'Usado',
    kilometraje INT DEFAULT 0,
    version VARCHAR(100) DEFAULT '',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejorar rendimiento
    INDEX idx_marca (marca),
    INDEX idx_modelo (modelo),
    INDEX idx_anio (anio),
    INDEX idx_precio (precio),
    INDEX idx_estado (estado),
    INDEX idx_combustible (combustible)
);

-- Insertar datos de ejemplo mejorados
INSERT INTO autos (marca, modelo, anio, color, precio, combustible, transmision, estado, kilometraje, version) VALUES
-- Autos nuevos
('Toyota', 'Corolla', 2023, 'Blanco', 285000.00, 'Gasolina', 'Automática', 'Nuevo', 0, 'XEI 1.8L CVT'),
('Honda', 'Civic', 2023, 'Negro', 320000.00, 'Gasolina', 'CVT', 'Nuevo', 0, 'EX 1.5L Turbo'),
('Nissan', 'Sentra', 2023, 'Plata', 275000.00, 'Gasolina', 'CVT', 'Nuevo', 0, 'Advance 1.6L'),
('Volkswagen', 'Jetta', 2023, 'Rojo', 365000.00, 'Gasolina', 'Automática', 'Nuevo', 0, 'Highline 1.4L TSI'),
('Mazda', 'Mazda3', 2023, 'Azul', 340000.00, 'Gasolina', 'Automática', 'Nuevo', 0, 'Grand Touring 2.5L'),

-- Autos seminuevos
('Hyundai', 'Elantra', 2022, 'Gris', 260000.00, 'Gasolina', 'Manual', 'Seminuevo', 8000, 'GLS 1.6L'),
('Kia', 'Forte', 2022, 'Blanco', 295000.00, 'Gasolina', 'CVT', 'Seminuevo', 12000, 'EX 2.0L'),
('Ford', 'Focus', 2022, 'Azul', 310000.00, 'Gasolina', 'Manual', 'Seminuevo', 18000, 'Titanium 2.0L'),
('Chevrolet', 'Cruze', 2022, 'Negro', 245000.00, 'Gasolina', 'Automática', 'Seminuevo', 15000, 'LT 1.4L Turbo'),
('Seat', 'Leon', 2022, 'Rojo', 355000.00, 'Gasolina', 'Manual', 'Seminuevo', 9000, 'FR 1.4L TSI'),

-- Autos usados
('Renault', 'Fluence', 2021, 'Plata', 235000.00, 'Gasolina', 'CVT', 'Usado', 38000, 'Dynamique 1.6L'),
('Peugeot', '408', 2020, 'Gris', 285000.00, 'Gasolina', 'Automática', 'Usado', 45000, 'Allure 1.6L THP'),
('Fiat', 'Tipo', 2021, 'Blanco', 220000.00, 'Gasolina', 'Manual', 'Usado', 32000, 'Easy 1.4L'),
('Suzuki', 'Ciaz', 2020, 'Azul', 195000.00, 'Gasolina', 'Manual', 'Usado', 55000, 'GL 1.4L'),
('Mitsubishi', 'Lancer', 2019, 'Negro', 210000.00, 'Gasolina', 'CVT', 'Usado', 62000, 'ES 1.6L'),

-- Autos premium y híbridos/eléctricos
('Audi', 'A3', 2023, 'Negro', 485000.00, 'Gasolina', 'Automática', 'Nuevo', 0, 'Sedan 1.4L TFSI'),
('BMW', 'Serie 3', 2022, 'Gris', 650000.00, 'Gasolina', 'Automática', 'Seminuevo', 9000, '320i 2.0L Twin Turbo'),
('Mercedes-Benz', 'Clase C', 2021, 'Plata', 720000.00, 'Gasolina', 'Automática', 'Usado', 25000, 'C200 1.5L Turbo'),
('Tesla', 'Model 3', 2023, 'Blanco', 890000.00, 'Eléctrico', 'Automática', 'Nuevo', 0, 'Standard Range Plus'),
('Toyota', 'Prius', 2022, 'Azul', 420000.00, 'Híbrido', 'CVT', 'Seminuevo', 15000, 'Premium 1.8L Hybrid'),
('Honda', 'Insight', 2021, 'Plata', 380000.00, 'Híbrido', 'CVT', 'Usado', 28000, 'EX 1.5L Hybrid'),
('Nissan', 'Leaf', 2023, 'Blanco', 520000.00, 'Eléctrico', 'Automática', 'Nuevo', 0, 'SV Plus 62kWh'),
('Hyundai', 'Ioniq', 2022, 'Negro', 395000.00, 'Híbrido', 'Automática', 'Seminuevo', 11000, 'Limited 1.6L Hybrid'),

-- Autos deportivos y de lujo
('Subaru', 'WRX', 2023, 'Azul', 485000.00, 'Gasolina', 'Manual', 'Nuevo', 0, 'STI 2.5L Turbo'),
('Volkswagen', 'Golf GTI', 2022, 'Rojo', 425000.00, 'Gasolina', 'Manual', 'Seminuevo', 8500, 'Performance 2.0L TSI');

