<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\ClienteController;

class ClienteRepository extends BaseRepository
{
    protected function getController()
    {
        return new ClienteController();
    }
}
