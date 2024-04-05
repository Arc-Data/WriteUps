<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class,'login']);
    Route::post('/refresh', [AuthController::class,'refresh']);
});

Route::middleware('auth:api')->group(function () {
    Route::prefix('posts')->group(function () {
        Route::get('/', [PostController::class,'index']);
        Route::post('/', [PostController::class,'store']);
        Route::get('/{post}', [PostController::class,'show']);
        Route::delete('/{post}', [PostController::class,'destroy']);
    });
});
