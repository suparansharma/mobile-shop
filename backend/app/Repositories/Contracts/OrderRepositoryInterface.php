<?php

namespace App\Repositories\Contracts;

interface OrderRepositoryInterface
{
    public function createOrder(array $data);
    public function createOrderItem(array $data);
}
