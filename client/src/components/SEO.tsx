import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: {
    name: string;
    price: string;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    description?: string;
    image?: string;
    sku?: string;
    category?: string;
  };
}

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  product,
}: SEOProps) {
  const siteName = 'Eshaal Store';
  const defaultDescription = 'Shop the best products at Eshaal Store. Wide selection of quality items with secure Pakistani payment methods including EasyPaisa, JazzCash, and HBL Bank.';
  const defaultKeywords = 'online shopping, Pakistan, ecommerce, EasyPaisa, JazzCash, HBL, cash on delivery';

  const pageTitle = title ? `${title} | ${siteName}` : `${siteName} - Pakistani Online Shopping`;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;

  const productJsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || pageDescription,
    image: product.image,
    sku: product.sku,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'PKR',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: siteName,
      },
    },
  } : null;

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: siteName,
    description: defaultDescription,
    url: typeof window !== 'undefined' ? window.location.origin : '',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: typeof window !== 'undefined' ? `${window.location.origin}/?search={search_term_string}` : '',
      },
      'query-input': 'required name=search_term_string',
    },
    paymentAccepted: ['EasyPaisa', 'JazzCash', 'HBL Bank Transfer', 'Cash on Delivery'],
    currenciesAccepted: 'PKR',
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Product-specific Open Graph */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={product.currency || 'PKR'} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(storeJsonLd)}
      </script>
      {productJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
