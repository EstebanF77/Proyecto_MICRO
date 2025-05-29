<?php

namespace App\Http\Controllers;

use App\Models\HistoriaUsuario;
use Illuminate\Http\Request;

class HistoriaUsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = HistoriaUsuario::query();

        if ($request->has('sprint_id')) {
            $query->where('sprint_id', $request->sprint_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['mensaje' => 'Historia no encontrada'], 404);
        }

        return response()->json($historia);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'descripcion' => 'required|string',
            'responsable' => 'required|string|max:100',
            'estado' => 'required|in:nueva,activa,finalizada,impedimento',
            'puntos' => 'required|integer|min:0',
            'fecha_creacion' => 'nullable|date',
            'fecha_finalizacion' => 'nullable|date',
            'sprint_id' => 'required|integer',
        ]);

        $historia = HistoriaUsuario::create($validated);
        return response()->json($historia, 201);
    }

    public function update(Request $request, $id)
    {
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['mensaje' => 'Historia no encontrada'], 404);
        }

        $validated = $request->validate([
            'titulo' => 'sometimes|required|string|max:150',
            'descripcion' => 'sometimes|required|string',
            'responsable' => 'sometimes|required|string|max:100',
            'estado' => 'sometimes|required|in:nueva,activa,finalizada,impedimento',
            'puntos' => 'sometimes|required|integer|min:0',
            'fecha_creacion' => 'nullable|date',
            'fecha_finalizacion' => 'nullable|date',
            'sprint_id' => 'sometimes|required|integer',
        ]);

        $historia->update($validated);
        return response()->json($historia);
    }

    public function destroy($id)
    {
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['mensaje' => 'Historia no encontrada'], 404);
        }

        $historia->delete();
        return response()->json(['mensaje' => 'Historia eliminada']);
    }
}
