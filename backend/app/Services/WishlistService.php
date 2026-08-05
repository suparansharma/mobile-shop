<?php

namespace App\Services;

use App\Repositories\Contracts\WishlistRepositoryInterface;

class WishlistService
{
    protected $wishlistRepository;

    public function __construct(WishlistRepositoryInterface $wishlistRepository)
    {
        $this->wishlistRepository = $wishlistRepository;
    }

    public function getUserWishlist(int $userId)
    {
        return $this->wishlistRepository->getByUser($userId);
    }

    public function addProductToWishlist(int $userId, int $productId)
    {
        if ($this->wishlistRepository->exists($userId, $productId)) {
            return [
                'status' => 'exists',
                'message' => 'Product is already in your wishlist',
                'wishlist' => $this->wishlistRepository->getByUser($userId)->where('product_id', $productId)->first()
            ];
        }

        $wishlist = $this->wishlistRepository->add($userId, $productId);
        $wishlist->load('product');

        return [
            'status' => 'added',
            'message' => 'Added to wishlist',
            'wishlist' => $wishlist
        ];
    }

    public function removeProductFromWishlist(int $userId, int $productId)
    {
        return $this->wishlistRepository->remove($userId, $productId);
    }

    public function clearUserWishlist(int $userId)
    {
        return $this->wishlistRepository->clear($userId);
    }

    public function getAdminMostWishlisted(int $limit = 10)
    {
        return $this->wishlistRepository->getMostWishlisted($limit);
    }

    public function getAdminStatistics()
    {
        return $this->wishlistRepository->getStatistics();
    }
}
