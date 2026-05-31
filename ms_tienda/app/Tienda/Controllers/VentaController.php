<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Venta;
use App\Tienda\Models\DetalleVenta;
use App\Tienda\Models\Cliente;
use App\Tienda\Models\Producto;
use App\Tienda\Core\Validation\Validator;
use Exception;
use Illuminate\Database\Capsule\Manager as DB;

class VentaController extends BaseController
{
    protected string $model = Venta::class;

    protected const RULES = [
        'cliente_id' => ['required'=>true,'type'=>'int','min'=>1],
        'fecha'      => ['required'=>true,'type'=>'datetime']
    ];

    public function getAll()
    {
        return Venta::with(['cliente','detalles.producto.categoria'])->get();
    }

    public function getOne($id)
    {
        $row = Venta::with(['cliente','detalles.producto.categoria'])->find($id);
        if (empty($row)) throw new Exception("Venta $id no existe", 1);
        return $row;
    }

    public function saveData($data)
    {
        Validator::validate($data, static::RULES);
        $this->beforeCreate($data);

        return DB::transaction(function () use ($data) {
            $subtotal       = 0;
            $impuesto_total = 0;
            $calculados     = [];

            foreach ($data['detalles'] as $detalle) {
                $producto = Producto::with('categoria')->find($detalle['producto_id']);
                $cantidad = (int) $detalle['cantidad'];
                $precio   = (float) $producto->precio;
                $impuesto = (float) $producto->categoria->impuesto;

                $sub      = $cantidad * $precio;
                $iva      = $sub * ($impuesto / 100);
                $subtotal        += $sub;
                $impuesto_total  += $iva;

                $calculados[] = [
                    'producto'            => $producto,
                    'cantidad'            => $cantidad,
                    'precio_unitario'     => $precio,
                    'impuesto_porcentaje' => $impuesto
                ];
            }

            $venta = new Venta();
            $venta->cliente_id     = $data['cliente_id'];
            $venta->fecha          = $data['fecha'];
            $venta->subtotal       = round($subtotal, 2);
            $venta->impuesto_total = round($impuesto_total, 2);
            $venta->total          = round($subtotal + $impuesto_total, 2);
            $venta->save();

            foreach ($calculados as $item) {
                $dv = new DetalleVenta();
                $dv->venta_id            = $venta->id;
                $dv->producto_id         = $item['producto']->id;
                $dv->cantidad            = $item['cantidad'];
                $dv->precio_unitario     = $item['precio_unitario'];
                $dv->impuesto_porcentaje = $item['impuesto_porcentaje'];
                $dv->save();

                $item['producto']->cantidad -= $item['cantidad'];
                $item['producto']->save();
            }

            return $this->getOne($venta->id);
        });
    }

    protected function beforeCreate(array &$data)
    {
        if (!Cliente::find($data['cliente_id']))
            throw new Exception("El cliente no existe.", 2);

        if (empty($data['detalles']) || !is_array($data['detalles']))
            throw new Exception("Debes enviar al menos un detalle de venta.", 2);

        $ids = array_column($data['detalles'], 'producto_id');
        if (count($ids) !== count(array_unique($ids)))
            throw new Exception("No puedes incluir el mismo producto dos veces en una venta.", 2);

        foreach ($data['detalles'] as $i => $d) {
            $n = $i + 1;
            if (empty($d['producto_id']))
                throw new Exception("El producto en el detalle $n es obligatorio.", 2);
            $producto = Producto::find($d['producto_id']);
            if (!$producto)
                throw new Exception("El producto en el detalle $n no existe.", 2);
            if (empty($d['cantidad']) || (int) $d['cantidad'] <= 0)
                throw new Exception("La cantidad en el detalle $n debe ser mayor que 0.", 2);
            if ((int) $d['cantidad'] > $producto->cantidad)
                throw new Exception(
                    "Stock insuficiente para '{$producto->nombre}'. Disponible: {$producto->cantidad}, solicitado: {$d['cantidad']}.", 2
                );
        }
    }

    public function modify($id, $data) { throw new Exception("Modificar ventas no está permitido.", 2); }
    public function remove($id)        { throw new Exception("Eliminar ventas no está permitido.", 2); }
}
