<?php

namespace App\Repositories;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function all(array $filters = [], $perPage = null)
    {
        $query = Category::query();
        
        // Eager load parent and children for admin view
        $query->with(['parent', 'children']);

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }
        
        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['parent_id'])) {
            if ($filters['parent_id'] === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $filters['parent_id']);
            }
        }
        
        $query->orderBy('sort_order', 'asc');

        if ($perPage) {
            if ($perPage === 'all') {
                return $query->get();
            }
            return $query->paginate($perPage);
        }

        return $query->get();
    }
    
    public function getTree()
    {
        return Category::with('children')->whereNull('parent_id')->orderBy('sort_order', 'asc')->get();
    }

    public function findById(int $id)
    {
        return Category::findOrFail($id);
    }
    
    public function findBySlug(string $slug)
    {
        return Category::with(['children', 'products' => function($q) {
            $q->where('status', true);
        }])->where('slug', $slug)->firstOrFail();
    }

    public function create(array $data)
    {
        return Category::create($data);
    }

    public function update(int $id, array $data)
    {
        $category = Category::findOrFail($id);
        $category->update($data);
        return $category;
    }

    public function delete(int $id)
    {
        $category = Category::findOrFail($id);
        return $category->delete();
    }
    
    public function bulkDelete(array $ids)
    {
        return Category::whereIn('id', $ids)->delete();
    }
    
    public function bulkUpdateStatus(array $ids, bool $status)
    {
        return Category::whereIn('id', $ids)->update(['status' => $status]);
    }
}
