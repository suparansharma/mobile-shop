<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = $request->user()->wishlist()->with('product')->get();
        return response()->json($wishlist);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $exists = $request->user()->wishlist()->where('product_id', $request->product_id)->first();

        if ($exists) {
            return response()->json([
                'message' => 'Product is already in your wishlist',
                'wishlist' => $exists
            ], 200);
        }

        $wishlist = $request->user()->wishlist()->create([
            'product_id' => $request->product_id
        ]);

        // Load product relationship for response
        $wishlist->load('product');

        return response()->json([
            'message' => 'Added to wishlist',
            'wishlist' => $wishlist
        ], 201);
    }

    public function destroy(Request $request, string $id)
    {
        // $id can be the wishlist ID or product ID. Let's assume it's wishlist ID.
        $wishlist = $request->user()->wishlist()->findOrFail($id);
        $wishlist->delete();

        return response()->json(['message' => 'Removed from wishlist']);
    }
}
