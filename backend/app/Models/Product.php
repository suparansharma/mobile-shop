<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'type', 'name', 'slug', 'sku', 'short_description', 'long_description', 
        'specifications', 'category_id', 'sub_category_id', 'brand_id', 
        'price', 'discount_price', 'stock', 'status', 'is_featured', 
        'is_trending', 'views', 'meta_title', 'meta_description'
    ];
    
    protected $casts = [
        'specifications' => 'array',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'status' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
    
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }
    
    public function usedPhoneDetails()
    {
        return $this->hasOne(UsedPhoneDetail::class);
    }
}
