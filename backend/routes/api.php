<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicApiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Public Endpoints
    Route::get('/home', [PublicApiController::class, 'homeData']);
    Route::get('/categories', [PublicApiController::class, 'categories']);
    Route::get('/categories/tree', [PublicApiController::class, 'categoryTree']);
    Route::get('/categories/{slug}', [PublicApiController::class, 'categoryDetails']);
    Route::get('/brands', [PublicApiController::class, 'brands']);
    Route::get('/brands/{slug}', [PublicApiController::class, 'brandDetails']);
    Route::get('/products', [PublicApiController::class, 'products']);
    Route::get('/products/{slug}', [PublicApiController::class, 'productDetails']);
    Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']); // Guest checkout allowed

    // Admin Routes (To be protected by auth middleware later, currently public for development)
    Route::prefix('admin')->group(function () {
        // Brands
        Route::post('brands/bulk-delete', [BrandController::class, 'bulkDelete']);
        Route::post('brands/bulk-status', [BrandController::class, 'bulkStatus']);
        Route::apiResource('brands', BrandController::class);
        
        // Categories
        Route::post('categories/bulk-delete', [CategoryController::class, 'bulkDelete']);
        Route::post('categories/bulk-status', [CategoryController::class, 'bulkStatusChange']);
        Route::get('categories/tree', [CategoryController::class, 'tree']);
        Route::apiResource('categories', CategoryController::class);

        // Attributes
        Route::post('attributes/bulk-delete', [\App\Http\Controllers\Admin\AttributeController::class, 'bulkDelete']);
        Route::post('attributes/bulk-status', [\App\Http\Controllers\Admin\AttributeController::class, 'bulkStatusChange']);
        Route::apiResource('attributes', \App\Http\Controllers\Admin\AttributeController::class);

        // Tags
        Route::post('tags/bulk-delete', [\App\Http\Controllers\Admin\TagController::class, 'bulkDelete']);
        Route::post('tags/bulk-status', [\App\Http\Controllers\Admin\TagController::class, 'bulkStatusChange']);
        Route::apiResource('tags', \App\Http\Controllers\Admin\TagController::class);

        // Products
        Route::get('products/trashed', [\App\Http\Controllers\Admin\ProductController::class, 'trashed']);
        Route::post('products/{id}/duplicate', [\App\Http\Controllers\Admin\ProductController::class, 'duplicate']);
        Route::post('products/{id}/restore', [\App\Http\Controllers\Admin\ProductController::class, 'restore']);
        Route::apiResource('products', \App\Http\Controllers\Admin\ProductController::class);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        // Profile & Features
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::apiResource('addresses', AddressController::class);
        Route::apiResource('wishlist', WishlistController::class)->except(['show', 'update']);
        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::get('/reviews', [ReviewController::class, 'index']);
        
        Route::get('/my-orders', [\App\Http\Controllers\OrderController::class, 'myOrders']);
        
        // Admin Endpoints (Require Auth)
        Route::prefix('admin_secure')->group(function () {
            Route::apiResource('attributes', AttributeController::class);
            Route::apiResource('products', ProductController::class);
            Route::apiResource('orders', OrderController::class)->except(['store', 'destroy']);
        });
    });
});
