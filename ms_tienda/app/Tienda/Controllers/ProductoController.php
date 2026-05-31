<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Producto;
use App\Tienda\Models\Categoria;
use App\Tienda\Models\Proveedor;
use Exception;

class ProductoController extends BaseController
{
    protected string $model = Producto::class;

    protected const RULES = [
        'codigo'       => ['required'=>true,'type'=>'string','min'=>1,'max'=>20,'regex'=>'/^[A-Za-z0-9\-]+$/'],
        'nombre'       => ['required'=>true,'type'=>'string','min'=>3,'max'=>100],
        'peso'         => ['required'=>true,'type'=>'decimal','precision'=>10,'scale'=>2],
        'cantidad'     => ['required'=>true,'type'=>'int','min'=>0],
        'stock_minimo' => ['required'=>true,'type'=>'int','min'=>1],
        'tipo_empaque' => ['required'=>true,'type'=>'enum','values'=>['carton','plastico','vidrio','metal','tela','bolsa','otro']],
        'precio'       => ['required'=>true,'type'=>'decimal','precision'=>10,'scale'=>2],
        'categoria_id' => ['required'=>true,'type'=>'int','min'=>1]
    ];

    public function getAll()
    {
        return Producto::with(['categoria','proveedores'])->get();
    }

    public function getOne($id)
    {
        $row = Producto::with(['categoria','proveedores'])->find($id);
        if (empty($row)) throw new Exception("Producto $id no existe", 1);
        return $row;
    }

    protected function beforeCreate(array &$data)
    {
        $data['codigo'] = strtoupper(trim($data['codigo']));
        $data['nombre'] = trim($data['nombre']);
        if (Producto::where('codigo', $data['codigo'])->exists())
            throw new Exception("El código '{$data['codigo']}' ya está registrado.", 2);
        if (!Categoria::find($data['categoria_id']))
            throw new Exception("La categoría seleccionada no existe.", 2);
    }

    protected function afterCreate($model)
    {
        // Asociar proveedores si vienen en el request
        if (!empty($GLOBALS['_producto_proveedores'])) {
            $model->proveedores()->sync($GLOBALS['_producto_proveedores']);
            unset($GLOBALS['_producto_proveedores']);
        }
    }

    protected function beforeUpdate(array &$data, $model)
    {
        if (isset($data['codigo'])) {
            $data['codigo'] = strtoupper(trim($data['codigo']));
            if (Producto::where('codigo',$data['codigo'])->where('id','!=',$model->id)->exists())
                throw new Exception("El código '{$data['codigo']}' ya está en uso.", 2);
        }
        if (isset($data['nombre'])) $data['nombre'] = trim($data['nombre']);
        if (isset($data['categoria_id']) && !Categoria::find($data['categoria_id']))
            throw new Exception("La categoría seleccionada no existe.", 2);
    }

    protected function beforeDelete($model)
    {
        if ($model->proveedores()->exists())
            throw new Exception("No se puede eliminar el producto porque tiene proveedores asociados.", 2);
        if ($model->detallesVenta()->exists())
            throw new Exception("No se puede eliminar el producto porque tiene ventas asociadas.", 2);
        if ($model->detallesCompra()->exists())
            throw new Exception("No se puede eliminar el producto porque tiene compras asociadas.", 2);
    }

    // Asociar/desasociar proveedores
    public function syncProveedores(int $productoId, array $proveedorIds)
    {
        $producto = $this->getOne($productoId);
        foreach ($proveedorIds as $pvId) {
            if (!Proveedor::find($pvId))
                throw new Exception("El proveedor $pvId no existe.", 2);
        }
        $producto->proveedores()->sync($proveedorIds);
        return $this->getOne($productoId);
    }
}
