<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run()
    {
        $brands = [
            'Apple',
            'Samsung',
            'Xiaomi',
            'Realme',
            'Oppo',
            'Vivo',
            'OnePlus',
            'Nothing',
            'Google Pixel',
            'Honor'
        ];

        foreach ($brands as $index => $brandName) {
            Brand::firstOrCreate(
                ['slug' => Str::slug($brandName)],
                [
                    'name' => $brandName,
                    'short_description' => "Official products from $brandName.",
                    'website' => "https://www." . Str::slug($brandName, '') . ".com",
                    'is_featured' => true,
                    'sort_order' => $index,
                    'status' => true,
                ]
            );
        }
    }
}
