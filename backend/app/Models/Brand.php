<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name', 'slug', 'logo', 'cover_image', 'short_description', 
        'website', 'country', 'established_year', 'is_featured', 
        'sort_order', 'seo_title', 'seo_description', 'status'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'status' => 'boolean',
        'established_year' => 'integer',
        'sort_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
