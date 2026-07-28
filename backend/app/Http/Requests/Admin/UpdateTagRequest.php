<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTagRequest extends FormRequest
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
        $id = $this->route('tag');
        return [
            'name' => 'required|string|max:255|unique:tags,name,' . $id,
            'status' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
