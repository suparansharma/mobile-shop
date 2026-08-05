<?php

namespace App\Repositories\Contracts;

interface CartRepositoryInterface
{
    public function getCartByUserId($userId);
    public function addItem($cartId, $productId, $quantity);
    public function updateItemQuantity($cartId, $productId, $quantity);
    public function removeItem($cartId, $productId);
    public function clearCart($cartId);
    public function updateCoupon($cartId, $couponCode);
    public function getOrCreateCart($userId);
}
