import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const DEFAULT_DESC = 'itemTR ile Valorant VP, PUBG UC, League of Legends RP, hesap ve dijital ürün alım satımını güvenli şekilde yap. Hızlı teslimat, güvenli ödeme, gerçek satıcılar.';
const SITE_NAME = 'itemTR';
const BASE_URL = 'https://itemtr.com';
const DEFAULT_OG = 'https://itemtr.com/itemtr-logo.svg';

export default function SEOHead({ title, description = DEFAULT_DESC, canonical, ogImage = DEFAULT_OG, noIndex = false }: SEOHeadProps) {
  const fullTitle = title.includes('itemTR') ? title : `${title} | itemTR`;
  const canonicalUrl = canonical
    ? `${BASE_URL}${canonical.startsWith('/') ? canonical : '/' + canonical}`
    : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="tr_TR" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
