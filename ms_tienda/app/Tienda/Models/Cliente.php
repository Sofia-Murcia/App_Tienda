<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table    = 'cliente';
    public    $timestamps = false;
    protected $fillable = ['cedula','nombre','apellido','telefono','correo'];

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'cliente_id');
    }
}
