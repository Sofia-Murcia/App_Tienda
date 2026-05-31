<?php
namespace App\Tienda\Presentation\Repositories;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Exception;

abstract class BaseRepository
{
    abstract protected function getController();

    protected function json(Response $resp, $data, int $status = 200): Response
    {
        $resp->getBody()->write(json_encode($data));
        return $resp->withStatus($status)->withHeader('Content-Type', 'application/json');
    }

    protected function handleError(Response $resp, Exception $ex): Response
    {
        if ($ex->getCode() == 1) return $this->json($resp, ['error' => $ex->getMessage()], 404);
        if ($ex->getCode() >= 2) return $this->json($resp, ['error' => $ex->getMessage()], 400);
        return $this->json($resp, ['error' => 'Error interno del servidor'], 500);
    }

    public function all(Request $req, Response $resp)
    {
        try { return $this->json($resp, $this->getController()->getAll()); }
        catch (Exception $e) { return $this->handleError($resp, $e); }
    }

    public function create(Request $req, Response $resp)
    {
        try {
            $data = json_decode($req->getBody()->getContents(), true);
            if (!$data) throw new Exception("JSON inválido", 3);
            return $this->json($resp, $this->getController()->saveData($data), 201);
        } catch (Exception $e) { return $this->handleError($resp, $e); }
    }

    public function detail(Request $req, Response $resp, $args)
    {
        try { return $this->json($resp, $this->getController()->getOne($args['id'])); }
        catch (Exception $e) { return $this->handleError($resp, $e); }
    }

    public function update(Request $req, Response $resp, $args)
    {
        try {
            $data = json_decode($req->getBody()->getContents(), true);
            if (!$data) throw new Exception("JSON inválido", 3);
            return $this->json($resp, $this->getController()->modify($args['id'], $data));
        } catch (Exception $e) { return $this->handleError($resp, $e); }
    }

    public function delete(Request $req, Response $resp, $args)
    {
        try {
            $this->getController()->remove($args['id']);
            return $this->json($resp, ['msg' => 'Eliminado']);
        } catch (Exception $e) { return $this->handleError($resp, $e); }
    }
}
