import { fetchBrandDetails } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const brand = await fetchBrandDetails(resolvedParams.slug);

  if (!brand) {
    return {
      title: 'Brand Not Found',
    }
  }

  return {
    title: `${brand.name} Products | Gadget & Parrk`,
    description: `Shop the latest ${brand.name} devices, phones, and accessories.`,
    alternates: {
      canonical: `/brands/${brand.slug}`,
    }
  }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const brand = await fetchBrandDetails(resolvedParams.slug);

  if (!brand) {
    notFound();
  }

  const products = brand.products || [];
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const logoUrl = brand.logo_path ? `${backendUrl}/storage/${brand.logo_path}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              <Link href="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              <span className="text-gray-900 font-medium ml-1 md:ml-2">{brand.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 mb-10 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        
        {logoUrl ? (
          <div className="w-32 h-32 relative mb-6">
            <Image src={logoUrl} alt={brand.name} fill className="object-contain" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-gray-400">{brand.name.substring(0, 1)}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-gray-900">{brand.name}</h1>
        <p className="text-gray-500 max-w-2xl text-lg">Official Products & Accessories</p>
      </div>

      {/* Products */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{products.length} Products Found</h2>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="text-gray-500 text-lg">No products available for this brand yet.</p>
          <Link href="/shop" className="mt-6 text-orange-500 font-medium hover:underline">Return to Shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => {
            const thumbnail = product.images?.find((img: any) => img.is_thumbnail)?.image_path || product.images?.[0]?.image_path;
            const imageUrl = thumbnail ? `${backendUrl}/storage/${thumbnail}` : null;
            
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
                    <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                    <div>
                      {product.discount_price ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">${product.discount_price}</span>
                          <span className="text-xs text-gray-400 line-through ml-2">${product.price}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      )}
                    </div>
                    <span className="bg-orange-950 text-orange-500 p-2 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
