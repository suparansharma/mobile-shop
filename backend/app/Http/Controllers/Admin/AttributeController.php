<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAttributeRequest;
use App\Http\Requests\Admin\UpdateAttributeRequest;
use App\Services\AttributeService;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    protected $attributeService;

    public function __construct(AttributeService $attributeService)
    {
        $this->attributeService = $attributeService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'status']);
        
        if ($perPage === 'all') {
            return response()->json($this->attributeService->getAllAttributes($filters));
        }
        return response()->json($this->attributeService->getPaginatedAttributes($perPage, $filters));
    }

    public function store(StoreAttributeRequest $request)
    {
        $attribute = $this->attributeService->createAttribute($request->validated());
        return response()->json($attribute, 201);
    }

    public function show($id)
    {
        return response()->json($this->attributeService->getAttributeById($id));
    }

    public function update(UpdateAttributeRequest $request, $id)
    {
        $attribute = $this->attributeService->updateAttribute($id, $request->validated());
        return response()->json($attribute);
    }

    public function destroy($id)
    {
        $this->attributeService->deleteAttribute($id);
        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $this->attributeService->bulkDeleteAttributes($request->ids);
        return response()->json(['message' => 'Attributes deleted successfully']);
    }

    public function bulkStatusChange(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|boolean'
        ]);
        $this->attributeService->bulkUpdateStatus($request->ids, $request->status);
        return response()->json(['message' => 'Attribute statuses updated successfully']);
    }
}
