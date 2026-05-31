<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\ProductoController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Exception;

class ProductoRepository extends BaseRepository
{
    protected function getController()
    {
        return new ProductoController();
    }

    public function syncProveedores(Request $req, Response $resp, $args)
    {
        try {
            $data = json_decode($req->getBody()->getContents(), true);
            if (!isset($data['proveedor_ids']) || !is_array($data['proveedor_ids']))
                throw new Exception("Se requiere 'proveedor_ids' como arreglo.", 3);
            return $this->json($resp,
                $this->getController()->syncProveedores((int)$args['id'], $data['proveedor_ids'])
            );
        } catch (Exception $e) { return $this->handleError($resp, $e); }
    }
}
