<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;

class PublicApiController extends Controller
{
    public function categories()
    {
        return response()->json(Category::where('status', true)->get());
    }

    public function brands()
    {
        return response()->json(Brand::all());
    }

    public function products(Request $request)
    {
        $query = Product::where('status', true);
        
        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        
        if ($request->has('brand')) {
            $query->whereHas('brand', function($q) use ($request) {
                $q->where('slug', $request->brand);
            });
        }

        return response()->json($query->paginate(15));
    }

    public function productDetails($slug)
    {
        $product = Product::with(['category', 'brand', 'images', 'attributes', 'usedPhoneDetails', 'variants'])->where('slug', $slug)->firstOrFail();
        
        return response()->json($product);
    }

    public function brandDetails($slug)
    {
        $brand = Brand::withCount('products')->with(['products' => function($q) {
            $q->where('status', true);
        }])->where('slug', $slug)->firstOrFail();
        
        return response()->json($brand);
    }

    public function categoryTree()
    {
        $categories = Category::with('children')->whereNull('parent_id')->orderBy('sort_order', 'asc')->get();
        return response()->json($categories);
    }

    public function categoryDetails($slug)
    {
        $category = Category::withCount('products')->with(['children', 'products' => function($q) {
            $q->where('status', true);
        }])->where('slug', $slug)->firstOrFail();
        
        return response()->json($category);
    }
}
