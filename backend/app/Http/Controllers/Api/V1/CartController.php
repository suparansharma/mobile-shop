<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index()
    {
        return response()->json($this->cartService->getCartData(Auth::id()));
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        return response()->json($this->cartService->addItem(Auth::id(), $request->product_id, $request->quantity));
    }

    public function updateQuantity(Request $request, $productId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        return response()->json($this->cartService->updateQuantity(Auth::id(), $productId, $request->quantity));
    }

    public function remove($productId)
    {
        return response()->json($this->cartService->removeItem(Auth::id(), $productId));
    }

    public function clear()
    {
        return response()->json($this->cartService->clearCart(Auth::id()));
    }

    public function applyCoupon(Request $request)
    {
        $request->validate([
            'coupon_code' => 'nullable|string'
        ]);

        return response()->json($this->cartService->applyCoupon(Auth::id(), $request->coupon_code));
    }

    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        return response()->json($this->cartService->syncCart(Auth::id(), $request->items));
    }
}
