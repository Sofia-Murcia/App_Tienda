<?php
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => '127.0.0.1',
    'database'  => 'tienda_db',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();
try {
    $capsule->getConnection()->getPdo();
} catch (\PDOException $e) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(["error" => "No se pudo conectar a la base de datos. Verifica que MySQL esté activo."]);
    exit;
}
