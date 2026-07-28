<?php

namespace App\Repositories\Contracts;

interface CategoryRepositoryInterface
{
    public function all(array $filters = [], $perPage = null);
    
    public function getTree();
    
    public function findById(int $id);
    
    public function findBySlug(string $slug);
    
    public function create(array $data);
    
    public function update(int $id, array $data);
    
    public function delete(int $id);
    
    public function bulkDelete(array $ids);
    
    public function bulkUpdateStatus(array $ids, bool $status);
}
