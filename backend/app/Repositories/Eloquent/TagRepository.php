<?php

namespace App\Repositories\Eloquent;

use App\Models\Tag;
use App\Repositories\Contracts\TagRepositoryInterface;
use Illuminate\Support\Str;

class TagRepository implements TagRepositoryInterface
{
    protected $model;

    public function __construct(Tag $model)
    {
        $this->model = $model;
    }

    private function applyFilters($query, array $filters)
    {
        if (isset($filters['search']) && !empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }
        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }
        return $query;
    }

    public function all(array $filters = [])
    {
        $query = $this->model->query();
        return $this->applyFilters($query, $filters)->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->get();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        $query = $this->model->query();
        return $this->applyFilters($query, $filters)->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        $data['slug'] = Str::slug($data['name']);
        
        // Ensure unique slug
        $originalSlug = $data['slug'];
        $count = 1;
        while ($this->model->where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $count;
            $count++;
        }

        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $tag = $this->find($id);
        
        if (isset($data['name']) && $data['name'] !== $tag->name) {
            $data['slug'] = Str::slug($data['name']);
            
            $originalSlug = $data['slug'];
            $count = 1;
            while ($this->model->where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        $tag->update($data);
        return $tag;
    }

    public function delete($id)
    {
        $tag = $this->find($id);
        return $tag->delete();
    }

    public function bulkDelete(array $ids)
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function bulkUpdateStatus(array $ids, $status)
    {
        return $this->model->whereIn('id', $ids)->update(['status' => $status]);
    }
}
