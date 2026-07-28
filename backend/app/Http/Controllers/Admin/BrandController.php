<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Services\BrandService;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    protected $brandService;

    public function __construct(BrandService $brandService)
    {
        $this->brandService = $brandService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'status']);
        
        if ($perPage === 'all') {
            return response()->json($this->brandService->getAllBrands());
        }
        return response()->json($this->brandService->getPaginatedBrands($perPage, $filters));
    }

    public function store(StoreBrandRequest $request)
    {
        $brand = $this->brandService->createBrand($request->validated());
        return response()->json($brand, 201);
    }

    public function show($id)
    {
        return response()->json($this->brandService->getBrandById($id));
    }

    public function update(UpdateBrandRequest $request, $id)
    {
        $brand = $this->brandService->updateBrand($id, $request->validated());
        return response()->json($brand);
    }

    public function destroy($id)
    {
        $this->brandService->deleteBrand($id);
        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $this->brandService->bulkDeleteBrands($request->ids);
        return response()->json(['message' => 'Brands deleted successfully']);
    }

    public function bulkStatusChange(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|boolean'
        ]);
        $this->brandService->bulkUpdateStatus($request->ids, $request->status);
        return response()->json(['message' => 'Brand statuses updated successfully']);
    }
}
