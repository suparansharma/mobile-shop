<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Parent: Mobile
        $mobile = Category::create([
            'name' => 'Mobile',
            'slug' => 'mobile',
            'description' => 'All kinds of mobile phones',
            'sort_order' => 1,
            'is_featured' => true,
            'status' => true,
        ]);

        Category::create(['name' => 'Android', 'slug' => 'android', 'parent_id' => $mobile->id, 'sort_order' => 1]);
        Category::create(['name' => 'iPhone', 'slug' => 'iphone', 'parent_id' => $mobile->id, 'sort_order' => 2]);

        // Parent: Accessories
        $accessories = Category::create([
            'name' => 'Accessories',
            'slug' => 'accessories',
            'description' => 'Mobile and tech accessories',
            'sort_order' => 2,
            'is_featured' => true,
            'status' => true,
        ]);

        $accList = [
            'Charger',
            'Cable',
            'Earphone',
            'Neckband',
            'Power Bank',
            'Smart Watch',
            'Back Cover',
            'Glass Protector',
            'Bluetooth Speaker',
            'Memory Card',
            'Mobile Parts'
        ];

        foreach ($accList as $index => $acc) {
            Category::create([
                'name' => $acc,
                'slug' => Str::slug($acc),
                'parent_id' => $accessories->id,
                'sort_order' => $index + 1,
                'status' => true,
            ]);
        }
    }
}
