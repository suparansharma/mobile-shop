<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BrandFactory extends Factory
{
    protected $model = Brand::class;

    public function definition()
    {
        $name = $this->faker->unique()->company;
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'logo' => null,
            'cover_image' => null,
            'short_description' => $this->faker->sentence,
            'website' => $this->faker->url,
            'country' => $this->faker->country,
            'established_year' => $this->faker->numberBetween(1990, date('Y')),
            'is_featured' => $this->faker->boolean(20),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'seo_title' => $name,
            'seo_description' => $this->faker->sentence,
            'status' => true,
        ];
    }
}
