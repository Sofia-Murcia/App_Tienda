<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Compra;
use App\Tienda\Models\DetalleCompra;
use App\Tienda\Models\Proveedor;
use App\Tienda\Models\Producto;
use App\Tienda\Core\Validation\Validator;
use Exception;
use Illuminate\Database\Capsule\Manager as DB;

class CompraController extends BaseController
{
    protected string $model = Compra::class;

    protected const RULES = [
        'proveedor_id' => ['required'=>true,'type'=>'int','min'=>1],
        'fecha'        => ['required'=>true,'type'=>'datetime']
    ];

    public function getAll()
    {
        return Compra::with(['proveedor','detalles.producto'])->get();
    }

    public function getOne($id)
    {
        $row = Compra::with(['proveedor','detalles.producto'])->find($id);
        if (empty($row)) throw new Exception("Compra $id no existe", 1);
        return $row;
    }

    public function saveData($data)
    {
        Validator::validate($data, static::RULES);
        $this->beforeCreate($data);

        return DB::transaction(function () use ($data) {
            $compra = new Compra();
            $compra->proveedor_id = $data['proveedor_id'];
            $compra->fecha        = $data['fecha'];
            $compra->total        = 0;
            $compra->save();

            $total = 0;
            foreach ($data['detalles'] as $d) {
                $producto = Producto::find($d['producto_id']);
                $cantidad = (int)   $d['cantidad'];
                $costo    = (float) $d['costo_unitario'];

                $dc = new DetalleCompra();
                $dc->compra_id    = $compra->id;
                $dc->producto_id  = $producto->id;
                $dc->cantidad     = $cantidad;
                $dc->costo_unitario = $costo;
                $dc->save();

                $producto->cantidad += $cantidad;
                $producto->save();

                $total += $cantidad * $costo;
            }

            $compra->total = $total;
            $compra->save();

            return $this->getOne($compra->id);
        });
    }

    protected function beforeCreate(array &$data)
    {
        if (!Proveedor::find($data['proveedor_id']))
            throw new Exception("El proveedor no existe.", 2);

        if (empty($data['detalles']) || !is_array($data['detalles']))
            throw new Exception("Debes enviar al menos un detalle de compra.", 2);

        $ids = array_column($data['detalles'], 'producto_id');
        if (count($ids) !== count(array_unique($ids)))
            throw new Exception("No puedes incluir el mismo producto dos veces en una compra.", 2);

        foreach ($data['detalles'] as $i => $d) {
            $n = $i + 1;
            if (empty($d['producto_id']))
                throw new Exception("El producto en el detalle $n es obligatorio.", 2);
            if (!Producto::find($d['producto_id']))
                throw new Exception("El producto en el detalle $n no existe.", 2);
            if (empty($d['cantidad']) || (int) $d['cantidad'] <= 0)
                throw new Exception("La cantidad en el detalle $n debe ser mayor que 0.", 2);
            if (empty($d['costo_unitario']) || (float) $d['costo_unitario'] <= 0)
                throw new Exception("El costo unitario en el detalle $n debe ser mayor que 0.", 2);
        }
    }

    public function modify($id, $data) { throw new Exception("Modificar compras no está permitido.", 2); }
    public function remove($id)        { throw new Exception("Eliminar compras no está permitido.", 2); }
}
