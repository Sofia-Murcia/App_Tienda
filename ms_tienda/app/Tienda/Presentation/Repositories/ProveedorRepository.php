<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\ProveedorController;

class ProveedorRepository extends BaseRepository
{
    protected function getController()
    {
        return new ProveedorController();
    }
}
