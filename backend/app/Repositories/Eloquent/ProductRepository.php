<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Str;

class ProductRepository implements ProductRepositoryInterface
{
    protected $model;

    public function __construct(Product $model)
    {
        $this->model = $model;
    }

    private function applyFilters($query, array $filters)
    {
        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('sku', 'like', '%' . $filters['search'] . '%');
            });
        }
        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        return $query;
    }

    public function all(array $filters = [])
    {
        $query = $this->model->with(['category', 'brand']);
        return $this->applyFilters($query, $filters)->orderBy('id', 'desc')->get();
    }

    public function paginate($perPage = 15, array $filters = [])
    {
        $query = $this->model->with(['category', 'brand']);
        return $this->applyFilters($query, $filters)->orderBy('id', 'desc')->paginate($perPage);
    }

    public function find($id)
    {
        return $this->model->with(['category', 'brand', 'subCategory', 'variants', 'images', 'usedPhoneDetails', 'seo'])->findOrFail($id);
    }

    public function create(array $data)
    {
        $product = $this->model->create($data);
        if (isset($data['product_variants']) && is_array($data['product_variants'])) {
            $product->variants()->createMany($data['product_variants']);
        }
        
        if (isset($data['type']) && $data['type'] === 'used' && isset($data['used_phone_details'])) {
            $product->usedPhoneDetails()->create($data['used_phone_details']);
        }

        if (isset($data['seo']) && is_array($data['seo'])) {
            $product->seo()->create($data['seo']);
        }
        
        return $product;
    }

    public function update($id, array $data)
    {
        $product = $this->find($id);
        $product->update($data);
        
        if (isset($data['product_variants']) && is_array($data['product_variants'])) {
            $product->variants()->delete();
            $product->variants()->createMany($data['product_variants']);
        }
        
        if (isset($data['type']) && $data['type'] === 'used') {
            if (isset($data['used_phone_details'])) {
                if ($product->usedPhoneDetails) {
                    $product->usedPhoneDetails()->update($data['used_phone_details']);
                } else {
                    $product->usedPhoneDetails()->create($data['used_phone_details']);
                }
            }
        } else {
            // If type is no longer used, remove details
            if ($product->usedPhoneDetails) {
                $product->usedPhoneDetails()->delete();
            }
        }

        if (isset($data['seo']) && is_array($data['seo'])) {
            if ($product->seo) {
                $product->seo()->update($data['seo']);
            } else {
                $product->seo()->create($data['seo']);
            }
        }
        
        return $product;
    }

    public function delete($id)
    {
        $product = $this->find($id);
        return $product->delete();
    }

    public function forceDelete($id)
    {
        $product = $this->model->withTrashed()->findOrFail($id);
        return $product->forceDelete();
    }

    public function restore($id)
    {
        $product = $this->model->withTrashed()->findOrFail($id);
        return $product->restore();
    }

    public function getTrashed($perPage = 15, array $filters = [])
    {
        $query = $this->model->onlyTrashed()->with(['category', 'brand']);
        return $this->applyFilters($query, $filters)->orderBy('id', 'desc')->paginate($perPage);
    }
}
