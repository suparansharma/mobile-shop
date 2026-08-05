<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderStatusHistory;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items.product'])->latest();

        if ($request->has('status') && $request->status !== '') {
            $query->where('order_status', $request->status);
        }

        $orders = $query->paginate(10);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'statusHistories' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'order_status' => 'required|in:pending,confirmed,processing,shipping,delivered,cancelled,returned'
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->order_status;
        $newStatus = $request->order_status;

        if ($oldStatus !== $newStatus) {
            $order->order_status = $newStatus;
            
            if ($newStatus === 'delivered') {
                $order->payment_status = 'paid';
            }
            
            $order->save();

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'notes' => $request->notes ?? "Order status changed from $oldStatus to $newStatus"
            ]);
        }

        return response()->json(['message' => 'Order status updated successfully', 'order' => $order]);
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if (in_array($order->order_status, ['delivered', 'cancelled', 'returned'])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage.'], 400);
        }

        $oldStatus = $order->order_status;
        $order->order_status = 'cancelled';
        $order->save();

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => 'cancelled',
            'notes' => $request->notes ?? "Order cancelled by admin"
        ]);

        // Mock refund structure
        if ($order->payment_status === 'paid') {
            // Trigger refund logic here
            $order->payment_status = 'refunded';
            $order->save();
        }

        return response()->json(['message' => 'Order cancelled successfully', 'order' => $order]);
    }
}
