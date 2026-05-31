<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Categoria;
use Exception;

class CategoriaController extends BaseController
{
    protected string $model = Categoria::class;

    protected const RULES = [
        'nombre'   => ['required'=>true,'type'=>'string','min'=>3,'max'=>50,'regex'=>'/^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/'],
        'impuesto' => ['required'=>true,'type'=>'decimal','precision'=>5,'scale'=>2]
    ];

    protected function beforeCreate(array &$data)
    {
        $data['nombre'] = strtolower(trim($data['nombre']));
        if (Categoria::where('nombre', $data['nombre'])->exists())
            throw new Exception("La categoría ya existe.", 2);
        if ($data['impuesto'] < 0 || $data['impuesto'] > 100)
            throw new Exception("El impuesto debe estar entre 0 y 100.", 2);
    }

    protected function beforeUpdate(array &$data, $model)
    {
        if (isset($data['nombre'])) {
            $data['nombre'] = strtolower(trim($data['nombre']));
            if (Categoria::where('nombre', $data['nombre'])->where('id','!=',$model->id)->exists())
                throw new Exception("El nombre de la categoría ya está en uso.", 2);
        }
        if (isset($data['impuesto']) && ($data['impuesto'] < 0 || $data['impuesto'] > 100))
            throw new Exception("El impuesto debe estar entre 0 y 100.", 2);
    }

    protected function beforeDelete($model)
    {
        if ($model->productos()->exists())
            throw new Exception("No se puede eliminar la categoría porque tiene productos asociados.", 2);
    }
}
