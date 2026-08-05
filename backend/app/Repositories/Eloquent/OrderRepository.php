<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\Contracts\OrderRepositoryInterface;

class OrderRepository implements OrderRepositoryInterface
{
    public function createOrder(array $data)
    {
        return Order::create($data);
    }

    public function createOrderItem(array $data)
    {
        return OrderItem::create($data);
    }
}
