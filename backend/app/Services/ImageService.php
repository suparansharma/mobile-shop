<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

class ImageService
{
    /**
     * Process and store an image.
     *
     * @param UploadedFile $file
     * @param string $path
     * @param int $width
     * @param int|null $height
     * @param int $quality
     * @return string
     */
    public function processAndStore(UploadedFile $file, $path = 'products', $width = 800, $height = null, $quality = 80)
    {
        $filename = Str::random(40) . '.webp';
        $fullPath = $path . '/' . $filename;

        // Ensure directory exists
        if (!Storage::disk('public')->exists($path)) {
            Storage::disk('public')->makeDirectory($path);
        }

        $image = Image::make($file);

        // Resize image keeping aspect ratio
        $image->resize($width, $height, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        // Convert to WebP and compress
        $image->encode('webp', $quality);

        // Save to storage
        Storage::disk('public')->put($fullPath, (string) $image);

        return $fullPath;
    }

    /**
     * Delete an image from storage.
     *
     * @param string $path
     * @return bool
     */
    public function delete($path)
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }
}
