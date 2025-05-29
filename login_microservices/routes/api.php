<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HistoriaUsuarioController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\ReporteController;




Route::apiResource('historias', HistoriaUsuarioController::class);
Route::apiResource('sprints', SprintController::class);
Route::get('/reportes/sprint/{id}', [ReporteController::class, 'sprint']);
Route::get('/reportes/responsable/{nombre}', [ReporteController::class, 'porResponsable']);


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
