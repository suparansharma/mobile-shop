<?php

namespace App\Services;

use App\Repositories\Contracts\BrandRepositoryInterface;
use Illuminate\Support\Str;

class BrandService
{
    protected $brandRepository;

    public function __construct(BrandRepositoryInterface $brandRepository)
    {
        $this->brandRepository = $brandRepository;
    }

    public function getAllBrands()
    {
        return $this->brandRepository->all();
    }

    public function getPaginatedBrands($perPage = 15, array $filters = [])
    {
        return $this->brandRepository->paginate($perPage, $filters);
    }

    public function getBrandById($id)
    {
        return $this->brandRepository->find($id);
    }

    public function createBrand(array $data)
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        
        if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
            $data['logo'] = $data['logo']->store('brands', 'public');
        }

        if (isset($data['cover_image']) && $data['cover_image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['cover_image'] = $data['cover_image']->store('brands', 'public');
        }

        return $this->brandRepository->create($data);
    }

    public function updateBrand($id, array $data)
    {
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
            $data['logo'] = $data['logo']->store('brands', 'public');
        }

        if (isset($data['cover_image']) && $data['cover_image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['cover_image'] = $data['cover_image']->store('brands', 'public');
        }

        return $this->brandRepository->update($id, $data);
    }

    public function deleteBrand($id)
    {
        return $this->brandRepository->delete($id);
    }

    public function bulkDeleteBrands(array $ids)
    {
        return $this->brandRepository->bulkDelete($ids);
    }

    public function bulkUpdateStatus(array $ids, $status)
    {
        return $this->brandRepository->bulkUpdateStatus($ids, $status);
    }
}
