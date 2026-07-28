<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::with(['category', 'brand'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:new,used,accessory',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products',
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric',
            'discount_price' => 'nullable|numeric',
            'stock' => 'required|integer|min:0',
            'status' => 'boolean',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string'
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . time(); // ensure uniqueness
        
        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'brand', 'images', 'attributes', 'usedPhoneDetails']));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'type' => 'required|in:new,used,accessory',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,'.$product->id,
            'short_description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric',
            'discount_price' => 'nullable|numeric',
            'stock' => 'required|integer|min:0',
            'status' => 'boolean',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string'
        ]);

        if ($request->name !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . time();
        }

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
