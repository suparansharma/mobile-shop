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
        'type', 'name', 'slug', 'sku', 'barcode', 'short_description', 'long_description', 
        'specifications', 'category_id', 'sub_category_id', 'brand_id', 'price', 
        'is_popular', 'is_best_seller', 'publish_date', 'views', 'meta_title', 'meta_description',
        'low_stock_threshold'
    ];

    protected $casts = [
        'specifications' => 'array',
        'status' => 'boolean',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'is_popular' => 'boolean',
        'is_best_seller' => 'boolean',
        'publish_date' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }
    
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
    
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order', 'asc');
    }
    
    public function attributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }
    
    public function usedPhoneDetails()
    {
        return $this->hasOne(UsedPhoneDetail::class);
    }

    public function seo()
    {
        return $this->hasOne(ProductSeo::class);
    }

    public function inventoryHistories()
    {
        return $this->hasMany(InventoryHistory::class);
    }
}
