"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  fetchProductById, 
  updateProduct,
  uploadProductImages,
  deleteProductImage,
  reorderProductImages,
  setProductImageThumbnail
} from '@/lib/api/products';
import { fetchAdminCategories } from '@/lib/api/categories';
import { fetchBrands } from '@/lib/api/brands';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id ? parseInt(params.id as string) : null;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Data for selects
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Images state
  const [images, setImages] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    type: 'new',
    category_id: '',
    sub_category_id: '',
    brand_id: '',
    short_description: '',
    long_description: '',
    price: 0,
    discount_price: '',
    stock: 0,
    status: true,
    is_featured: false,
    is_trending: false,
    is_popular: false,
    is_best_seller: false,
    publish_date: '',
    meta_title: '',
    meta_description: '',
    specifications: [] as { key: string, value: string }[],
    product_variants: [] as { sku: string, barcode: string, buying_price: number, selling_price: number, discount_price: number, stock: number, attributes: any }[],
    used_phone_details: {
      imei: '', battery_health: '', screen_condition: '', frame_condition: '', back_panel_condition: '',
      face_id: true, fingerprint: true, repair_history: '', original_box: false, original_charger: false,
      purchase_date: '', warranty_remaining: ''
    },
    seo: {
      meta_title: '', meta_description: '', canonical_url: '',
      og_title: '', og_description: '', twitter_title: '', twitter_description: ''
    }
  });

  const loadData = async () => {
    if (!productId) return;
    try {
      const [product, catsRes, brandsRes] = await Promise.all([
        fetchProductById(productId),
        fetchAdminCategories(1, 1000 as any),
        fetchBrands(1, 1000 as any)
      ]);
      
      setCategories(catsRes.data || []);
      setBrands(brandsRes.data || []);
      
      // Set images sorted by sort_order
      let prodImages = Array.isArray(product.images) ? product.images : [];
      prodImages.sort((a: any, b: any) => a.sort_order - b.sort_order);
      setImages(prodImages);
      
      // Populate form data
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        type: product.type || 'new',
        category_id: product.category_id || '',
        sub_category_id: product.sub_category_id || '',
        brand_id: product.brand_id || '',
        short_description: product.short_description || '',
        long_description: product.long_description || '',
        price: product.price || 0,
        discount_price: product.discount_price || '',
        stock: product.stock || 0,
        status: !!product.status,
        is_featured: !!product.is_featured,
        is_trending: !!product.is_trending,
        is_popular: !!product.is_popular,
        is_best_seller: !!product.is_best_seller,
        publish_date: product.publish_date ? new Date(product.publish_date).toISOString().slice(0, 16) : '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        specifications: Array.isArray(product.specifications) ? product.specifications : [],
        product_variants: Array.isArray(product.variants) ? product.variants : [],
        used_phone_details: product.used_phone_details ? {
          imei: product.used_phone_details.imei || '',
          battery_health: product.used_phone_details.battery_health || '',
          screen_condition: product.used_phone_details.screen_condition || '',
          frame_condition: product.used_phone_details.frame_condition || '',
          back_panel_condition: product.used_phone_details.back_panel_condition || '',
          face_id: product.used_phone_details.face_id ?? true,
          fingerprint: product.used_phone_details.fingerprint ?? true,
          repair_history: product.used_phone_details.repair_history || '',
          original_box: product.used_phone_details.original_box ?? false,
          original_charger: product.used_phone_details.original_charger ?? false,
          purchase_date: product.used_phone_details.purchase_date ? new Date(product.used_phone_details.purchase_date).toISOString().slice(0, 10) : '',
          warranty_remaining: product.used_phone_details.warranty_remaining || ''
        } : {
          imei: '', battery_health: '', screen_condition: '', frame_condition: '', back_panel_condition: '',
          face_id: true, fingerprint: true, repair_history: '', original_box: false, original_charger: false,
          purchase_date: '', warranty_remaining: ''
        },
        seo: product.seo ? {
          meta_title: product.seo.meta_title || '',
          meta_description: product.seo.meta_description || '',
          canonical_url: product.seo.canonical_url || '',
          og_title: product.seo.og_title || '',
          og_description: product.seo.og_description || '',
          twitter_title: product.seo.twitter_title || '',
          twitter_description: product.seo.twitter_description || ''
        } : {
          meta_title: product.meta_title || '', 
          meta_description: product.meta_description || '', 
          canonical_url: '', og_title: '', og_description: '', twitter_title: '', twitter_description: ''
        }
      });
      
    } catch(e) {
      toast.error('Failed to load product data');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUsedPhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, used_phone_details: { ...prev.used_phone_details, [name]: checked } }));
    } else {
      setFormData(prev => ({ ...prev, used_phone_details: { ...prev.used_phone_details, [name]: value } }));
    }
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, seo: { ...prev.seo, [name]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setLoading(true);
    
    const dataToSend = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      sub_category_id: formData.sub_category_id ? parseInt(formData.sub_category_id) : null,
      brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
      price: parseFloat(formData.price.toString()),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price.toString()) : null,
      stock: parseInt(formData.stock.toString()),
      specifications: formData.specifications,
      product_variants: formData.product_variants,
      used_phone_details: formData.type === 'used' ? formData.used_phone_details : null,
      seo: formData.seo
    };
    
    try {
      await updateProduct(productId, dataToSend);
      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch(err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Methods
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!productId || acceptedFiles.length === 0) return;
    setUploadingImages(true);
    try {
      const res = await uploadProductImages(productId, acceptedFiles);
      toast.success('Images uploaded successfully');
      setImages(prev => [...prev, ...res.images].sort((a, b) => a.sort_order - b.sort_order));
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  }, [productId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteProductImage(imageId);
      toast.success('Image deleted');
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err: any) {
      toast.error('Failed to delete image');
    }
  };

  const handleSetThumbnail = async (imageId: number) => {
    try {
      await setProductImageThumbnail(imageId);
      toast.success('Thumbnail updated');
      setImages(prev => prev.map(img => ({ ...img, is_thumbnail: img.id === imageId })));
    } catch (err: any) {
      toast.error('Failed to set thumbnail');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !productId) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update UI
    const updatedItems = items.map((item, index) => ({ ...item, sort_order: index }));
    setImages(updatedItems);

    try {
      await reorderProductImages(productId, updatedItems.map(item => item.id));
    } catch (err) {
      toast.error('Failed to reorder images');
      loadData(); // Revert on failure
    }
  };

  // Specification & Variant helpers omitted for brevity but preserved structure
  const addSpecification = () => setFormData(p => ({ ...p, specifications: [...p.specifications, { key: '', value: '' }] }));
  const updateSpecification = (i: number, f: 'key' | 'value', v: string) => {
    const s = [...formData.specifications]; s[i][f] = v;
    setFormData(p => ({ ...p, specifications: s }));
  };
  const removeSpecification = (i: number) => setFormData(p => ({ ...p, specifications: p.specifications.filter((_, ix) => ix !== i) }));
  const moveSpecification = (i: number, d: 'up' | 'down') => {
    if ((d === 'up' && i === 0) || (d === 'down' && i === formData.specifications.length - 1)) return;
    const s = [...formData.specifications]; const t = d === 'up' ? i - 1 : i + 1;
    [s[i], s[t]] = [s[t], s[i]]; setFormData(p => ({ ...p, specifications: s }));
  };

  const addVariant = () => setFormData(p => ({ ...p, product_variants: [...p.product_variants, { sku: '', barcode: '', buying_price: 0, selling_price: 0, discount_price: 0, stock: 0, attributes: {} }] }));
  const updateVariant = (i: number, f: string, v: any) => {
    const s = [...formData.product_variants]; (s[i] as any)[f] = v; setFormData(p => ({ ...p, product_variants: s }));
  };
  const updateVariantAttribute = (i: number, k: string, v: string) => {
    const s = [...formData.product_variants]; if (!s[i].attributes) s[i].attributes = {};
    s[i].attributes = { ...s[i].attributes, [k]: v }; setFormData(p => ({ ...p, product_variants: s }));
  };
  const removeVariant = (i: number) => setFormData(p => ({ ...p, product_variants: p.product_variants.filter((_, ix) => ix !== i) }));

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 transition bg-white p-2 rounded-full border shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition shadow-sm flex items-center"
        >
          {loading ? 'Saving...' : 'Update Product'}
        </button>
      </div>

      {/* Image Management Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Product Images</h2>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive ? 'border-orange-9500 bg-orange-950' : 'border-gray-300 hover:border-orange-500 bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          {uploadingImages ? (
            <div className="text-orange-500 font-medium">Uploading images...</div>
          ) : isDragActive ? (
            <p className="text-orange-500 font-medium">Drop the images here ...</p>
          ) : (
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-gray-600">Drag & drop some images here, or click to select files</p>
              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="product-images" direction="horizontal">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-4"
                >
                  {images.map((image, index) => (
                    <Draggable key={image.id.toString()} draggableId={image.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative group w-32 h-32 rounded-lg border-2 overflow-hidden ${
                            image.is_thumbnail ? 'border-orange-9500 shadow-md' : 'border-gray-200'
                          } ${snapshot.isDragging ? 'shadow-xl scale-105 z-10' : ''}`}
                        >
                          <img 
                            src={getImageUrl(image.image_path)} 
                            alt={`Product image ${index}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Overlay Controls */}
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); handleDeleteImage(image.id); }}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                                title="Delete Image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                            <div className="flex justify-center">
                              {!image.is_thumbnail && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); handleSetThumbnail(image.id); }}
                                  className="bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded shadow-sm hover:bg-gray-100"
                                >
                                  Set Thumbnail
                                </button>
                              )}
                              {image.is_thumbnail && (
                                <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded shadow-sm">
                                  Thumbnail
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows={2} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                <textarea name="long_description" value={formData.long_description} onChange={handleChange} rows={5} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500"></textarea>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price ($) *</label>
                <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price ($)</label>
                <input type="number" step="0.01" min="0" name="discount_price" value={formData.discount_price} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" />
              </div>
            </div>
          </div>

          {/* Comprehensive SEO Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Search Engine Optimization & Social</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input type="text" name="meta_title" value={formData.seo.meta_title} onChange={handleSeoChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" placeholder="Overrides product name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea name="meta_description" value={formData.seo.meta_description} onChange={handleSeoChange} rows={2} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" placeholder="Overrides short description"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                <input type="url" name="canonical_url" value={formData.seo.canonical_url} onChange={handleSeoChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Open Graph (Facebook/LinkedIn)</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">OG Title</label>
                  <input type="text" name="og_title" value={formData.seo.og_title} onChange={handleSeoChange} className="w-full p-2 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">OG Description</label>
                  <textarea name="og_description" value={formData.seo.og_description} onChange={handleSeoChange} rows={2} className="w-full p-2 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm"></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Twitter Card</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Twitter Title</label>
                  <input type="text" name="twitter_title" value={formData.seo.twitter_title} onChange={handleSeoChange} className="w-full p-2 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Twitter Description</label>
                  <textarea name="twitter_description" value={formData.seo.twitter_description} onChange={handleSeoChange} rows={2} className="w-full p-2 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Specifications */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
              <button type="button" onClick={addSpecification} className="text-sm font-medium text-orange-500 bg-orange-950 px-3 py-1.5 rounded-lg hover:bg-orange-900 transition">
                + Add Spec
              </button>
            </div>
            
            {formData.specifications.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No specifications added yet. Click "+ Add Spec" to add dynamic features (e.g. Display, RAM).
              </div>
            ) : (
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => moveSpecification(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-orange-500 disabled:opacity-30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                      </button>
                      <button type="button" onClick={() => moveSpecification(index, 'down')} disabled={index === formData.specifications.length - 1} className="text-gray-400 hover:text-orange-500 disabled:opacity-30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Key (e.g. RAM)" value={spec.key} onChange={(e) => updateSpecification(index, 'key', e.target.value)} required className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      <input type="text" placeholder="Value (e.g. 8GB)" value={spec.value} onChange={(e) => updateSpecification(index, 'value', e.target.value)} required className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                    </div>
                    <button type="button" onClick={() => removeSpecification(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Used Phone Details Section */}
          {formData.type === 'used' && (
            <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-200">
              <h2 className="text-lg font-bold text-amber-900 mb-4 border-b border-amber-200 pb-2">Used Phone Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">IMEI</label>
                  <input type="text" name="imei" value={formData.used_phone_details.imei} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Battery Health (%)</label>
                  <input type="number" min="0" max="100" name="battery_health" value={formData.used_phone_details.battery_health} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Screen Condition</label>
                  <select name="screen_condition" value={formData.used_phone_details.screen_condition} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white">
                    <option value="">Select...</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Frame Condition</label>
                  <select name="frame_condition" value={formData.used_phone_details.frame_condition} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white">
                    <option value="">Select...</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Back Panel Condition</label>
                  <select name="back_panel_condition" value={formData.used_phone_details.back_panel_condition} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white">
                    <option value="">Select...</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Purchase Date</label>
                  <input type="date" name="purchase_date" value={formData.used_phone_details.purchase_date} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Warranty Remaining</label>
                  <input type="text" name="warranty_remaining" placeholder="e.g. 6 Months" value={formData.used_phone_details.warranty_remaining} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white" />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mb-4 p-4 bg-amber-100 rounded-lg border border-amber-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="face_id" checked={formData.used_phone_details.face_id} onChange={handleUsedPhoneChange} className="rounded text-amber-600 focus:ring-amber-500 h-5 w-5" />
                  <span className="text-amber-900 font-medium text-sm">Face ID Working</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="fingerprint" checked={formData.used_phone_details.fingerprint} onChange={handleUsedPhoneChange} className="rounded text-amber-600 focus:ring-amber-500 h-5 w-5" />
                  <span className="text-amber-900 font-medium text-sm">Fingerprint Working</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="original_box" checked={formData.used_phone_details.original_box} onChange={handleUsedPhoneChange} className="rounded text-amber-600 focus:ring-amber-500 h-5 w-5" />
                  <span className="text-amber-900 font-medium text-sm">Original Box Included</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="original_charger" checked={formData.used_phone_details.original_charger} onChange={handleUsedPhoneChange} className="rounded text-amber-600 focus:ring-amber-500 h-5 w-5" />
                  <span className="text-amber-900 font-medium text-sm">Original Charger Included</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">Repair History</label>
                <textarea name="repair_history" rows={3} placeholder="List any parts changed or repaired..." value={formData.used_phone_details.repair_history} onChange={handleUsedPhoneChange} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white"></textarea>
              </div>
            </div>
          )}

          {/* Dynamic Variants */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Product Variants</h2>
              <button type="button" onClick={addVariant} className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                + Add Variant
              </button>
            </div>
            
            {formData.product_variants.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No variants added. Click "+ Add Variant" to add options like Color or RAM.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.product_variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 relative">
                    <button type="button" onClick={() => removeVariant(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                        <input type="text" placeholder="e.g. Black" value={variant.attributes?.['Color'] || ''} onChange={(e) => updateVariantAttribute(index, 'Color', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">RAM</label>
                        <input type="text" placeholder="e.g. 8GB" value={variant.attributes?.['RAM'] || ''} onChange={(e) => updateVariantAttribute(index, 'RAM', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Storage</label>
                        <input type="text" placeholder="e.g. 256GB" value={variant.attributes?.['Storage'] || ''} onChange={(e) => updateVariantAttribute(index, 'Storage', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" value={variant.sku || ''} onChange={(e) => updateVariant(index, 'sku', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                        <input type="number" value={variant.stock || 0} onChange={(e) => updateVariant(index, 'stock', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Buying Price</label>
                        <input type="number" step="0.01" value={variant.buying_price || 0} onChange={(e) => updateVariant(index, 'buying_price', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price *</label>
                        <input type="number" step="0.01" required value={variant.selling_price || 0} onChange={(e) => updateVariant(index, 'selling_price', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount Price</label>
                        <input type="number" step="0.01" value={variant.discount_price || ''} onChange={(e) => updateVariant(index, 'discount_price', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
                <select required name="type" value={formData.type} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 bg-white">
                  <option value="new">New Phone</option>
                  <option value="used">Used Phone</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 bg-white">
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select name="brand_id" value={formData.brand_id} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 bg-white">
                  <option value="">Select Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Status & Visibility</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50 transition">
                <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-5 w-5" />
                <span className="text-gray-900 font-medium">Active</span>
              </label>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-1">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-4 w-4" />
                  <span className="text-gray-700 text-sm font-medium">Featured</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-1">
                  <input type="checkbox" name="is_trending" checked={formData.is_trending} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-4 w-4" />
                  <span className="text-gray-700 text-sm font-medium">Trending</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-1">
                  <input type="checkbox" name="is_popular" checked={formData.is_popular} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-4 w-4" />
                  <span className="text-gray-700 text-sm font-medium">Popular</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-1">
                  <input type="checkbox" name="is_best_seller" checked={formData.is_best_seller} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-4 w-4" />
                  <span className="text-gray-700 text-sm font-medium">Best Seller</span>
                </label>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                <input type="datetime-local" name="publish_date" value={formData.publish_date} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
