<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'barcode',
        'buying_price',
        'selling_price',
        'discount_price',
        'stock',
        'attributes'
    ];

    protected $casts = [
        'attributes' => 'array',
        'buying_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'discount_price' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryHistories()
    {
        return $this->hasMany(InventoryHistory::class);
    }
}
