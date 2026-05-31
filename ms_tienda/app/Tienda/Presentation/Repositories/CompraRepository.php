<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\CompraController;

class CompraRepository extends BaseRepository
{
    protected function getController()
    {
        return new CompraController();
    }
}
