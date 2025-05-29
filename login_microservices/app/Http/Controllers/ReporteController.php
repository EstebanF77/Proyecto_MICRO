<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sprint;
use App\Models\HistoriaUsuario;

class ReporteController extends Controller
{
    public function sprint($id)
    {
        $sprint = Sprint::find($id);

        if (!$sprint) {
            return response()->json(['mensaje' => 'Sprint no encontrado'], 404);
        }

        $historias = HistoriaUsuario::where('sprint_id', $id)->get();

        $total = $historias->count();
        $finalizadas = $historias->where('estado', 'finalizada')->count();
        $impedimento = $historias->where('estado', 'impedimento')->count();
        $pendientes = $historias->whereIn('estado', ['nueva', 'activa'])->count();

        return response()->json([
            'sprint' => $sprint->nombre,
            'total_historias' => $total,
            'finalizadas' => $finalizadas,
            'pendientes' => $pendientes,
            'impedimento' => $impedimento
        ]);
    }

    public function porResponsable($nombre)
    {
    $historias = HistoriaUsuario::where('responsable', $nombre)->get();

    if ($historias->isEmpty()) {
        return response()->json(['mensaje' => 'No se encontraron historias para ese responsable'], 404);
    }

    $total = $historias->count();
    $finalizadas = $historias->where('estado', 'finalizada')->count();
    $impedimento = $historias->where('estado', 'impedimento')->count();
    $pendientes = $historias->whereIn('estado', ['nueva', 'activa'])->count();

    return response()->json([
        'responsable' => $nombre,
        'total_historias' => $total,
        'finalizadas' => $finalizadas,
        'pendientes' => $pendientes,
        'impedimento' => $impedimento
    ]);
    }

}
