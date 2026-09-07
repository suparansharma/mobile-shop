import { fetchProducts, fetchCategories } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page as string) : 1;
  const category = resolvedSearchParams?.category as string;
  const search = resolvedSearchParams?.search as string;

  let queryStr = `?page=${page}`;
  if (category) queryStr += `&category=${category}`;
  if (search) queryStr += `&search=${search}`;

  const productsResponse = await fetchProducts(queryStr);
  const categories = await fetchCategories();
  
  const products = productsResponse.data || [];
  const current_page = productsResponse.current_page || 1;
  const last_page = productsResponse.last_page || 1;

  const buildPageUrl = (p: number) => {
    let url = `/shop?page=${p}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search}`;
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>
            
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/shop" className={`font-medium ${!category ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}>
                    All Products
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link href={`/shop?category=${cat.slug}`} className={`transition-colors ${category === cat.slug ? 'text-orange-500 font-medium' : 'text-gray-600 hover:text-orange-500'}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {category ? categories.find((c: any) => c.slug === category)?.name || 'Products' : 'All Products'}
            </h1>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => {
                const thumbnail = product.images?.find((img: any) => img.is_thumbnail)?.image_path || product.images?.[0]?.image_path;
                const imageUrl = thumbnail ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${thumbnail}` : null;
                
                return (
                  <Link href={`/product/${product.slug}`} key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full overflow-hidden">
                    <div className="h-56 bg-gray-50 relative overflow-hidden flex items-center justify-center p-4">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-gray-300 group-hover:scale-105 transition-transform duration-500">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      
                      {product.discount_price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">SALE</span>
                      )}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{product.category?.name || 'Uncategorized'}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                        <div>
                          {product.discount_price ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">${product.discount_price}</span>
                              <span className="text-sm text-gray-400 line-through ml-2">${product.price}</span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">${product.price}</span>
                          )}
                        </div>
                        <span className="bg-orange-950 text-orange-500 p-2 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {last_page > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center gap-2">
                {current_page > 1 ? (
                  <Link href={buildPageUrl(current_page - 1)} className="px-4 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">Previous</Link>
                ) : (
                  <button className="px-4 py-2 border border-gray-200 rounded-md text-gray-500 opacity-50 cursor-not-allowed" disabled>Previous</button>
                )}
                
                {[...Array(last_page)].map((_, i) => (
                  <Link 
                    key={i + 1} 
                    href={buildPageUrl(i + 1)} 
                    className={`px-4 py-2 rounded-md ${current_page === i + 1 ? 'bg-orange-500 text-white font-medium' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </Link>
                ))}

                {current_page < last_page ? (
                  <Link href={buildPageUrl(current_page + 1)} className="px-4 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">Next</Link>
                ) : (
                  <button className="px-4 py-2 border border-gray-200 rounded-md text-gray-500 opacity-50 cursor-not-allowed" disabled>Next</button>
                )}
              </nav>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
