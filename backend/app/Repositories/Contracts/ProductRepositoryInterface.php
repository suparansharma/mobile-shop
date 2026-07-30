<?php

namespace App\Repositories\Contracts;

interface ProductRepositoryInterface
{
    public function all(array $filters = []);
    public function paginate($perPage = 15, array $filters = []);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id); // soft delete
    public function forceDelete($id);
    public function restore($id);
    public function getTrashed($perPage = 15, array $filters = []);
}
