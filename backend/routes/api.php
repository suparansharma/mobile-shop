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
        Route::get('products/export', [\App\Http\Controllers\Admin\ProductController::class, 'export']);
        Route::post('products/import', [\App\Http\Controllers\Admin\ProductController::class, 'import']);
        Route::get('products/trashed', [\App\Http\Controllers\Admin\ProductController::class, 'trashed']);
        Route::post('products/{id}/duplicate', [\App\Http\Controllers\Admin\ProductController::class, 'duplicate']);
        Route::post('products/{id}/restore', [\App\Http\Controllers\Admin\ProductController::class, 'restore']);
        
        // Product Images
        Route::get('products/{id}/images', [\App\Http\Controllers\Admin\ProductImageController::class, 'index']);
        Route::post('products/{id}/images', [\App\Http\Controllers\Admin\ProductImageController::class, 'store']);
        Route::post('products/{id}/images/reorder', [\App\Http\Controllers\Admin\ProductImageController::class, 'reorder']);
        Route::delete('products/images/{imageId}', [\App\Http\Controllers\Admin\ProductImageController::class, 'destroy']);
        Route::put('products/images/{imageId}/thumbnail', [\App\Http\Controllers\Admin\ProductImageController::class, 'setThumbnail']);

        // Inventory
        Route::get('inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index']);
        Route::post('inventory/adjust', [\App\Http\Controllers\Admin\InventoryController::class, 'adjustStock']);
        Route::get('inventory/history', [\App\Http\Controllers\Admin\InventoryController::class, 'history']);

        // Orders
        Route::get('orders', [\App\Http\Controllers\Admin\OrderController::class, 'index']);
        Route::get('orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'show']);
        Route::put('orders/{id}/status', [\App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
        Route::post('orders/{id}/cancel', [\App\Http\Controllers\Admin\OrderController::class, 'cancel']);

        Route::post('/cart/sync', [\App\Http\Controllers\Api\V1\CartController::class, 'sync']);
        
        Route::apiResource('products', \App\Http\Controllers\Admin\ProductController::class);
    });

    // Checkout Route (Accessible to Guests and Authenticated Users)
    Route::post('/checkout', [\App\Http\Controllers\Api\V1\CheckoutController::class, 'process']);
    
    Route::middleware('auth:sanctum')->group(function () {
        // User Orders
        Route::get('/user/orders', [\App\Http\Controllers\Api\V1\UserOrderController::class, 'index']);
        Route::get('/user/orders/{order_number}', [\App\Http\Controllers\Api\V1\UserOrderController::class, 'show']);

        // Cart Routes
        Route::prefix('cart')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\CartController::class, 'index']);
            Route::post('/add', [\App\Http\Controllers\Api\V1\CartController::class, 'add']);
            Route::put('/update/{product_id}', [\App\Http\Controllers\Api\V1\CartController::class, 'updateQuantity']);
            Route::delete('/remove/{product_id}', [\App\Http\Controllers\Api\V1\CartController::class, 'remove']);
            Route::delete('/clear', [\App\Http\Controllers\Api\V1\CartController::class, 'clear']);
            Route::post('/apply-coupon', [\App\Http\Controllers\Api\V1\CartController::class, 'applyCoupon']);
            Route::post('/sync', [\App\Http\Controllers\Api\V1\CartController::class, 'sync']);
        });

        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        // Profile & Features
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::apiResource('addresses', AddressController::class);
        Route::delete('wishlist/clear', [WishlistController::class, 'clear']);
        Route::apiResource('wishlist', WishlistController::class)->except(['show', 'update']);
        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::get('/reviews', [ReviewController::class, 'index']);
        
        Route::get('/my-orders', [\App\Http\Controllers\OrderController::class, 'myOrders']);
        
        // Admin Endpoints (Require Auth)
        Route::prefix('admin_secure')->group(function () {
            Route::apiResource('attributes', AttributeController::class);
            Route::apiResource('products', ProductController::class);
            Route::apiResource('orders', OrderController::class)->except(['store', 'destroy']);
            
            Route::get('wishlist/stats', [\App\Http\Controllers\Admin\WishlistController::class, 'statistics']);
            Route::get('wishlist/most-wishlisted', [\App\Http\Controllers\Admin\WishlistController::class, 'mostWishlisted']);
        });
    });
});
