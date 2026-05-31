<?php
namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\CategoriaController;

class CategoriaRepository extends BaseRepository
{
    protected function getController()
    {
        return new CategoriaController();
    }
}
