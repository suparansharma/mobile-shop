"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, productName }: { images: any[], productName: string }) {
  const [mainImage, setMainImage] = useState(
    images.find((img) => img.is_thumbnail) || images[0]
  );

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-md aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden text-gray-300">
        <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col justify-center items-center">
      {/* Main Image */}
      <div className="w-full aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden p-4">
        <Image 
          src={`${backendUrl}/storage/${mainImage.image_path}`} 
          alt={productName} 
          fill 
          className="object-contain p-4 transition-all duration-300"
        />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 mt-6 overflow-x-auto w-full px-2 py-2">
          {images.map((img) => (
            <div 
              key={img.id} 
              onClick={() => setMainImage(img)}
              className={`w-20 h-20 relative bg-white border ${mainImage.id === img.id ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-gray-200'} rounded-lg flex-shrink-0 cursor-pointer hover:border-orange-500 transition-all flex items-center justify-center overflow-hidden`}
            >
              <Image 
                src={`${backendUrl}/storage/${img.image_path}`} 
                alt={productName} 
                fill 
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
