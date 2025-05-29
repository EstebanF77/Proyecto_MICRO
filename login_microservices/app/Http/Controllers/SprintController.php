<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    public function index()
    {
        return response()->json(Sprint::all());
    }

    public function show($id)
    {
        $sprint = Sprint::find($id);

        if (!$sprint) {
            return response()->json(['mensaje' => 'Sprint no encontrado'], 404);
        }

        return response()->json($sprint);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $sprint = Sprint::create($validated);
        return response()->json($sprint, 201);
    }

    public function update(Request $request, $id)
    {
        $sprint = Sprint::find($id);

        if (!$sprint) {
            return response()->json(['mensaje' => 'Sprint no encontrado'], 404);
        }

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'sometimes|required|date|after_or_equal:fecha_inicio',
        ]);

        $sprint->update($validated);
        return response()->json($sprint);
    }

    public function destroy($id)
    {
        $sprint = Sprint::find($id);

        if (!$sprint) {
            return response()->json(['mensaje' => 'Sprint no encontrado'], 404);
        }

        $sprint->delete();
        return response()->json(['mensaje' => 'Sprint eliminado']);
    }
}
