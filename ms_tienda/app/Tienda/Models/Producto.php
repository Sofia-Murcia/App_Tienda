<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table    = 'producto';
    public    $timestamps = false;
    protected $fillable = [
        'codigo','nombre','peso','cantidad','stock_minimo',
        'tipo_empaque','precio','categoria_id'
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function proveedores()
    {
        return $this->belongsToMany(
            Proveedor::class,
            'producto_proveedor',
            'producto_id',
            'proveedor_id'
        );
    }

    public function detallesCompra()
    {
        return $this->hasMany(DetalleCompra::class, 'producto_id');
    }

    public function detallesVenta()
    {
        return $this->hasMany(DetalleVenta::class, 'producto_id');
    }
}
