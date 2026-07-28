<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'name',
        'phone',
        'address',
        'city',
        'zone',
        'is_default'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
