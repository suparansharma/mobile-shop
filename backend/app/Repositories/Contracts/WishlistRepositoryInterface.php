<?php

namespace App\Repositories\Contracts;

interface WishlistRepositoryInterface
{
    public function getByUser(int $userId);
    public function add(int $userId, int $productId);
    public function remove(int $userId, int $productId);
    public function clear(int $userId);
    public function exists(int $userId, int $productId);
    public function getMostWishlisted(int $limit = 10);
    public function getStatistics();
}
