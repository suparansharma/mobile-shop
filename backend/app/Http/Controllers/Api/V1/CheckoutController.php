<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\OrderService;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function process(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'customer_address' => 'required|string',
            'division' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'upazila' => 'required|string|max:255',
            'delivery_area' => 'required|in:inside_city,outside_city',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string'
        ]);

        $userId = Auth::guard('sanctum')->id();
        
        $order = $this->orderService->processCheckout($request->all(), $userId);

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => $order
        ], 201);
    }
}
