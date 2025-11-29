<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMatch extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'scanner_id',
        'scanned_id',
        'reason',
        'scanner_status',
        'scanned_status',
    ];

    protected $casts = [
        'scanner_status' => 'boolean',
        'scanned_status' => 'boolean',
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
