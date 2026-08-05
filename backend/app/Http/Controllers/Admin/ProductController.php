<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'status', 'category_id', 'brand_id', 'type']);
        
        return response()->json($this->productService->getPaginatedProducts($perPage, $filters));
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->createProduct($request->validated());
        return response()->json($product, 201);
    }

    public function show($id)
    {
        return response()->json($this->productService->getProductById($id));
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $product = $this->productService->updateProduct($id, $request->validated());
        return response()->json($product);
    }

    public function destroy($id)
    {
        $this->productService->deleteProduct($id);
        return response()->json(null, 204);
    }

    public function duplicate($id)
    {
        $product = $this->productService->duplicateProduct($id);
        return response()->json($product, 201);
    }

    public function restore($id)
    {
        $this->productService->restoreProduct($id);
        return response()->json(['message' => 'Product restored successfully']);
    }

    public function trashed(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'category_id', 'brand_id', 'type']);
        return response()->json($this->productService->getTrashedProducts($perPage, $filters));
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $fileName = 'products_export_' . now()->format('Y_m_d_His');
        
        if ($format === 'csv') {
            return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ProductsExport, $fileName . '.csv', \Maatwebsite\Excel\Excel::CSV);
        }
        
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ProductsExport, $fileName . '.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,txt'
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\ProductsImport, $request->file('file'));
            return response()->json(['message' => 'Products imported successfully.']);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }
            return response()->json(['message' => 'Validation error during import.', 'errors' => $errors], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error during import: ' . $e->getMessage()], 500);
        }
    }
}
