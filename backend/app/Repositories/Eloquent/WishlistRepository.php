<?php

namespace App\Repositories\Eloquent;

use App\Models\Wishlist;
use App\Models\Product;
use App\Repositories\Contracts\WishlistRepositoryInterface;
use Illuminate\Support\Facades\DB;

class WishlistRepository implements WishlistRepositoryInterface
{
    public function getByUser(int $userId)
    {
        return Wishlist::with('product')->where('user_id', $userId)->get();
    }

    public function add(int $userId, int $productId)
    {
        return Wishlist::create([
            'user_id' => $userId,
            'product_id' => $productId
        ]);
    }

    public function remove(int $userId, int $productId)
    {
        return Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete();
    }

    public function clear(int $userId)
    {
        return Wishlist::where('user_id', $userId)->delete();
    }

    public function exists(int $userId, int $productId)
    {
        return Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();
    }

    public function getMostWishlisted(int $limit = 10)
    {
        return Product::select('products.*', DB::raw('COUNT(wishlists.id) as wishlist_count'))
            ->join('wishlists', 'products.id', '=', 'wishlists.product_id')
            ->groupBy('products.id')
            ->orderBy('wishlist_count', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getStatistics()
    {
        $totalWishlists = Wishlist::count();
        $uniqueUsers = Wishlist::distinct('user_id')->count('user_id');
        $uniqueProducts = Wishlist::distinct('product_id')->count('product_id');

        return [
            'total_items_wishlisted' => $totalWishlists,
            'unique_users' => $uniqueUsers,
            'unique_products' => $uniqueProducts,
        ];
    }
}
