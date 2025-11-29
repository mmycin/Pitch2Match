<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'scanner_id',
        'scanned_id',
        'status',
        'read',
    ];

    protected $casts = [
        'status' => 'boolean',
        'read' => 'boolean',
    ];

    public function scanner()
    {
        return $this->belongsTo(User::class, 'scanner_id');
    }

    public function scanned()
    {
        return $this->belongsTo(User::class, 'scanned_id');
    }
}
