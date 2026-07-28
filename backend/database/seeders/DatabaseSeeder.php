<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $apple = Brand::create(['name' => 'Apple', 'slug' => 'apple']);
        $samsung = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);

        $smartphones = Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'status' => true]);
        $tablets = Category::create(['name' => 'Tablets', 'slug' => 'tablets', 'status' => true]);

        Product::create([
            'type' => 'new',
            'name' => 'iPhone 15 Pro Max',
            'slug' => 'iphone-15-pro-max',
            'sku' => 'IP15PM-256',
            'short_description' => 'The ultimate iPhone.',
            'long_description' => 'Detailed description of iPhone 15 Pro Max...',
            'category_id' => $smartphones->id,
            'brand_id' => $apple->id,
            'price' => 1199.00,
            'discount_price' => 1099.00,
            'stock' => 50,
            'status' => true,
            'is_featured' => true,
        ]);

        Product::create([
            'type' => 'new',
            'name' => 'Samsung Galaxy S24 Ultra',
            'slug' => 'samsung-galaxy-s24-ultra',
            'sku' => 'SGS24U-512',
            'short_description' => 'Galaxy AI is here.',
            'long_description' => 'Detailed description of Galaxy S24 Ultra...',
            'category_id' => $smartphones->id,
            'brand_id' => $samsung->id,
            'price' => 1299.00,
            'stock' => 30,
            'status' => true,
            'is_featured' => true,
        ]);
        
        Product::create([
            'type' => 'used',
            'name' => 'iPhone 13 Pro (Used)',
            'slug' => 'iphone-13-pro-used',
            'sku' => 'IP13P-USED',
            'short_description' => 'Excellent condition.',
            'long_description' => 'Used iPhone 13 Pro in mint condition.',
            'category_id' => $smartphones->id,
            'brand_id' => $apple->id,
            'price' => 600.00,
            'stock' => 5,
            'status' => true,
            'is_featured' => false,
        ]);
    }
}
