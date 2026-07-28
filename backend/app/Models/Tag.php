<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'status', 'sort_order'];

    protected $casts = [
        'status' => 'boolean',
        'sort_order' => 'integer',
    ];
}
