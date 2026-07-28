<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class CategoryService
{
    protected $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllCategories(array $filters = [], $perPage = null)
    {
        return $this->categoryRepository->all($filters, $perPage);
    }
    
    public function getCategoryTree()
    {
        return $this->categoryRepository->getTree();
    }

    public function getCategoryById(int $id)
    {
        return $this->categoryRepository->findById($id);
    }
    
    public function getCategoryBySlug(string $slug)
    {
        return $this->categoryRepository->findBySlug($slug);
    }

    public function createCategory(array $data)
    {
        $data['slug'] = $this->generateSlug($data['name'], $data['slug'] ?? null);

        if (isset($data['icon']) && $data['icon'] instanceof UploadedFile) {
            $data['icon'] = $data['icon']->store('categories/icons', 'public');
        }

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $data['image']->store('categories/images', 'public');
        }
        
        if (isset($data['banner']) && $data['banner'] instanceof UploadedFile) {
            $data['banner'] = $data['banner']->store('categories/banners', 'public');
        }
        
        if (isset($data['parent_id']) && $data['parent_id'] == 'null') {
            $data['parent_id'] = null;
        }

        return $this->categoryRepository->create($data);
    }

    public function updateCategory(int $id, array $data)
    {
        $category = $this->categoryRepository->findById($id);

        if (isset($data['name'])) {
            $data['slug'] = $this->generateSlug($data['name'], $data['slug'] ?? null, $id);
        }

        if (isset($data['icon']) && $data['icon'] instanceof UploadedFile) {
            if ($category->icon) Storage::disk('public')->delete($category->icon);
            $data['icon'] = $data['icon']->store('categories/icons', 'public');
        }

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            if ($category->image) Storage::disk('public')->delete($category->image);
            $data['image'] = $data['image']->store('categories/images', 'public');
        }
        
        if (isset($data['banner']) && $data['banner'] instanceof UploadedFile) {
            if ($category->banner) Storage::disk('public')->delete($category->banner);
            $data['banner'] = $data['banner']->store('categories/banners', 'public');
        }
        
        if (isset($data['parent_id']) && $data['parent_id'] == 'null') {
            $data['parent_id'] = null;
        }

        return $this->categoryRepository->update($id, $data);
    }

    public function deleteCategory(int $id)
    {
        $category = $this->categoryRepository->findById($id);
        
        if ($category->icon) Storage::disk('public')->delete($category->icon);
        if ($category->image) Storage::disk('public')->delete($category->image);
        if ($category->banner) Storage::disk('public')->delete($category->banner);

        return $this->categoryRepository->delete($id);
    }
    
    public function bulkDelete(array $ids)
    {
        return $this->categoryRepository->bulkDelete($ids);
    }
    
    public function bulkUpdateStatus(array $ids, bool $status)
    {
        return $this->categoryRepository->bulkUpdateStatus($ids, $status);
    }

    private function generateSlug($name, $slug = null, $ignoreId = null)
    {
        $slug = $slug ? Str::slug($slug) : Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }

    private function slugExists($slug, $ignoreId = null)
    {
        $query = \App\Models\Category::where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }
        return $query->exists();
    }
}
