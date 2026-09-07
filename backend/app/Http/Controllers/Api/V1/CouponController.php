<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Http\Requests\ApplyCouponRequest;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    protected $couponService;

    public function __construct(CouponService $couponService)
    {
        $this->couponService = $couponService;
    }

    public function apply(ApplyCouponRequest $request)
    {
        try {
            $result = $this->couponService->applyCoupon($request->code, $request->order_total);
            return response()->json([
                'success' => true,
                'message' => 'Coupon applied successfully.',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function remove(Request $request)
    {
        // For a stateless API without modifying the Cart/Checkout modules,
        // removing a coupon simply means returning a success response so the client
        // can clear the applied coupon from its local state.
        return response()->json([
            'success' => true,
            'message' => 'Coupon removed successfully.'
        ]);
    }
}
