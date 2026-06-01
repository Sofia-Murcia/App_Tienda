<?php
namespace App\Tienda\Core\Validation;

use Exception;
use DateTime;

class Validator
{
    public static function validate(array $data, array $rules, bool $isUpdate = false): void
    {
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;

            if (!$isUpdate && ($rule['required'] ?? false) && self::isEmpty($value)) {
                throw new Exception("El campo '$field' es obligatorio.", 3);
            }
            if ($value === null || $value === '') continue;

            $type = $rule['type'] ?? 'string';
            switch ($type) {
                case 'string':   self::validateString($field, $value, $rule); break;
                case 'int':      self::validateInt($field, $value, $rule);    break;
                case 'decimal':  self::validateDecimal($field, $value, $rule);break;
                case 'boolean':  self::validateBoolean($field, $value);       break;
                case 'email':    self::validateEmail($field, $value);         break;
                case 'date':     self::validateDate($field, $value);          break;
                case 'datetime': self::validateDateTime($field, $value);      break;
                case 'enum':     self::validateEnum($field, $value, $rule);   break;
                default: throw new Exception("Tipo no soportado en '$field'.", 3);
            }
        }
    }

    private static function isEmpty($value): bool
    {
        return $value === null || $value === '';
    }

    private static function validateString($field, $value, $rule)
    {
        if (!is_string($value))
            throw new Exception("'$field' debe ser texto.", 3);
        if (isset($rule['min']) && strlen($value) < $rule['min'])
            throw new Exception("'$field' debe tener mínimo {$rule['min']} caracteres.", 3);
        if (isset($rule['max']) && strlen($value) > $rule['max'])
            throw new Exception("'$field' excede el máximo de {$rule['max']} caracteres.", 3);
        if (isset($rule['regex']) && !preg_match($rule['regex'], $value))
            throw new Exception("'$field' tiene formato inválido.", 3);
    }

    private static function validateInt($field, $value, $rule)
    {
        if (!filter_var($value, FILTER_VALIDATE_INT) && $value !== 0)
            throw new Exception("'$field' debe ser entero.", 3);
        if (isset($rule['min']) && $value < $rule['min'])
            throw new Exception("'$field' no puede ser menor a {$rule['min']}.", 3);
        if (isset($rule['max']) && $value > $rule['max'])
            throw new Exception("'$field' no puede ser mayor a {$rule['max']}.", 3);
    }

    private static function validateDecimal($field, $value, $rule)
    {
        if (!is_numeric($value))
            throw new Exception("'$field' debe ser numérico.", 3);
        $precision = $rule['precision'] ?? 10;
        $scale     = $rule['scale'] ?? 2;
        $parts     = explode('.', (string) $value);
        $intPart   = strlen($parts[0]);
        $decPart   = isset($parts[1]) ? strlen($parts[1]) : 0;
        if ($decPart > $scale)
            throw new Exception("'$field' excede $scale decimales.", 3);
        if (($intPart + $decPart) > $precision)
            throw new Exception("'$field' excede precisión $precision.", 3);
        if (isset($rule['min']) && (float) $value < $rule['min'])
            throw new Exception("'$field' debe ser mayor o igual a {$rule['min']}.", 3);
    }

    private static function validateBoolean($field, $value)
    {
        if (!is_bool($value) && $value !== 0 && $value !== 1 && $value !== "0" && $value !== "1")
            throw new Exception("'$field' debe ser booleano.", 3);
    }

    private static function validateEmail($field, $value)
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL))
            throw new Exception("'$field' no es un email válido.", 3);
    }

    private static function validateDate($field, $value)
    {
        $d = DateTime::createFromFormat('Y-m-d', $value);
        if (!$d || $d->format('Y-m-d') !== $value)
            throw new Exception("'$field' debe ser fecha YYYY-MM-DD.", 3);
    }

    private static function validateDateTime($field, $value)
    {
        $d = DateTime::createFromFormat('Y-m-d H:i:s', $value);
        if (!$d || $d->format('Y-m-d H:i:s') !== $value)
            throw new Exception("'$field' debe ser datetime válido (YYYY-MM-DD HH:MM:SS).", 3);
    }

    private static function validateEnum($field, $value, $rule)
    {
        if (!isset($rule['values']) || !is_array($rule['values']))
            throw new Exception("Enum mal definido en '$field'.", 3);
        if (!in_array($value, $rule['values']))
            throw new Exception("'$field' tiene valor inválido. Valores permitidos: " . implode(', ', $rule['values']), 3);
    }
}
