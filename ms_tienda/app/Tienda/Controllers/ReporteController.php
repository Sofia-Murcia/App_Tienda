<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Venta;
use App\Tienda\Models\Compra;
use App\Tienda\Models\Producto;
use App\Tienda\Models\Cliente;

class ReporteController
{
    // 1. Ingresos totales por ventas
    public function ingresosTotales()
    {
        return ['total_ingresos' => Venta::sum('total')];
    }

    // 2. Gastos totales por compras a proveedores
    public function gastosTotales()
    {
        return ['total_gastos' => Compra::sum('total')];
    }

    // 3. Productos con stock bajo mínimo
    public function stockBajo()
    {
        return Producto::with('categoria')
            ->whereColumn('cantidad', '<', 'stock_minimo')
            ->get();
    }

    // 4. Clientes con mayor número de compras (ordenados)
    public function clientesTopCompradores()
    {
        return Cliente::withCount('ventas')
            ->withSum('ventas', 'total')
            ->having('ventas_count', '>', 0)
            ->orderByDesc('ventas_count')
            ->get();
    }

    // 5. Clientes que solo han comprado una vez
    public function clientesUnaCompra()
    {
        return Cliente::withCount('ventas')
            ->having('ventas_count', '=', 1)
            ->get();
    }

    // 6. Cliente más frecuente
    public function clienteMasFrecuente()
    {
        return Cliente::withCount('ventas')
            ->having('ventas_count', '>', 0)
            ->orderByDesc('ventas_count')
            ->first();
    }

    // 7. Resumen / factura de una venta
    public function resumenVenta($id)
    {
        $venta = Venta::with(['cliente', 'detalles.producto.categoria'])->find($id);
        if (!$venta) throw new \Exception("Venta $id no existe", 1);

        return [
            'id'     => $venta->id,
            'fecha'  => $venta->fecha,
            'cliente'  => $venta->cliente->nombre . ' ' . $venta->cliente->apellido,
            'cedula'   => $venta->cliente->cedula,
            'correo'   => $venta->cliente->correo,
            'telefono' => $venta->cliente->telefono,
            'detalles' => $venta->detalles->map(fn($d) => [
                'producto'            => $d->producto->nombre,
                'categoria'           => $d->producto->categoria->nombre,
                'cantidad'            => $d->cantidad,
                'precio_unitario'     => $d->precio_unitario,
                'impuesto_porcentaje' => $d->impuesto_porcentaje,
                'subtotal'            => round($d->cantidad * $d->precio_unitario, 2),
                'impuesto_valor'      => round($d->cantidad * $d->precio_unitario * ($d->impuesto_porcentaje / 100), 2),
                'total_linea'         => round($d->cantidad * $d->precio_unitario * (1 + $d->impuesto_porcentaje / 100), 2),
            ]),
            'subtotal'        => $venta->subtotal,
            'impuesto_total'  => $venta->impuesto_total,
            'total'           => $venta->total
        ];
    }
}
