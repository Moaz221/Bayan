import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://bayan-gray.vercel.app';
const DEFAULT_TITLE = 'Bayan | منصة تعليمية ذكية للطلاب';
const DEFAULT_DESCRIPTION = 'Bayan منصة تعليمية متكاملة تقدم دروسًا، اختبارات، ومحتوى مخصص للطلاب في المرحلة الثانوية.';
const DEFAULT_IMAGE = '/favicon.svg';

const normalizeUrl = (url) => {
  if (!url) return SITE_URL;
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  schema,
}) => {
  const pageTitle = title;
  const pageDescription = description;
  const pageCanonical = normalizeUrl(canonical);
  const pageImage = normalizeUrl(image);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageCanonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageCanonical} />
      <meta property="og:image" content={pageImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}
      {schema ? <script type="application/ld+json">{JSON.stringify(schema)}</script> : null}
    </Helmet>
  );
};

export default Seo;
