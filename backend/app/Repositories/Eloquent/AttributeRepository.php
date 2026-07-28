<?php

namespace App\Repositories\Eloquent;

use App\Models\Attribute;
use App\Repositories\Contracts\AttributeRepositoryInterface;

class AttributeRepository implements AttributeRepositoryInterface
{
    protected $model;

    public function __construct(Attribute $model)
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
        $query = $this->model->with('values');
        return $this->applyFilters($query, $filters)->orderBy('id', 'desc')->get();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        $query = $this->model->with('values');
        return $this->applyFilters($query, $filters)->orderBy('id', 'desc')->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model->with('values')->findOrFail($id);
    }

    public function create(array $data)
    {
        $attribute = $this->model->create([
            'name' => $data['name'],
            'status' => $data['status'] ?? true,
        ]);

        if (isset($data['values']) && is_array($data['values'])) {
            foreach ($data['values'] as $val) {
                $attribute->values()->create(['value' => $val]);
            }
        }

        return $attribute->load('values');
    }

    public function update($id, array $data)
    {
        $attribute = $this->find($id);
        
        $attribute->update([
            'name' => $data['name'],
            'status' => $data['status'] ?? $attribute->status,
        ]);

        if (isset($data['values']) && is_array($data['values'])) {
            // Delete old values and insert new
            $attribute->values()->delete();
            foreach ($data['values'] as $val) {
                $attribute->values()->create(['value' => $val]);
            }
        }

        return $attribute->load('values');
    }

    public function delete($id)
    {
        $attribute = $this->find($id);
        return $attribute->delete();
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
