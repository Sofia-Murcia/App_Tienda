<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Cliente;
use Exception;

class ClienteController extends BaseController
{
    protected string $model = Cliente::class;

    protected const RULES = [
        'cedula'   => ['required'=>true,'type'=>'string','min'=>5,'max'=>20,'regex'=>'/^[0-9]+$/'],
        'nombre'   => ['required'=>true,'type'=>'string','min'=>3,'max'=>50,'regex'=>'/^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/'],
        'apellido' => ['required'=>true,'type'=>'string','min'=>3,'max'=>50,'regex'=>'/^[a-zA-ZÁÉÍÓÚáéíóúñÑ ]+$/'],
        'telefono' => ['required'=>true,'type'=>'string','min'=>7,'max'=>20,'regex'=>'/^[0-9]+$/'],
        'correo'   => ['required'=>true,'type'=>'email']
    ];

    protected function beforeCreate(array &$data)
    {
        $data['correo'] = strtolower(trim($data['correo']));
        if (Cliente::where('cedula', $data['cedula'])->exists())
            throw new Exception("La cédula ya está registrada.", 2);
        if (Cliente::where('correo', $data['correo'])->exists())
            throw new Exception("El correo ya está registrado.", 2);
    }

    protected function beforeUpdate(array &$data, $model)
    {
        if (isset($data['correo'])) {
            $data['correo'] = strtolower(trim($data['correo']));
            if (Cliente::where('correo', $data['correo'])->where('id','!=',$model->id)->exists())
                throw new Exception("El correo ya está en uso.", 2);
        }
        if (isset($data['cedula'])) {
            if (Cliente::where('cedula', $data['cedula'])->where('id','!=',$model->id)->exists())
                throw new Exception("La cédula ya está en uso.", 2);
        }
    }
}
