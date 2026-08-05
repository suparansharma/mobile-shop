<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index($productId)
    {
        $images = ProductImage::where('product_id', $productId)->ordered()->get();
        return response()->json($images);
    }

    public function store(Request $request, $productId)
    {
        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120' // 5MB Max
        ]);

        $product = Product::findOrFail($productId);
        $images = [];

        if ($request->hasFile('images')) {
            $maxSortOrder = ProductImage::where('product_id', $productId)->max('sort_order') ?? -1;
            
            foreach ($request->file('images') as $file) {
                // Determine path and compress
                $path = $this->imageService->processAndStore($file, 'products/' . $product->id);
                
                $maxSortOrder++;
                $isThumbnail = ($maxSortOrder === 0); // First image is thumbnail if none exist
                
                $image = ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_thumbnail' => $isThumbnail,
                    'sort_order' => $maxSortOrder
                ]);

                $images[] = $image;
            }
        }

        return response()->json(['message' => 'Images uploaded successfully', 'images' => $images], 201);
    }

    public function destroy($imageId)
    {
        $image = ProductImage::findOrFail($imageId);
        
        // Delete from storage
        $this->imageService->delete($image->image_path);
        
        // Delete from DB
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    public function reorder(Request $request, $productId)
    {
        $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'exists:product_images,id'
        ]);

        $imageIds = $request->input('image_ids');

        DB::beginTransaction();
        try {
            foreach ($imageIds as $index => $id) {
                ProductImage::where('id', $id)
                    ->where('product_id', $productId)
                    ->update(['sort_order' => $index]);
            }
            DB::commit();
            return response()->json(['message' => 'Images reordered successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reorder images'], 500);
        }
    }

    public function setThumbnail($imageId)
    {
        $image = ProductImage::findOrFail($imageId);
        
        DB::beginTransaction();
        try {
            // Remove thumbnail flag from other images of this product
            ProductImage::where('product_id', $image->product_id)
                ->update(['is_thumbnail' => false]);
            
            // Set this as thumbnail
            $image->update(['is_thumbnail' => true]);
            
            DB::commit();
            return response()->json(['message' => 'Thumbnail updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to set thumbnail'], 500);
        }
    }
}
