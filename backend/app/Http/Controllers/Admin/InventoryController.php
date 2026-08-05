<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\InventoryHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    /**
     * Display a listing of products and variants with their stock.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $products = Product::with(['variants'])
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                             ->orWhere('sku', 'like', "%{$search}%");
            })
            ->paginate($request->input('per_page', 15));

        return response()->json($products);
    }

    /**
     * Adjust stock for a product or variant.
     */
    public function adjustStock(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'reference' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $isVariant = !empty($request->product_variant_id);
            $item = $isVariant 
                ? ProductVariant::findOrFail($request->product_variant_id)
                : Product::findOrFail($request->product_id);

            $currentStock = $item->stock;
            $quantity = $request->quantity;
            $type = $request->type;
            
            $newStock = $currentStock;

            if ($type === 'in') {
                $newStock += $quantity;
            } elseif ($type === 'out') {
                if ($currentStock < $quantity) {
                    return response()->json(['message' => 'Insufficient stock for this operation'], 422);
                }
                $newStock -= $quantity;
            } elseif ($type === 'adjustment') {
                // For absolute adjustment, quantity represents the new stock level
                $newStock = $quantity;
                // Calculate the actual difference for logging
                $diff = $newStock - $currentStock;
                $quantity = abs($diff); // Log the absolute difference
                $type = $diff >= 0 ? 'in' : 'out'; // Reclassify type based on difference for history logic
            }

            // Update Stock
            $item->stock = $newStock;
            $item->save();

            // Record History
            InventoryHistory::create([
                'product_id' => $request->product_id,
                'product_variant_id' => $request->product_variant_id,
                'type' => $request->type === 'adjustment' ? 'adjustment' : $type,
                'quantity' => $request->type === 'adjustment' ? abs($newStock - $currentStock) : $request->quantity,
                'current_stock' => $newStock,
                'notes' => $request->notes,
                'reference' => $request->reference,
                'user_id' => Auth::id()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Stock updated successfully',
                'current_stock' => $newStock
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update stock', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display inventory history.
     */
    public function history(Request $request)
    {
        $productId = $request->input('product_id');
        $variantId = $request->input('product_variant_id');
        $type = $request->input('type');

        $history = InventoryHistory::with(['product', 'variant', 'user'])
            ->when($productId, function ($q) use ($productId) {
                return $q->where('product_id', $productId);
            })
            ->when($variantId, function ($q) use ($variantId) {
                return $q->where('product_variant_id', $variantId);
            })
            ->when($type, function ($q) use ($type) {
                return $q->where('type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($history);
    }
}
