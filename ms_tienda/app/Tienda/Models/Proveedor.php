<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    protected $table    = 'proveedor';
    public    $timestamps = false;
    protected $fillable = ['nombre','telefono','ciudad'];

    public function productos()
    {
        return $this->belongsToMany(
            Producto::class,
            'producto_proveedor',
            'proveedor_id',
            'producto_id'
        );
    }

    public function compras()
    {
        return $this->hasMany(Compra::class, 'proveedor_id');
    }
}
