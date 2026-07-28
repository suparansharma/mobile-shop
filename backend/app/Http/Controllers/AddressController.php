<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();
        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:shipping,billing',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string',
            'zone' => 'nullable|string',
            'is_default' => 'boolean'
        ]);

        if ($request->is_default) {
            $request->user()->addresses()->where('type', $request->type)->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($request->all());

        // If it's the first address of this type, make it default
        if ($request->user()->addresses()->where('type', $request->type)->count() === 1) {
            $address->update(['is_default' => true]);
        }

        return response()->json([
            'message' => 'Address created successfully',
            'address' => $address
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $request->validate([
            'type' => 'sometimes|in:shipping,billing',
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'zone' => 'nullable|string',
            'is_default' => 'boolean'
        ]);

        if ($request->is_default && !$address->is_default) {
            $type = $request->type ?? $address->type;
            $request->user()->addresses()->where('type', $type)->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($request->all());

        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }
}
