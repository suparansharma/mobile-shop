<?php

namespace App\Services;

use App\Repositories\Contracts\CartRepositoryInterface;
use App\Models\Product;

class CartService
{
    protected $cartRepository;

    public function __construct(CartRepositoryInterface $cartRepository)
    {
        $this->cartRepository = $cartRepository;
    }

    public function getCartData($userId)
    {
        $cart = $this->cartRepository->getOrCreateCart($userId);
        
        $subtotal = 0;
        $items = [];

        foreach ($cart->items as $item) {
            $product = $item->product;
            $price = $product->discount_price ?: $product->price;
            $subtotal += $price * $item->quantity;
            
            // Format item
            $items[] = [
                'id' => $item->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float)$price,
                'original_price' => (float)$product->price,
                'quantity' => $item->quantity,
                'image' => $product->images()->where('is_thumbnail', true)->first()->image_path ?? $product->images()->first()->image_path ?? null,
            ];
        }

        // Mock static calculations (discount logic to be expanded later)
        $discount = 0;
        if ($cart->coupon_code) {
            // Placeholder: fixed 5 discount if any coupon applied for structure.
            $discount = 5.00; 
        }
        
        $deliveryCharge = 10.00;
        $total = $subtotal - $discount + $deliveryCharge;

        return [
            'cart_id' => $cart->id,
            'items' => $items,
            'subtotal' => (float)$subtotal,
            'discount' => (float)$discount,
            'delivery_charge' => (float)$deliveryCharge,
            'total' => (float)$total,
            'coupon_code' => $cart->coupon_code,
        ];
    }

    public function addItem($userId, $productId, $quantity)
    {
        $cart = $this->cartRepository->getOrCreateCart($userId);
        $this->cartRepository->addItem($cart->id, $productId, $quantity);
        return $this->getCartData($userId);
    }

    public function updateQuantity($userId, $productId, $quantity)
    {
        $cart = $this->cartRepository->getCartByUserId($userId);
        if ($cart) {
            $this->cartRepository->updateItemQuantity($cart->id, $productId, $quantity);
        }
        return $this->getCartData($userId);
    }

    public function removeItem($userId, $productId)
    {
        $cart = $this->cartRepository->getCartByUserId($userId);
        if ($cart) {
            $this->cartRepository->removeItem($cart->id, $productId);
        }
        return $this->getCartData($userId);
    }

    public function clearCart($userId)
    {
        $cart = $this->cartRepository->getCartByUserId($userId);
        if ($cart) {
            $this->cartRepository->clearCart($cart->id);
        }
        return $this->getCartData($userId);
    }

    public function applyCoupon($userId, $couponCode)
    {
        $cart = $this->cartRepository->getOrCreateCart($userId);
        $this->cartRepository->updateCoupon($cart->id, $couponCode);
        return $this->getCartData($userId);
    }

    public function syncCart($userId, $localItems)
    {
        $cart = $this->cartRepository->getOrCreateCart($userId);
        
        foreach ($localItems as $localItem) {
            $this->cartRepository->addItem($cart->id, $localItem['product_id'], $localItem['quantity']);
        }
        
        return $this->getCartData($userId);
    }
}
