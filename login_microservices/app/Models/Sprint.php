<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory;

    // Nombre de la tabla (opcional si la tabla se llama "sprints")
    protected $table = 'sprints';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
    ];

    // Casts para fechas
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    // Relación: un sprint tiene muchas historias
    public function historias()
    {
        return $this->hasMany(HistoriaUsuario::class);
    }
}
