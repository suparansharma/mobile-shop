<?php

namespace App\Repositories\Contracts;

interface BrandRepositoryInterface
{
    public function all();
    public function paginate($perPage = 15, array $filters = []);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function bulkDelete(array $ids);
    public function bulkUpdateStatus(array $ids, $status);
}
