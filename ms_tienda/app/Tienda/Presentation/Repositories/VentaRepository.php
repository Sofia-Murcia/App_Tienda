<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\VentaController;

class VentaRepository extends BaseRepository
{
    protected function getController()
    {
        return new VentaController();
    }
}
