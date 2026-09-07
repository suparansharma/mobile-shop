<?php

namespace App\Repositories\Contracts;

interface CouponRepositoryInterface
{
    public function all(array $filters = [], $perPage = null);
    
    public function findById(int $id);
    
    public function findByCode(string $code);
    
    public function create(array $data);
    
    public function update(int $id, array $data);
    
    public function delete(int $id);
    
    public function incrementUsage(int $id);
}
