// ============================================================================
// seo-schema-kit — schema.org / JSON-LD 產生器（零依賴）
// ----------------------------------------------------------------------------
// 純函式，每個產生器吃一個 props 物件、回一個乾淨的 JSON-LD plain object。
// 沒有任何相依套件、沒有框架綁定，前後端/SSR 都能用。
// 支援：Article / HowTo / Organization / LocalBusiness / ProfessionalService /
//       Breadcrumb / FAQ / WebSite / Course。
//
// 用法：
//   const seo = require('seo-schema-kit');
//   const ld = seo.generateArticleSchema({ title, description, content, url, authorName, publishedTime });
//   const tag = seo.jsonLdScript(ld);   // <script type="application/ld+json">…</script>
//   // 把 tag 塞進 <head> 即可
// ============================================================================

// ----------------------------------------------------------------------------
// Article Schema
// ----------------------------------------------------------------------------
function generateArticleSchema(props) {
  const {
    title,
    description,
    content,
    url,
    imageUrl,
    authorName,
    authorUrl,
    publishedTime,
    modifiedTime,
    category,
    tags,
    readingTime,
    wordCount,
  } = props;

  // 計算字數（如果沒提供）
  const calculatedWordCount =
    wordCount || (content ? content.replace(/<[^>]*>/g, '').length : undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: authorName, // 可由租戶設定覆蓋
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category,
    keywords: tags ? tags.join(', ') : undefined,
    wordCount: calculatedWordCount,
    timeRequired: readingTime ? `PT${readingTime}M` : undefined,
  };
}

// ----------------------------------------------------------------------------
// How-To Schema（教學文）
// ----------------------------------------------------------------------------
function generateHowToSchema(props) {
  const { name, description, url, imageUrl, steps, totalTime, estimatedCost } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    image: imageUrl,
    totalTime,
    estimatedCost: estimatedCost
      ? {
          '@type': 'MonetaryAmount',
          currency: estimatedCost.currency,
          value: estimatedCost.value,
        }
      : undefined,
    step: (steps || []).map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

// ----------------------------------------------------------------------------
// Organization Schema
// ----------------------------------------------------------------------------
function generateOrganizationSchema(props) {
  const { name, description, url, logoUrl, sameAs, contactPoint, address } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description,
    url,
    logo: logoUrl,
    sameAs,
    contactPoint: contactPoint
      ? {
          '@type': 'ContactPoint',
          telephone: contactPoint.telephone,
          email: contactPoint.email,
          contactType: contactPoint.contactType || 'customer service',
        }
      : undefined,
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address.streetAddress,
          addressLocality: address.addressLocality,
          addressRegion: address.addressRegion,
          postalCode: address.postalCode,
          addressCountry: address.addressCountry,
        }
      : undefined,
  };
}

// ----------------------------------------------------------------------------
// Local Business Schema（服務業適用）
// ----------------------------------------------------------------------------
function generateLocalBusinessSchema(props) {
  const base = generateOrganizationSchema(props);

  return {
    ...base,
    '@type': 'LocalBusiness',
    priceRange: props.priceRange,
    openingHoursSpecification: props.openingHours
      ? props.openingHours.map((hours) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hours,
        }))
      : undefined,
    geo: props.geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: props.geo.latitude,
          longitude: props.geo.longitude,
        }
      : undefined,
  };
}

// ----------------------------------------------------------------------------
// Professional Service Schema（專業服務，如看相、命理）
// ----------------------------------------------------------------------------
function generateProfessionalServiceSchema(props) {
  const base = generateLocalBusinessSchema(props);

  return {
    ...base,
    '@type': 'ProfessionalService',
  };
}

// ----------------------------------------------------------------------------
// Breadcrumb Schema
// ----------------------------------------------------------------------------
function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: (items || []).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ----------------------------------------------------------------------------
// FAQ Schema
// ----------------------------------------------------------------------------
function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ----------------------------------------------------------------------------
// WebSite Schema（用於首頁，含站內搜尋 SearchAction）
// ----------------------------------------------------------------------------
function generateWebSiteSchema(props) {
  const { name, url, description, searchUrl } = props;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
  };

  if (searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}

// ----------------------------------------------------------------------------
// Course Schema（課程適用）
// ----------------------------------------------------------------------------
function generateCourseSchema(props) {
  const {
    name,
    description,
    url,
    imageUrl,
    providerName,
    providerUrl,
    instructorName,
    price,
    priceCurrency,
    duration,
  } = props;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    image: imageUrl,
    provider: {
      '@type': 'Organization',
      name: providerName,
      url: providerUrl,
    },
    instructor: instructorName
      ? {
          '@type': 'Person',
          name: instructorName,
        }
      : undefined,
    offers:
      price !== undefined
        ? {
            '@type': 'Offer',
            price,
            priceCurrency: priceCurrency || 'TWD',
            availability: 'https://schema.org/InStock',
          }
        : undefined,
    hasCourseInstance: duration
      ? {
          '@type': 'CourseInstance',
          courseMode: 'online',
          duration,
        }
      : undefined,
  };
}

// ----------------------------------------------------------------------------
// Helper：清理 undefined / null / 空陣列 / 空物件
// ----------------------------------------------------------------------------
function cleanSchema(schema) {
  return JSON.parse(
    JSON.stringify(schema, (_, value) => {
      if (value === undefined || value === null) return undefined;
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === 'object' && Object.keys(value).length === 0) return undefined;
      return value;
    })
  );
}

// ----------------------------------------------------------------------------
// Helper：把 schema 轉成 JSON-LD 字串（單一或陣列，會先 clean）
// ----------------------------------------------------------------------------
function schemaToJsonLd(schema) {
  const cleaned = Array.isArray(schema) ? schema.map(cleanSchema) : cleanSchema(schema);
  return JSON.stringify(cleaned);
}

// ----------------------------------------------------------------------------
// Helper：直接產出可塞進 <head> 的 <script type="application/ld+json"> 標籤
//   escape 掉 "<" 避免 </script> 提前截斷 / XSS。
// ----------------------------------------------------------------------------
function jsonLdScript(schema) {
  const json = schemaToJsonLd(schema).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

module.exports = {
  generateArticleSchema,
  generateHowToSchema,
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateProfessionalServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateWebSiteSchema,
  generateCourseSchema,
  cleanSchema,
  schemaToJsonLd,
  jsonLdScript,
};
