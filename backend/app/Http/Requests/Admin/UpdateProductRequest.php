<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $id = $this->route('product');
        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $id,
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $id,
            'barcode' => 'nullable|string|max:255',
            'type' => 'required|in:new,used,accessory',
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'boolean',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'is_popular' => 'boolean',
            'is_best_seller' => 'boolean',
            'publish_date' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'specifications.*.key' => 'required_with:specifications|string',
            'specifications.*.value' => 'required_with:specifications|string',
            'product_variants' => 'nullable|array',
            'product_variants.*.sku' => 'nullable|string',
            'product_variants.*.barcode' => 'nullable|string',
            'product_variants.*.buying_price' => 'nullable|numeric|min:0',
            'product_variants.*.selling_price' => 'required_with:product_variants|numeric|min:0',
            'product_variants.*.discount_price' => 'nullable|numeric|min:0',
            'product_variants.*.stock' => 'required_with:product_variants|integer|min:0',
            'product_variants.*.attributes' => 'nullable|array',
        ];
    }
}
