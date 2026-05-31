<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Proveedor;
use Exception;

class ProveedorController extends BaseController
{
    protected string $model = Proveedor::class;

    protected const RULES = [
        'nombre'   => ['required'=>true,'type'=>'string','min'=>3,'max'=>100,'regex'=>'/^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/'],
        'telefono' => ['required'=>true,'type'=>'string','min'=>7,'max'=>20,'regex'=>'/^[0-9]+$/'],
        'ciudad'   => ['required'=>true,'type'=>'string','min'=>3,'max'=>50,'regex'=>'/^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/']
    ];

    protected function beforeCreate(array &$data)
    {
        $data['nombre']   = trim($data['nombre']);
        $data['telefono'] = trim($data['telefono']);
        $data['ciudad']   = trim($data['ciudad']);
    }

    protected function beforeUpdate(array &$data, $model)
    {
        if (isset($data['nombre']))   $data['nombre']   = trim($data['nombre']);
        if (isset($data['telefono'])) $data['telefono'] = trim($data['telefono']);
        if (isset($data['ciudad']))   $data['ciudad']   = trim($data['ciudad']);
    }

    protected function beforeDelete($model)
    {
        if ($model->productos()->exists())
            throw new Exception("No se puede eliminar el proveedor porque tiene productos asociados.", 2);
        if ($model->compras()->exists())
            throw new Exception("No se puede eliminar el proveedor porque tiene compras asociadas.", 2);
    }
}
