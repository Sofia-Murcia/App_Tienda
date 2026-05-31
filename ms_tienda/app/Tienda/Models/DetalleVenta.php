<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    protected $table      = 'detalle_venta';
    public    $timestamps  = false;
    public    $incrementing = false;
    protected $primaryKey  = ['venta_id','producto_id'];
    protected $fillable   = ['venta_id','producto_id','cantidad','precio_unitario','impuesto_porcentaje'];

    public function venta()    { return $this->belongsTo(Venta::class, 'venta_id'); }
    public function producto() { return $this->belongsTo(Producto::class, 'producto_id'); }
}
