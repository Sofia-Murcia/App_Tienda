<?php
use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Tienda\Presentation\Repositories\CategoriaRepository;
use App\Tienda\Presentation\Repositories\ProductoRepository;
use App\Tienda\Presentation\Repositories\ClienteRepository;
use App\Tienda\Presentation\Repositories\ProveedorRepository;
use App\Tienda\Presentation\Repositories\CompraRepository;
use App\Tienda\Presentation\Repositories\VentaRepository;
use App\Tienda\Presentation\Repositories\ReporteRepository;

return function (App $app) {

    $app->group('/categorias', function (RouteCollectorProxy $g) {
        $g->get('',      [CategoriaRepository::class, 'all']);
        $g->get('/{id}', [CategoriaRepository::class, 'detail']);
        $g->post('',     [CategoriaRepository::class, 'create']);
        $g->put('/{id}', [CategoriaRepository::class, 'update']);
        $g->delete('/{id}', [CategoriaRepository::class, 'delete']);
    });

    $app->group('/productos', function (RouteCollectorProxy $g) {
        $g->get('',              [ProductoRepository::class, 'all']);
        $g->get('/{id}',         [ProductoRepository::class, 'detail']);
        $g->post('',             [ProductoRepository::class, 'create']);
        $g->put('/{id}',         [ProductoRepository::class, 'update']);
        $g->delete('/{id}',      [ProductoRepository::class, 'delete']);
        $g->put('/{id}/proveedores', [ProductoRepository::class, 'syncProveedores']);
    });

    $app->group('/clientes', function (RouteCollectorProxy $g) {
        $g->get('',      [ClienteRepository::class, 'all']);
        $g->get('/{id}', [ClienteRepository::class, 'detail']);
        $g->post('',     [ClienteRepository::class, 'create']);
        $g->put('/{id}', [ClienteRepository::class, 'update']);
        $g->delete('/{id}', [ClienteRepository::class, 'delete']);
    });

    $app->group('/proveedores', function (RouteCollectorProxy $g) {
        $g->get('',      [ProveedorRepository::class, 'all']);
        $g->get('/{id}', [ProveedorRepository::class, 'detail']);
        $g->post('',     [ProveedorRepository::class, 'create']);
        $g->put('/{id}', [ProveedorRepository::class, 'update']);
        $g->delete('/{id}', [ProveedorRepository::class, 'delete']);
    });

    $app->group('/compras', function (RouteCollectorProxy $g) {
        $g->get('',      [CompraRepository::class, 'all']);
        $g->get('/{id}', [CompraRepository::class, 'detail']);
        $g->post('',     [CompraRepository::class, 'create']);
    });

    $app->group('/ventas', function (RouteCollectorProxy $g) {
        $g->get('',      [VentaRepository::class, 'all']);
        $g->get('/{id}', [VentaRepository::class, 'detail']);
        $g->post('',     [VentaRepository::class, 'create']);
    });

    $app->group('/reportes', function (RouteCollectorProxy $g) {
        $g->get('/ingresos',             [ReporteRepository::class, 'ingresos']);
        $g->get('/gastos',               [ReporteRepository::class, 'gastos']);
        $g->get('/stock-bajo',           [ReporteRepository::class, 'stockBajo']);
        $g->get('/top-compradores',      [ReporteRepository::class, 'topCompradores']);
        $g->get('/una-compra',           [ReporteRepository::class, 'unaCompra']);
        $g->get('/mas-frecuente',        [ReporteRepository::class, 'masFrecuente']);
        $g->get('/ventas/{id}/resumen',  [ReporteRepository::class, 'resumenVenta']);
    });
};
