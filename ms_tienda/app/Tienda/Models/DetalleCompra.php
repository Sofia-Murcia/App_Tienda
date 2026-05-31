<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleCompra extends Model
{
    protected $table      = 'detalle_compra';
    public    $timestamps  = false;
    public    $incrementing = false;
    protected $primaryKey  = ['compra_id','producto_id'];
    protected $fillable   = ['compra_id','producto_id','cantidad','costo_unitario'];

    public function compra()   { return $this->belongsTo(Compra::class, 'compra_id'); }
    public function producto() { return $this->belongsTo(Producto::class, 'producto_id'); }
}
