<?php

use Illuminate\Support\Facades\Route;

Route::get('/api/health', function () {
    return response()->json(['message' => 'API only backend']);
});
