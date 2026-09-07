"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchPublicProducts } from '@/lib/api/products';
import { fetchPublicCategories } from '@/lib/api/categories';
import { fetchPublicBrands } from '@/lib/api/brands';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filter States
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') ? searchParams.get('category')?.split(',') : [],
    brand: searchParams.get('brand') ? searchParams.get('brand')?.split(',') : [],
    type: searchParams.get('type') ? searchParams.get('type')?.split(',') : [],
    condition: searchParams.get('condition') ? searchParams.get('condition')?.split(',') : [],
    ram: searchParams.get('ram') ? searchParams.get('ram')?.split(',') : [],
    storage: searchParams.get('storage') ? searchParams.get('storage')?.split(',') : [],
    color: searchParams.get('color') ? searchParams.get('color')?.split(',') : [],
    is_featured: searchParams.get('is_featured') === 'true',
    is_trending: searchParams.get('is_trending') === 'true',
    is_best_seller: searchParams.get('is_best_seller') === 'true',
    in_stock: searchParams.get('in_stock') === 'true',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc',
  });

  // Predefined filter options
  const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const conditionOptions = ['Like New', 'Good', 'Fair', 'Poor'];

  const loadData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const activeFilters = {
        search: filters.search,
        category: filters.category?.length ? filters.category : null,
        brand: filters.brand?.length ? filters.brand : null,
        type: filters.type?.length ? filters.type : null,
        condition: filters.condition?.length ? filters.condition : null,
        ram: filters.ram?.length ? filters.ram : null,
        storage: filters.storage?.length ? filters.storage : null,
        color: filters.color?.length ? filters.color : null,
        is_featured: filters.is_featured ? true : null,
        is_trending: filters.is_trending ? true : null,
        is_best_seller: filters.is_best_seller ? true : null,
        in_stock: filters.in_stock ? true : null,
        sort: filters.sort,
        order: filters.order
      };

      const [productsRes, catsRes, brandsRes] = await Promise.all([
        fetchPublicProducts(page, 12, activeFilters),
        categories.length === 0 ? fetchPublicCategories() : Promise.resolve(categories),
        brands.length === 0 ? fetchPublicBrands() : Promise.resolve(brands)
      ]);

      setProducts(productsRes.data || []);
      setPagination({
        current_page: productsRes.current_page,
        last_page: productsRes.last_page,
        total: productsRes.total
      });

      if (categories.length === 0) setCategories(catsRes);
      if (brands.length === 0) setBrands(brandsRes);
    } catch (error) {
      console.error("Failed to load shop data", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load & URL sync
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    loadData(page);
  }, [filters, searchParams.get('page')]);

  // Load brands and categories once
  useEffect(() => {
    if (brands.length === 0) {
        fetchPublicBrands().then(res => setBrands(res)).catch(e => console.error(e));
    }
    if (categories.length === 0) {
        fetchPublicCategories().then(res => setCategories(res)).catch(e => console.error(e));
    }
  }, []);

  const updateUrl = (newFilters: any) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value && !Array.isArray(value)) {
        params.set(key, value.toString());
      }
    });

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleCheckboxChange = (group: string, value: string) => {
    setFilters(prev => {
      const current = (prev as any)[group] || [];
      const updated = current.includes(value)
        ? current.filter((item: string) => item !== value)
        : [...current, value];
      
      const newFilters = { ...prev, [group]: updated };
      updateUrl(newFilters);
      return newFilters;
    });
  };

  const handleToggleChange = (field: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: !(prev as any)[field] };
      updateUrl(newFilters);
      return newFilters;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(filters);
  };

  const clearFilters = () => {
    const reset = {
      search: '', category: [], brand: [], type: [], condition: [], ram: [], storage: [], color: [],
      is_featured: false, is_trending: false, is_best_seller: false, in_stock: false, sort: 'created_at', order: 'desc'
    };
    setFilters(reset as any);
    router.push('/products', { scroll: false });
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Filters</h2>
            <button onClick={clearFilters} className="text-sm text-orange-500 font-medium hover:text-orange-700 mb-4 inline-block">
              Clear All Filters
            </button>
          </div>

          {/* Search */}
          <div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input 
                  type="text" 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-9500 focus:border-orange-9500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
            </form>
          </div>

          {/* Type */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">Product Type</h3>
            <div className="space-y-2">
              {['new', 'used', 'accessory'].map(t => (
                <label key={t} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={(filters.type as any).includes(t)} onChange={() => handleCheckboxChange('type', t)} className="rounded text-orange-500 focus:ring-orange-9500" />
                  <span className="text-gray-700 capitalize">{t} Phone</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {categories.map(c => (
                <label key={c.id} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={(filters.category as any).includes(c.slug)} onChange={() => handleCheckboxChange('category', c.slug)} className="rounded text-orange-500 focus:ring-orange-9500" />
                  <span className="text-gray-700">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {brands.map(b => (
                <label key={b.id} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={(filters.brand as any).includes(b.slug)} onChange={() => handleCheckboxChange('brand', b.slug)} className="rounded text-orange-500 focus:ring-orange-9500" />
                  <span className="text-gray-700">{b.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* RAM & Storage (Attributes) */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">RAM</h3>
            <div className="flex flex-wrap gap-2">
              {ramOptions.map(ram => (
                <button 
                  key={ram} 
                  onClick={() => handleCheckboxChange('ram', ram)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    (filters.ram as any).includes(ram) ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  {ram}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">Storage</h3>
            <div className="flex flex-wrap gap-2">
              {storageOptions.map(storage => (
                <button 
                  key={storage} 
                  onClick={() => handleCheckboxChange('storage', storage)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    (filters.storage as any).includes(storage) ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  {storage}
                </button>
              ))}
            </div>
          </div>

          {/* Used Condition */}
          {(filters.type as any).includes('used') && (
            <div className="border-t pt-6">
              <h3 className="font-bold text-gray-900 mb-3">Condition (Used)</h3>
              <div className="space-y-2">
                {conditionOptions.map(c => (
                  <label key={c} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={(filters.condition as any).includes(c)} onChange={() => handleCheckboxChange('condition', c)} className="rounded text-orange-500 focus:ring-orange-9500" />
                    <span className="text-gray-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">More Filters</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={filters.in_stock} onChange={() => handleToggleChange('in_stock')} className="rounded text-green-500 focus:ring-green-500 w-5 h-5" />
                <span className="text-gray-900 font-medium text-sm">In Stock Only</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={filters.is_featured} onChange={() => handleToggleChange('is_featured')} className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4" />
                <span className="text-gray-700 text-sm">Featured</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={filters.is_trending} onChange={() => handleToggleChange('is_trending')} className="rounded text-orange-9500 focus:ring-orange-9500 w-4 h-4" />
                <span className="text-gray-700 text-sm">Trending</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {pagination.total} Products Found
            </h1>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={`${filters.sort}-${filters.order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  const newFilters = { ...filters, sort, order };
                  setFilters(newFilters as any);
                  updateUrl(newFilters);
                }}
                className="border border-gray-300 rounded-lg text-sm p-2 focus:ring-orange-9500 focus:border-orange-9500 outline-none"
              >
                <option value="created_at-desc">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse flex flex-col bg-white rounded-2xl p-4 h-80 border border-gray-100">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                  const thumb = product.images?.find((img: any) => img.is_thumbnail) || product.images?.[0];
                  return (
                    <Link href={`/products/${product.slug}`} key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-800 hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-square p-6 bg-gray-50 group-hover:bg-orange-950/30 transition-colors">
                        {thumb ? (
                          <img src={getImageUrl(thumb.image_path)} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        )}
                        {product.discount_price && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            SALE
                          </div>
                        )}
                        {product.type === 'used' && (
                          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            USED
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="text-xs font-bold text-orange-500 mb-1 uppercase tracking-wider">{product.brand?.name}</div>
                          <h3 className="text-gray-900 font-bold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">{product.name}</h3>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {product.discount_price ? (
                              <>
                                <span className="text-lg font-black text-gray-900">${product.discount_price}</span>
                                <span className="text-sm font-medium text-gray-400 line-through">${product.price}</span>
                              </>
                            ) : (
                              <span className="text-lg font-black text-gray-900">${product.price}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  <button 
                    disabled={pagination.current_page === 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(pagination.current_page - 1));
                      router.push(`/products?${params.toString()}`, { scroll: true });
                    }}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <span className="text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-lg border">Page {pagination.current_page} of {pagination.last_page}</span>
                  <button 
                    disabled={pagination.current_page === pagination.last_page}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(pagination.current_page + 1));
                      router.push(`/products?${params.toString()}`, { scroll: true });
                    }}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="bg-orange-950 text-orange-600 hover:bg-orange-900 font-medium px-4 py-2 rounded-lg transition-colors">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center p-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
