<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        // For admin or user to see their reviews
        $reviews = $request->user()->reviews()->with('product')->get();
        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        // Check if user already reviewed this product
        $existing = $request->user()->reviews()->where('product_id', $request->product_id)->first();
        if ($existing) {
            return response()->json([
                'message' => 'You have already reviewed this product.',
                'review' => $existing
            ], 400);
        }

        $review = $request->user()->reviews()->create([
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending' // default status
        ]);

        return response()->json([
            'message' => 'Review submitted successfully and is pending approval.',
            'review' => $review
        ], 201);
    }
}
