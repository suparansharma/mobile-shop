"use client";

import { useEffect, useState, useMemo } from 'react';
import { fetchPublicProductBySlug } from '@/lib/api/products';
import { useParams } from 'next/navigation';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import WishlistButton from '@/components/wishlist/WishlistButton';
import CompareButton from '@/components/compare/CompareButton';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailsClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const addToCart = useCartStore((state) => state.addToCart);
  
  // State for selected variant attributes (e.g., { Color: 'Black', RAM: '8GB' })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  
  // Image gallery state
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchPublicProductBySlug(slug);
        
        // Sort images
        if (data.images && Array.isArray(data.images)) {
          data.images.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
        
        setProduct(data);
        
        // Set initial active image
        if (data.images && data.images.length > 0) {
          const thumb = data.images.find((img: any) => img.is_thumbnail) || data.images[0];
          setActiveImage(thumb.image_path);
        }
        
        // Auto-select the first variant if available
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedAttributes(firstVariant.attributes || {});
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Derive available options from variants
  const variantOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    if (product?.variants) {
      product.variants.forEach((v: any) => {
        if (v.attributes) {
          Object.keys(v.attributes).forEach(key => {
            if (!options[key]) options[key] = new Set();
            if (v.attributes[key]) options[key].add(v.attributes[key]);
          });
        }
      });
    }
    return options;
  }, [product]);

  // Find the matching variant based on selected attributes
  const currentVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find((v: any) => {
      if (!v.attributes) return false;
      return Object.entries(selectedAttributes).every(([key, val]) => v.attributes[key] === val);
    });
  }, [product, selectedAttributes]);

  const handleAttributeSelect = (key: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) return <div className="flex justify-center p-12">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-12">{error}</div>;
  if (!product) return null;

  const displayPrice = currentVariant ? currentVariant.selling_price : product.price;
  const displayDiscount = currentVariant ? currentVariant.discount_price : product.discount_price;
  const displayStock = currentVariant ? currentVariant.stock : product.stock;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm aspect-square overflow-hidden relative">
            {activeImage ? (
              <Zoom>
                <img 
                  src={getImageUrl(activeImage)} 
                  alt={product.name} 
                  className="w-full h-full object-contain rounded-xl"
                />
              </Zoom>
            ) : (
              <div className="text-gray-400">
                Image placeholder for {product.name}
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_path)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === img.image_path ? 'border-orange-500 shadow-md scale-105' : 'border-gray-200 hover:border-orange-500 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img.image_path)} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-orange-500 font-medium mb-2">{product.brand?.name}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-4">
            {displayDiscount ? (
              <>
                <span className="text-3xl font-bold text-gray-900">${displayDiscount}</span>
                <span className="text-xl text-gray-400 line-through">${displayPrice}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">${displayPrice}</span>
            )}
          </div>
          
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${displayStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {displayStock > 0 ? `In Stock (${displayStock})` : 'Out of Stock'}
          </div>

          <div className="text-gray-600 leading-relaxed">
            {product.short_description}
          </div>

          <hr className="border-gray-200" />

          {/* Variant Selection */}
          {Object.keys(variantOptions).length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Select Options</h3>
              
              {Object.entries(variantOptions).map(([attrKey, valuesSet]) => (
                <div key={attrKey} className="space-y-3">
                  <span className="block text-sm font-medium text-gray-700 uppercase tracking-wider">{attrKey}</span>
                  <div className="flex flex-wrap gap-3">
                    {Array.from(valuesSet).map(val => (
                      <button
                        key={val}
                        onClick={() => handleAttributeSelect(attrKey, val)}
                        className={`px-4 py-2 border-2 rounded-lg font-medium text-sm transition-all ${
                          selectedAttributes[attrKey] === val
                            ? 'border-orange-500 text-orange-500 bg-orange-950 shadow-sm'
                            : 'border-gray-200 text-gray-700 hover:border-orange-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {!currentVariant && Object.keys(selectedAttributes).length > 0 && (
                <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                  This exact combination is currently unavailable.
                </div>
              )}
            </div>
          )}

          {/* Used Phone Details */}
          {product.type === 'used' && product.used_phone_details && (
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 space-y-4">
              <h3 className="text-lg font-bold text-amber-900 border-b border-amber-200 pb-2">Used Phone Condition</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div><span className="text-amber-700 font-medium">Battery Health:</span> <span className="font-semibold">{product.used_phone_details.battery_health}%</span></div>
                <div><span className="text-amber-700 font-medium">Screen:</span> <span className="font-semibold">{product.used_phone_details.screen_condition}</span></div>
                <div><span className="text-amber-700 font-medium">Frame:</span> <span className="font-semibold">{product.used_phone_details.frame_condition}</span></div>
                <div><span className="text-amber-700 font-medium">Back Panel:</span> <span className="font-semibold">{product.used_phone_details.back_panel_condition}</span></div>
                
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-medium">Face ID:</span> 
                  {product.used_phone_details.face_id ? (
                     <span className="text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded">Working</span>
                  ) : (
                     <span className="text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded">No</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-medium">Fingerprint:</span> 
                  {product.used_phone_details.fingerprint ? (
                     <span className="text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded">Working</span>
                  ) : (
                     <span className="text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded">No</span>
                  )}
                </div>
                
                <div><span className="text-amber-700 font-medium">Box:</span> <span className="font-semibold">{product.used_phone_details.original_box ? 'Original' : 'None'}</span></div>
                <div><span className="text-amber-700 font-medium">Charger:</span> <span className="font-semibold">{product.used_phone_details.original_charger ? 'Original' : 'None'}</span></div>
              </div>
              
              {(product.used_phone_details.repair_history || product.used_phone_details.warranty_remaining) && (
                <div className="pt-3 border-t border-amber-200/50 mt-3 space-y-2 text-sm">
                  {product.used_phone_details.warranty_remaining && (
                    <div><span className="text-amber-700 font-medium">Warranty:</span> <span>{product.used_phone_details.warranty_remaining}</span></div>
                  )}
                  {product.used_phone_details.repair_history && (
                    <div><span className="text-amber-700 font-medium">Repair History:</span> <span className="italic text-gray-700">{product.used_phone_details.repair_history}</span></div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action */}
          <div className="flex gap-4">
            <button 
              disabled={displayStock <= 0 || (product.variants?.length > 0 && !currentVariant)}
              onClick={() => {
                addToCart({
                  product_id: product.id,
                  name: product.name,
                  price: displayPrice,
                  quantity: 1,
                  slug: product.slug,
                  image: product.images?.[0]?.image_path || ''
                });
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {displayStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <WishlistButton 
              product={product} 
              className="w-16 flex items-center justify-center border-2 border-gray-100 hover:border-red-200" 
              iconOnly={true} 
            />
            <CompareButton 
              product={product} 
              className="w-16 flex items-center justify-center border-2 border-gray-100 hover:border-orange-800" 
              iconOnly={true} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
