<?php

namespace App\Services;

use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Contracts\CartRepositoryInterface;
use Illuminate\Support\Str;
use App\Models\Product;

class OrderService
{
    protected $orderRepository;
    protected $cartRepository;

    public function __construct(OrderRepositoryInterface $orderRepository, CartRepositoryInterface $cartRepository)
    {
        $this->orderRepository = $orderRepository;
        $this->cartRepository = $cartRepository;
    }

    public function processCheckout($data, $userId = null)
    {
        // Calculate Totals based on items
        $subtotal = 0;
        $items = $data['items'];
        
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if (!$product) continue;
            
            $price = $product->discount_price ?: $product->price;
            $subtotal += $price * $item['quantity'];
        }

        // Apply dummy discount if coupon code is TEST10 (structural mock)
        $discountAmount = 0;
        if (!empty($data['coupon_code']) && $data['coupon_code'] === 'TEST10') {
            $discountAmount = 5.00;
        }

        $deliveryCharge = $data['delivery_area'] === 'inside_city' ? 10.00 : 20.00;
        $totalAmount = $subtotal - $discountAmount + $deliveryCharge;

        $orderNumber = 'ORD-' . strtoupper(Str::random(10));

        $orderData = [
            'user_id' => $userId,
            'order_number' => $orderNumber,
            'total_amount' => $totalAmount,
            'discount_amount' => $discountAmount,
            'coupon_id' => null, // Not implementing full coupon DB yet
            'shipping_address_id' => null,
            'billing_address_id' => null,
            'payment_method' => 'cod', // Hardcoded as per requirements
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'customer_email' => $data['customer_email'] ?? null,
            'customer_address' => $data['customer_address'],
            'division' => $data['division'],
            'district' => $data['district'],
            'upazila' => $data['upazila'],
            'delivery_area' => $data['delivery_area'],
            'delivery_charge' => $deliveryCharge,
        ];

        $order = $this->orderRepository->createOrder($orderData);

        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if (!$product) continue;

            $price = $product->discount_price ?: $product->price;

            $this->orderRepository->createOrderItem([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'unit_price' => $price,
                'total_price' => $price * $item['quantity'],
            ]);
        }

        // Clear user's DB cart if logged in
        if ($userId) {
            $cart = $this->cartRepository->getCartByUserId($userId);
            if ($cart) {
                $this->cartRepository->clearCart($cart->id);
            }
        }

        return $order;
    }
}
