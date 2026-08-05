<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\WishlistService;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    protected $wishlistService;

    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    public function statistics()
    {
        return response()->json($this->wishlistService->getAdminStatistics());
    }

    public function mostWishlisted(Request $request)
    {
        $limit = $request->query('limit', 10);
        return response()->json($this->wishlistService->getAdminMostWishlisted($limit));
    }
}
