<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\ReporteController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Exception;

class ReporteRepository extends BaseRepository
{
    protected function getController() { return new ReporteController(); }

    public function ingresos(Request $req, Response $resp): Response
    {
        return $this->json($resp, $this->getController()->ingresosTotales());
    }

    public function gastos(Request $req, Response $resp): Response
    {
        return $this->json($resp, $this->getController()->gastosTotales());
    }

    public function stockBajo(Request $req, Response $resp): Response
    {
        return $this->json($resp, $this->getController()->stockBajo());
    }

    public function topCompradores(Request $req, Response $resp): Response
    {
        return $this->json($resp, $this->getController()->clientesTopCompradores());
    }

    public function unaCompra(Request $req, Response $resp): Response
    {
        return $this->json($resp, $this->getController()->clientesUnaCompra());
    }

    public function masFrecuente(Request $req, Response $resp): Response
    {
        return $this->json($resp, $this->getController()->clienteMasFrecuente());
    }

    public function resumenVenta(Request $req, Response $resp, $args): Response
    {
        try {
            return $this->json($resp, $this->getController()->resumenVenta($args['id']));
        } catch (Exception $e) { return $this->handleError($resp, $e); }
    }
}
