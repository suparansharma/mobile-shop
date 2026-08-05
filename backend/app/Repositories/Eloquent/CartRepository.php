<?php

namespace App\Repositories\Eloquent;

use App\Models\Cart;
use App\Models\CartItem;
use App\Repositories\Contracts\CartRepositoryInterface;

class CartRepository implements CartRepositoryInterface
{
    public function getCartByUserId($userId)
    {
        return Cart::with('items.product')->where('user_id', $userId)->first();
    }

    public function getOrCreateCart($userId)
    {
        $cart = $this->getCartByUserId($userId);
        
        if (!$cart) {
            $cart = Cart::create(['user_id' => $userId]);
        }
        
        return $cart;
    }

    public function addItem($cartId, $productId, $quantity)
    {
        $item = CartItem::where('cart_id', $cartId)->where('product_id', $productId)->first();

        if ($item) {
            $item->quantity += $quantity;
            $item->save();
        } else {
            CartItem::create([
                'cart_id' => $cartId,
                'product_id' => $productId,
                'quantity' => $quantity
            ]);
        }
    }

    public function updateItemQuantity($cartId, $productId, $quantity)
    {
        $item = CartItem::where('cart_id', $cartId)->where('product_id', $productId)->first();

        if ($item) {
            if ($quantity <= 0) {
                $item->delete();
            } else {
                $item->quantity = $quantity;
                $item->save();
            }
        }
    }

    public function removeItem($cartId, $productId)
    {
        CartItem::where('cart_id', $cartId)->where('product_id', $productId)->delete();
    }

    public function clearCart($cartId)
    {
        CartItem::where('cart_id', $cartId)->delete();
    }

    public function updateCoupon($cartId, $couponCode)
    {
        Cart::where('id', $cartId)->update(['coupon_code' => $couponCode]);
    }
}
