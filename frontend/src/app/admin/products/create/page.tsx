"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '@/lib/api/products';
import { fetchAdminCategories } from '@/lib/api/categories';
import { fetchBrands } from '@/lib/api/brands';
import toast from 'react-hot-toast';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Data for selects
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    type: 'new', // new, used, accessory
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

  useEffect(() => {
    // Load categories and brands for dropdowns
    const loadDependencies = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          fetchAdminCategories(1, 1000 as any),
          fetchBrands(1, 1000 as any)
        ]);
        setCategories(catsRes.data || []);
        setBrands(brandsRes.data || []);
      } catch(e) {
        toast.error('Failed to load form dependencies');
      }
    };
    loadDependencies();
  }, []);

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
    setLoading(true);
    
    // Convert to proper types before sending
    const dataToSend = {
      ...formData,
      category_id: parseInt(formData.category_id),
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
      await createProduct(dataToSend);
      toast.success('Product created successfully!');
      router.push('/admin/products');
    } catch(err: any) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = val;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const removeSpecification = (index: number) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const moveSpecification = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.specifications.length - 1) return;
    
    const newSpecs = [...formData.specifications];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newSpecs[index];
    newSpecs[index] = newSpecs[targetIndex];
    newSpecs[targetIndex] = temp;
    
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      product_variants: [...prev.product_variants, { sku: '', barcode: '', buying_price: 0, selling_price: 0, discount_price: 0, stock: 0, attributes: {} }]
    }));
  };

  const updateVariant = (index: number, field: string, val: any) => {
    const newVariants = [...formData.product_variants];
    (newVariants[index] as any)[field] = val;
    setFormData(prev => ({ ...prev, product_variants: newVariants }));
  };
  
  const updateVariantAttribute = (index: number, attrKey: string, attrVal: string) => {
    const newVariants = [...formData.product_variants];
    newVariants[index].attributes = { ...newVariants[index].attributes, [attrKey]: attrVal };
    setFormData(prev => ({ ...prev, product_variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.product_variants.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, product_variants: newVariants }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 transition bg-white p-2 rounded-full border shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition shadow-sm flex items-center"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (takes 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" placeholder="e.g. iPhone 15 Pro Max" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU * (Must be unique)</label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" placeholder="e.g. IP15PM-256" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (Optional)</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" placeholder="e.g. 1234567890123" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows={2} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" placeholder="A brief summary of the product..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                <textarea name="long_description" value={formData.long_description} onChange={handleChange} rows={5} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500" placeholder="Detailed product description..."></textarea>
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
                        <input type="text" placeholder="e.g. Black" value={variant.attributes['Color'] || ''} onChange={(e) => updateVariantAttribute(index, 'Color', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">RAM</label>
                        <input type="text" placeholder="e.g. 8GB" value={variant.attributes['RAM'] || ''} onChange={(e) => updateVariantAttribute(index, 'RAM', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Storage</label>
                        <input type="text" placeholder="e.g. 256GB" value={variant.attributes['Storage'] || ''} onChange={(e) => updateVariantAttribute(index, 'Storage', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" value={variant.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                        <input type="number" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Buying Price</label>
                        <input type="number" step="0.01" value={variant.buying_price} onChange={(e) => updateVariant(index, 'buying_price', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price *</label>
                        <input type="number" step="0.01" required value={variant.selling_price} onChange={(e) => updateVariant(index, 'selling_price', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount Price</label>
                        <input type="number" step="0.01" value={variant.discount_price} onChange={(e) => updateVariant(index, 'discount_price', e.target.value)} className="w-full p-2 border rounded-md focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          
          {/* Organization */}
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

          {/* Status & Visibility */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Status & Visibility</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50 transition">
                <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-5 w-5" />
                <span className="text-gray-900 font-medium">Active (Visible to customers)</span>
              </label>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-1">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="rounded text-orange-500 focus:ring-orange-9500 h-4 w-4" />
                  <span className="text-gray-700 text-sm font-medium">Featured Product</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date (Optional)</label>
                <input type="datetime-local" name="publish_date" value={formData.publish_date} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-orange-9500 focus:border-orange-9500 text-sm" />
              </div>
            </div>
          </div>
          
        </div>
      </form>
    </div>
  );
}
