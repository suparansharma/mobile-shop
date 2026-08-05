<?php

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class ProductsImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $sku = $row['sku'];
        $product = Product::where('sku', $sku)->first();

        $data = [
            'type' => $row['type_newused'] ?? 'new',
            'name' => $row['name'],
            'slug' => Str::slug($row['name']) . '-' . Str::random(4),
            'sku' => $sku,
            'barcode' => $row['barcode'] ?? null,
            'short_description' => $row['short_description'] ?? null,
            'category_id' => $row['category_id'] ?? null,
            'brand_id' => $row['brand_id'] ?? null,
            'price' => $row['price'],
            'discount_price' => $row['discount_price'] ?? null,
            'stock' => $row['stock'] ?? 0,
            'status' => $row['status_activeinactive'] ?? 'active',
            'is_featured' => $row['is_featured_10'] ?? 0,
            'is_trending' => $row['is_trending_10'] ?? 0,
            'is_popular' => $row['is_popular_10'] ?? 0,
            'is_best_seller' => $row['is_best_seller_10'] ?? 0,
        ];

        if ($product) {
            // Update existing
            $product->update($data);
            return null; // Don't return new model instance since we updated
        }

        return new Product($data);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'type_newused' => 'nullable|in:new,used',
            'stock' => 'nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
        ];
    }
}
