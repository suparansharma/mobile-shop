<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class UserOrderController extends Controller
{
    public function index()
    {
        $userId = Auth::guard('sanctum')->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $orders = Order::where('user_id', $userId)
            ->with(['items.product'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show($orderNumber)
    {
        $userId = Auth::guard('sanctum')->id();

        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product', 'statusHistories' => function($q) {
                $q->orderBy('created_at', 'desc');
            }])
            ->firstOrFail();

        // Security check: Either it's the user's order OR the user is an admin
        if ($order->user_id !== $userId && !Auth::guard('sanctum')->user()?->isAdmin()) {
            return response()->json(['message' => 'Unauthorized access to this order'], 403);
        }

        return response()->json($order);
    }
}
