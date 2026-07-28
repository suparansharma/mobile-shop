<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttributeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $id = $this->route('attribute');
        return [
            'name' => 'required|string|max:255|unique:attributes,name,' . $id,
            'status' => 'boolean',
            'values' => 'nullable|array',
            'values.*' => 'required|string|max:255',
        ];
    }
}
