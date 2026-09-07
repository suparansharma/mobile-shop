<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Http\Requests\StoreCouponRequest;
use App\Http\Requests\UpdateCouponRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CouponController extends Controller
{
    protected $couponService;

    public function __construct(CouponService $couponService)
    {
        $this->couponService = $couponService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);
        $coupons = $this->couponService->getAllCoupons($filters, $request->input('per_page', 15));
        return response()->json($coupons);
    }

    public function store(StoreCouponRequest $request)
    {
        $coupon = $this->couponService->createCoupon($request->validated());
        return response()->json([
            'message' => 'Coupon created successfully.',
            'coupon' => $coupon
        ], 201);
    }

    public function show($id)
    {
        $coupon = $this->couponService->getCouponById($id);
        return response()->json($coupon);
    }

    public function update(UpdateCouponRequest $request, $id)
    {
        $coupon = $this->couponService->updateCoupon($id, $request->validated());
        return response()->json([
            'message' => 'Coupon updated successfully.',
            'coupon' => $coupon
        ]);
    }

    public function destroy($id)
    {
        $this->couponService->deleteCoupon($id);
        return response()->json([
            'message' => 'Coupon deleted successfully.'
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:coupons,id'
        ]);

        DB::table('coupons')->whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => 'Coupons deleted successfully.'
        ]);
    }

    public function bulkStatusChange(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:coupons,id',
            'status' => 'required|boolean'
        ]);

        DB::table('coupons')->whereIn('id', $request->ids)->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Coupons status updated successfully.'
        ]);
    }
}
