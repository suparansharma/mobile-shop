import { Metadata } from 'next';
import { fetchPublicProductBySlug } from '@/lib/api/products';
import ProductDetailsClient from './ProductDetailsClient';

type Props = {
  params: { slug: string };
};

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
    : 'http://localhost:8000';
  return `${baseUrl}/storage/${path}`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await fetchPublicProductBySlug(params.slug);
    if (!product) return {};

    const seo = product.seo || {};
    const title = seo.meta_title || product.name || 'Product Details';
    const description = seo.meta_description || product.short_description || '';
    
    let ogImageUrl = '';
    if (product.images && product.images.length > 0) {
      const thumb = product.images.find((img: any) => img.is_thumbnail) || product.images[0];
      ogImageUrl = getImageUrl(thumb.image_path);
    }

    return {
      title,
      description,
      alternates: {
        canonical: seo.canonical_url || `/products/${params.slug}`,
      },
      openGraph: {
        title: seo.og_title || title,
        description: seo.og_description || description,
        url: seo.canonical_url || `/products/${params.slug}`,
        type: 'website',
        images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.twitter_title || title,
        description: seo.twitter_description || description,
        images: ogImageUrl ? [ogImageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
    };
  }
}

export default async function ProductDetailsPage({ params }: Props) {
  let product = null;
  let error = null;

  try {
    product = await fetchPublicProductBySlug(params.slug);
  } catch (e: any) {
    error = e.message;
  }

  // Generate JSON-LD Schema
  let schemaHtml = null;
  if (product) {
    const price = product.discount_price || product.price;
    const stockStatus = product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
    
    let ogImageUrl = '';
    if (product.images && product.images.length > 0) {
      const thumb = product.images.find((img: any) => img.is_thumbnail) || product.images[0];
      ogImageUrl = getImageUrl(thumb.image_path);
    }

    // Product Schema
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.short_description || product.seo?.meta_description,
      "image": ogImageUrl ? [ogImageUrl] : [],
      "sku": product.sku,
      "brand": {
        "@type": "Brand",
        "name": product.brand?.name || "Unknown Brand"
      },
      "offers": {
        "@type": "Offer",
        "url": product.seo?.canonical_url || `${process.env.NEXT_PUBLIC_APP_URL || ''}/products/${params.slug}`,
        "priceCurrency": "USD",
        "price": price,
        "itemCondition": product.type === 'used' ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
        "availability": stockStatus
      }
    };

    // Breadcrumb Schema
    const breadcrumbList = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${process.env.NEXT_PUBLIC_APP_URL || ''}/`
      }
    ];

    let position = 2;
    if (product.category) {
      breadcrumbList.push({
        "@type": "ListItem",
        "position": position,
        "name": product.category.name,
        "item": `${process.env.NEXT_PUBLIC_APP_URL || ''}/categories/${product.category.slug}`
      });
      position++;
    }

    breadcrumbList.push({
      "@type": "ListItem",
      "position": position,
      "name": product.name,
      "item": product.seo?.canonical_url || `${process.env.NEXT_PUBLIC_APP_URL || ''}/products/${params.slug}`
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList
    };

    schemaHtml = `
      ${JSON.stringify(productSchema)}
      ,
      ${JSON.stringify(breadcrumbSchema)}
    `;
  }

  return (
    <>
      {schemaHtml && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: `[${schemaHtml}]` }}
        />
      )}
      <ProductDetailsClient slug={params.slug} />
    </>
  );
}
