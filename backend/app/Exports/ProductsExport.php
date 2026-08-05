<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Product::with(['category', 'brand'])->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Type (new/used)',
            'Name',
            'SKU',
            'Barcode',
            'Short Description',
            'Category ID',
            'Brand ID',
            'Price',
            'Discount Price',
            'Stock',
            'Status (active/inactive)',
            'Is Featured (1/0)',
            'Is Trending (1/0)',
            'Is Popular (1/0)',
            'Is Best Seller (1/0)'
        ];
    }

    /**
     * @param mixed $product
     * @return array
     */
    public function map($product): array
    {
        return [
            $product->id,
            $product->type,
            $product->name,
            $product->sku,
            $product->barcode,
            $product->short_description,
            $product->category_id,
            $product->brand_id,
            $product->price,
            $product->discount_price,
            $product->stock,
            $product->status,
            $product->is_featured ? 1 : 0,
            $product->is_trending ? 1 : 0,
            $product->is_popular ? 1 : 0,
            $product->is_best_seller ? 1 : 0,
        ];
    }
}
