<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product'])->orderBy('created_at', 'desc');

        // Optional filtering by status
        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }

        // Pagination
        $orders = $query->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);
        
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'order_status' => 'sometimes|in:pending,confirmed,processing,shipping,delivered,cancelled,returned,refund',
            'payment_status' => 'sometimes|in:pending,paid,failed'
        ]);

        $order = Order::findOrFail($id);

        if ($request->has('order_status')) {
            $order->order_status = $request->order_status;
        }

        if ($request->has('payment_status')) {
            $order->payment_status = $request->payment_status;
        }

        $order->save();

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order
        ]);
    }
}
