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
        $query = Product::with(['category', 'brand', 'images'])->where('status', true);
        
        // 1. Search (Name, SKU, Brand Name, Category Name)
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('brand', function($bq) use ($search) {
                      $bq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('category', function($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Category Filter (Supports array or comma-separated string of slugs)
        if ($request->has('category') && !empty($request->category)) {
            $categories = is_array($request->category) ? $request->category : explode(',', $request->category);
            $query->whereHas('category', function($q) use ($categories) {
                $q->whereIn('slug', $categories);
            });
        }
        
        // 3. Brand Filter (Supports array or comma-separated string of slugs)
        if ($request->has('brand') && !empty($request->brand)) {
            $brands = is_array($request->brand) ? $request->brand : explode(',', $request->brand);
            $query->whereHas('brand', function($q) use ($brands) {
                $q->whereIn('slug', $brands);
            });
        }

        // 4. Product Type (new/used/accessory)
        if ($request->has('type') && !empty($request->type)) {
            $types = is_array($request->type) ? $request->type : explode(',', $request->type);
            $query->whereIn('type', $types);
        }

        // 5. Flags (Featured, Trending, Best Seller)
        if ($request->boolean('is_featured')) {
            $query->where('is_featured', true);
        }
        if ($request->boolean('is_trending')) {
            $query->where('is_trending', true);
        }
        if ($request->boolean('is_best_seller')) {
            $query->where('is_best_seller', true);
        }

        // 6. Stock Status
        if ($request->has('in_stock')) {
            $inStock = filter_var($request->in_stock, FILTER_VALIDATE_BOOLEAN);
            if ($inStock) {
                $query->where('stock', '>', 0);
            } else {
                $query->where('stock', 0);
            }
        }

        // 7. Condition (For Used Phones)
        if ($request->has('condition') && !empty($request->condition)) {
            $conditions = is_array($request->condition) ? $request->condition : explode(',', $request->condition);
            $query->whereHas('usedPhoneDetails', function($q) use ($conditions) {
                $q->whereIn('screen_condition', $conditions)
                  ->orWhereIn('frame_condition', $conditions)
                  ->orWhereIn('back_panel_condition', $conditions);
            });
        }

        // 8. Dynamic Attributes (RAM, Storage, Color) via JSON attributes in product_variants
        // If variants are not used for some products, we can also check specifications.
        // Assuming user mainly filters via variants for these things.
        $variantFilters = ['ram' => 'RAM', 'storage' => 'Storage', 'color' => 'Color'];
        foreach ($variantFilters as $param => $jsonKey) {
            if ($request->has($param) && !empty($request->input($param))) {
                $values = is_array($request->input($param)) ? $request->input($param) : explode(',', $request->input($param));
                $query->whereHas('variants', function($q) use ($jsonKey, $values) {
                    $q->where(function($subQ) use ($jsonKey, $values) {
                        foreach ($values as $val) {
                            $subQ->orWhereJsonContains('attributes->' . $jsonKey, trim($val));
                        }
                    });
                });
            }
        }

        // Ordering
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        
        $allowedSorts = ['price', 'created_at', 'name', 'stock'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');
        }

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function productDetails($slug)
    {
        $product = Product::with(['category', 'brand', 'images', 'attributes', 'usedPhoneDetails', 'variants', 'seo'])->where('slug', $slug)->firstOrFail();
        
        $relatedProducts = Product::with(['category', 'brand', 'images'])
            ->where('status', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->inRandomOrder()
            ->take(4)
            ->get();

        $product->setAttribute('related_products', $relatedProducts);

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
