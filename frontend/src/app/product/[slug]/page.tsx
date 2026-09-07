import { fetchProductDetails } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import ProductGallery from '@/components/product/ProductGallery';
import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchProductDetails(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const seo = product.seo || {};
  const previousImages = (await parent).openGraph?.images || []
  
  const thumbnail = product.images?.find((img: any) => img.is_thumbnail)?.image_path || product.images?.[0]?.image_path;
  const imageUrl = thumbnail ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${thumbnail}` : null;

  return {
    title: seo.title || product.name,
    description: seo.description || product.short_description || `Buy ${product.name} at the best price.`,
    alternates: {
      canonical: seo.canonical_url || `/product/${product.slug}`,
    },
    openGraph: {
      title: seo.og_title || seo.title || product.name,
      description: seo.og_description || seo.description || product.short_description,
      images: imageUrl ? [imageUrl, ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitter_title || seo.title || product.name,
      description: seo.twitter_description || seo.description || product.short_description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await fetchProductDetails(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const relatedProducts = product.related_products || [];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      {/* JSON-LD Schema */}
      {product.seo?.json_schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: product.seo.json_schema }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
            {product.category && (
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                  <Link href={`/categories/${product.category.slug}`} className="hover:text-orange-500 transition-colors">{product.category.name}</Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                <span className="text-gray-900 font-medium ml-1 md:ml-2">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Product Images */}
            <div className="lg:w-1/2 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50 flex flex-col justify-center items-center relative">
              {product.discount_price && (
                <div className="absolute top-8 left-8 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-sm">
                  SALE
                </div>
              )}
              {product.type === 'used' && (
                <div className="absolute top-8 right-8 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-sm">
                  PRE-OWNED
                </div>
              )}
              <ProductGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <div className="mb-2">
                <Link href={`/brands/${product.brand?.slug}`} className="text-orange-500 font-semibold tracking-wider uppercase text-sm hover:underline">
                  {product.brand?.name}
                </Link>
                {product.category && (
                  <span className="text-gray-500 text-sm"> • <Link href={`/categories/${product.category.slug}`} className="hover:underline">{product.category.name}</Link></span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-2">
                  {product.discount_price ? (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900">${product.discount_price}</span>
                      <span className="text-lg text-gray-400 line-through">${product.price}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold text-gray-900">${product.price}</span>
                  )}
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      In Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {product.short_description || "No short description available."}
              </p>

              {/* Variants Selection (if any) */}
              {product.variants && product.variants.length > 0 && (
                 <div className="mb-8">
                   <h3 className="font-semibold text-gray-900 mb-3">Available Options</h3>
                   <div className="flex flex-wrap gap-2">
                     {/* Just displaying available variants for now, a full selector needs a client component */}
                     {product.variants.map((v: any) => (
                       <div key={v.id} className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 bg-gray-50">
                          {Object.entries(v.attributes || {}).map(([key, val]) => `${key}: ${val}`).join(' | ')}
                          {v.additional_price > 0 && <span className="ml-2 font-medium text-orange-500">(+${v.additional_price})</span>}
                       </div>
                     ))}
                   </div>
                 </div>
              )}

              {/* Action Buttons */}
              <AddToCartButton product={product} />

              {/* SKU & Extra Info */}
              <div className="text-sm text-gray-500 space-y-2 mt-6">
                <p><strong className="text-gray-900 font-medium">SKU:</strong> {product.sku}</p>
                <p><strong className="text-gray-900 font-medium">Condition:</strong> <span className="capitalize">{product.type}</span></p>
              </div>

            </div>
          </div>
          
          {/* Detailed Info Tabs */}
          <div className="bg-white border-t border-gray-100 px-8 py-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="prose max-w-none text-gray-600">
                {product.long_description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.long_description }} />
                ) : (
                  <p>No detailed description provided for this product.</p>
                )}
              </div>
              
              {/* Specifications */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Specifications</h4>
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(product.attributes).map(([key, value]) => (
                          <tr key={key}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-100/50 w-1/3">{key}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Used Phone Details if applicable */}
            {product.type === 'used' && product.usedPhoneDetails && (
              <div className="mt-10 bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Used Condition Report
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6 gap-x-4 text-sm">
                  <div><span className="block text-gray-500">Battery Health</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.battery_health}%</span></div>
                  <div><span className="block text-gray-500">Screen Condition</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.screen_condition || '-'}</span></div>
                  <div><span className="block text-gray-500">Frame Condition</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.frame_condition || '-'}</span></div>
                  <div><span className="block text-gray-500">Back Panel</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.back_panel_condition || '-'}</span></div>
                  
                  {product.usedPhoneDetails.imei && <div><span className="block text-gray-500">IMEI</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.imei}</span></div>}
                  <div><span className="block text-gray-500">Face ID</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.face_id_status ? 'Working' : 'Not Working'}</span></div>
                  <div><span className="block text-gray-500">Fingerprint</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.fingerprint_status ? 'Working' : 'Not Working'}</span></div>
                  <div><span className="block text-gray-500">Original Box</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.original_box ? 'Yes' : 'No'}</span></div>
                  <div><span className="block text-gray-500">Original Charger</span><span className="font-medium text-gray-900">{product.usedPhoneDetails.original_charger ? 'Yes' : 'No'}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct: any) => {
                const thumb = relProduct.images?.find((img: any) => img.is_thumbnail)?.image_path || relProduct.images?.[0]?.image_path;
                const imgUrl = thumb ? `${backendUrl}/storage/${thumb}` : null;
                
                return (
                  <Link href={`/product/${relProduct.slug}`} key={relProduct.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full overflow-hidden">
                    <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center p-4">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={relProduct.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-gray-300 group-hover:scale-105 transition-transform duration-500">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors line-clamp-2">{relProduct.name}</h3>
                      </div>
                      <div className="mt-2">
                        {relProduct.discount_price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">${relProduct.discount_price}</span>
                            <span className="text-xs text-gray-400 line-through">${relProduct.price}</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">${relProduct.price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
