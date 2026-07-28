<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTagRequest;
use App\Http\Requests\Admin\UpdateTagRequest;
use App\Services\TagService;
use Illuminate\Http\Request;

class TagController extends Controller
{
    protected $tagService;

    public function __construct(TagService $tagService)
    {
        $this->tagService = $tagService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'status']);
        
        if ($perPage === 'all') {
            return response()->json($this->tagService->getAllTags($filters));
        }
        return response()->json($this->tagService->getPaginatedTags($perPage, $filters));
    }

    public function store(StoreTagRequest $request)
    {
        $tag = $this->tagService->createTag($request->validated());
        return response()->json($tag, 201);
    }

    public function show($id)
    {
        return response()->json($this->tagService->getTagById($id));
    }

    public function update(UpdateTagRequest $request, $id)
    {
        $tag = $this->tagService->updateTag($id, $request->validated());
        return response()->json($tag);
    }

    public function destroy($id)
    {
        $this->tagService->deleteTag($id);
        return response()->json(null, 204);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        $this->tagService->bulkDeleteTags($request->ids);
        return response()->json(['message' => 'Tags deleted successfully']);
    }

    public function bulkStatusChange(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'status' => 'required|boolean'
        ]);
        $this->tagService->bulkUpdateStatus($request->ids, $request->status);
        return response()->json(['message' => 'Tag statuses updated successfully']);
    }
}
