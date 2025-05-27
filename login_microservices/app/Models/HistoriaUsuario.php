<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoriaUsuario extends Model
{
    use HasFactory;

    // Nombre de la tabla (opcional si sigue la convención)
    protected $table = 'historias';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'titulo',
        'descripcion',
        'responsable',
        'estado',
        'puntos',
        'fecha_creacion',
        'fecha_finalizacion',
        'sprint_id',
    ];

    // Casts para fechas (opcional)
    protected $casts = [
        'fecha_creacion' => 'date',
        'fecha_finalizacion' => 'date',
    ];

    // Relación con el modelo Sprint
    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }
}
