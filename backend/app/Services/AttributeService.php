<?php

namespace App\Services;

use App\Repositories\Contracts\AttributeRepositoryInterface;

class AttributeService
{
    protected $attributeRepository;

    public function __construct(AttributeRepositoryInterface $attributeRepository)
    {
        $this->attributeRepository = $attributeRepository;
    }

    public function getAllAttributes(array $filters = [])
    {
        return $this->attributeRepository->all($filters);
    }

    public function getPaginatedAttributes($perPage = 15, array $filters = [])
    {
        return $this->attributeRepository->paginate($perPage, $filters);
    }

    public function getAttributeById($id)
    {
        return $this->attributeRepository->find($id);
    }

    public function createAttribute(array $data)
    {
        return $this->attributeRepository->create($data);
    }

    public function updateAttribute($id, array $data)
    {
        return $this->attributeRepository->update($id, $data);
    }

    public function deleteAttribute($id)
    {
        return $this->attributeRepository->delete($id);
    }

    public function bulkDeleteAttributes(array $ids)
    {
        return $this->attributeRepository->bulkDelete($ids);
    }

    public function bulkUpdateStatus(array $ids, $status)
    {
        return $this->attributeRepository->bulkUpdateStatus($ids, $status);
    }
}
