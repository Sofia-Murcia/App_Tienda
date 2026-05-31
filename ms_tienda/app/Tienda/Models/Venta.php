<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table    = 'venta';
    public    $timestamps = false;
    protected $fillable = ['cliente_id','fecha','subtotal','impuesto_total','total'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class, 'venta_id');
    }
}
