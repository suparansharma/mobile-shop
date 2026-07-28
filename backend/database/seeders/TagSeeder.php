<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Tag;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run()
    {
        $tags = [
            'Gaming', 'Camera', 'Budget', 'Flagship', 'AMOLED', 
            'Fast Charging', '5G', 'Premium', 'Business', 'Student', 'Dynamic API'
        ];

        foreach ($tags as $index => $tagName) {
            Tag::firstOrCreate(
                ['name' => $tagName],
                [
                    'slug' => Str::slug($tagName),
                    'status' => true,
                    'sort_order' => $index + 1
                ]
            );
        }
    }
}
