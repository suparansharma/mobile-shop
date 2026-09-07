<?php

namespace App\Services;

use App\Repositories\Contracts\CouponRepositoryInterface;
use Exception;

class CouponService
{
    protected $couponRepository;

    public function __construct(CouponRepositoryInterface $couponRepository)
    {
        $this->couponRepository = $couponRepository;
    }

    public function getAllCoupons(array $filters = [], $perPage = 15)
    {
        return $this->couponRepository->all($filters, $perPage);
    }

    public function getCouponById(int $id)
    {
        return $this->couponRepository->findById($id);
    }
    
    public function getCouponByCode(string $code)
    {
        return $this->couponRepository->findByCode($code);
    }

    public function createCoupon(array $data)
    {
        return $this->couponRepository->create($data);
    }

    public function updateCoupon(int $id, array $data)
    {
        return $this->couponRepository->update($id, $data);
    }

    public function deleteCoupon(int $id)
    {
        return $this->couponRepository->delete($id);
    }
    
    public function applyCoupon(string $code, float $orderTotal)
    {
        $coupon = $this->couponRepository->findByCode($code);
        
        if (!$coupon) {
            throw new Exception("Coupon not found.");
        }
        
        if (!$coupon->isValid()) {
            throw new Exception("Coupon is invalid, expired, or usage limit reached.");
        }
        
        if ($coupon->min_spend !== null && $orderTotal < $coupon->min_spend) {
            throw new Exception("Minimum order amount of {$coupon->min_spend} required to use this coupon.");
        }
        
        // Calculate discount
        $discountAmount = 0;
        if ($coupon->type === 'fixed') {
            $discountAmount = $coupon->value;
        } elseif ($coupon->type === 'percent') {
            $discountAmount = $orderTotal * ($coupon->value / 100);
        }
        
        // Apply max discount if applicable
        if ($coupon->max_discount !== null && $discountAmount > $coupon->max_discount) {
            $discountAmount = $coupon->max_discount;
        }
        
        return [
            'success' => true,
            'coupon' => $coupon,
            'discount_amount' => round($discountAmount, 2),
            'new_total' => max(0, round($orderTotal - $discountAmount, 2))
        ];
    }
}
