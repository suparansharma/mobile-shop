<?php

namespace App\Http\Controllers;

use App\Services\WishlistService;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    protected $wishlistService;

    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    public function index(Request $request)
    {
        $wishlist = $this->wishlistService->getUserWishlist($request->user()->id);
        return response()->json($wishlist);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $result = $this->wishlistService->addProductToWishlist($request->user()->id, $request->product_id);

        return response()->json([
            'message' => $result['message'],
            'wishlist' => $result['wishlist']
        ], $result['status'] === 'added' ? 201 : 200);
    }

    public function destroy(Request $request, string $productId)
    {
        $this->wishlistService->removeProductFromWishlist($request->user()->id, (int)$productId);

        return response()->json(['message' => 'Removed from wishlist']);
    }

    public function clear(Request $request)
    {
        $this->wishlistService->clearUserWishlist($request->user()->id);

        return response()->json(['message' => 'Wishlist cleared']);
    }
}
