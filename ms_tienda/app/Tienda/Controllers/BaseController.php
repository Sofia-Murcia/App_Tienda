<?php
namespace App\Tienda\Controllers;

use App\Tienda\Core\Validation\Validator;
use Exception;

abstract class BaseController
{
    protected string $model = "";
    protected const RULES = [];

    // Hooks
    protected function beforeCreate(array &$data) {}
    protected function afterCreate($model) {}
    protected function beforeUpdate(array &$data, $model) {}
    protected function afterUpdate($model) {}
    protected function beforeDelete($model) {}

    public function getAll()
    {
        return ($this->model)::all();
    }

    public function getOne($id)
    {
        $nombre = class_basename($this->model);
        $row    = ($this->model)::find($id);
        if (empty($row)) throw new Exception("$nombre $id no existe", 1);
        return $row;
    }

    public function saveData($data)
    {
        Validator::validate($data, static::RULES);
        $this->beforeCreate($data);

        $model = new $this->model();
        $model->fill($data);
        $model->save();

        $this->afterCreate($model);
        return $model;
    }

    public function modify($id, $data)
    {
        $model = $this->getOne($id);
        Validator::validate($data, static::RULES, true);
        $this->beforeUpdate($data, $model);

        $model->fill($data);
        $model->save();

        $this->afterUpdate($model);
        return $model;
    }

    public function remove($id)
    {
        $model = $this->getOne($id);
        $this->beforeDelete($model);
        $model->delete();
    }
}
