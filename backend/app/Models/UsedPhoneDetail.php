<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsedPhoneDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'imei',
        'battery_health',
        'screen_condition',
        'frame_condition',
        'back_panel_condition',
        'face_id',
        'fingerprint',
        'repair_history',
        'original_box',
        'original_charger',
        'purchase_date',
        'warranty_remaining'
    ];

    protected $casts = [
        'face_id' => 'boolean',
        'fingerprint' => 'boolean',
        'original_box' => 'boolean',
        'original_charger' => 'boolean',
        'purchase_date' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
