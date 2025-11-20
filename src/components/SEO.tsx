import { useEffect } from "react";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  publishedTimeISO?: string;
  // Nuevas props para cumplir con los requisitos
  schemaMarkup?: object; // Para structured data
  h1?: string; // Para asegurar H1 único
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  const head = document.head;
  let el = head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
  const head = document.head;
  let el = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJSONLD(data: object) {
  const head = document.head;
  let script = head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  
  if (!script) {
    script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
}

export default function SEO({
  title,
  description,
  image,
  canonical,
  noindex,
  ogType = "website",
  publishedTimeISO,
  schemaMarkup,
  h1,
  locale = "en_US",
  siteName = "VillaNet",
  twitterHandle = "@villanet",
}: SEOProps) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, "") || window.location.origin;
    
    const resolveUrl = (u?: string) => {
      if (!u) return undefined;
      if (/^https?:\/\//i.test(u)) return u;
      return siteUrl ? `${siteUrl}${u.startsWith("/") ? "" : "/"}${u}` : u;
    };

    // --- TÍTULO Y META DESCRIPTION ---
    if (title) {
      document.title = `${title} | ${siteName}`;
    }

    if (description) {
      upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
      });
    }

    // --- ROBOTS & CANONICAL ---
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex,nofollow" : "index,follow",
    });

    const canonicalUrl = resolveUrl(canonical) || window.location.href;
    upsertLink("canonical", canonicalUrl);

    // --- OPEN GRAPH ---
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: siteName,
    });

    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: locale,
    });

    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: ogType,
    });

    if (title) {
      upsertMeta('meta[property="og:title"]', {
        property: "og:title",
        content: title,
      });
    }

    if (description) {
      upsertMeta('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
    }

    const ogImage = resolveUrl(image) || `${siteUrl}/og-image.jpg`;
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: ogImage,
    });

    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });

    // --- TWITTER CARD ---
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });

    upsertMeta('meta[name="twitter:site"]', {
      name: "twitter:site",
      content: twitterHandle,
    });

    if (title) {
      upsertMeta('meta[name="twitter:title"]', {
        name: "twitter:title",
        content: title,
      });
    }

    if (description) {
      upsertMeta('meta[name="twitter:description"]', {
        name: "twitter:description",
        content: description,
      });
    }

    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: ogImage,
    });

    // --- SCHEMA STRUCTURED DATA ---
    if (schemaMarkup) {
      upsertJSONLD(schemaMarkup);
    }

    // --- H1 MANAGEMENT ---
    // Esta es una sugerencia - podrías manejar el H1 de forma centralizada
    if (h1 && import.meta.env.VITE_NODE_ENV === 'development') {
      console.log(`SEO: H1 recomendado - "${h1}"`);
    }

  }, [
    title,
    description,
    image,
    canonical,
    noindex,
    ogType,
    publishedTimeISO,
    schemaMarkup,
    h1,
    locale,
    siteName,
    twitterHandle,
  ]);

  return null;
}

// --- SCHEMA GENERATORS --- (Helpers para structured data)

export const generateLocalBusinessSchema = (businessInfo: {
  name: string;
  description: string;
  url: string;
  telephone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string;
  priceRange?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": businessInfo.name,
  "description": businessInfo.description,
  "url": businessInfo.url,
  "telephone": businessInfo.telephone,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": businessInfo.address.street,
    "addressLocality": businessInfo.address.city,
    "addressRegion": businessInfo.address.state,
    "postalCode": businessInfo.address.postalCode,
    "addressCountry": businessInfo.address.country
  },
  ...(businessInfo.geo && {
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": businessInfo.geo.latitude,
      "longitude": businessInfo.geo.longitude
    }
  }),
  ...(businessInfo.openingHours && {
    "openingHours": businessInfo.openingHours
  }),
  ...(businessInfo.priceRange && {
    "priceRange": businessInfo.priceRange
  })
});

export const generateAggregateRatingSchema = (ratingInfo: {
  ratingValue: number;
  ratingCount: number;
  bestRating?: number;
  worstRating?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": ratingInfo.ratingValue,
  "ratingCount": ratingInfo.ratingCount,
  "bestRating": ratingInfo.bestRating || 5,
  "worstRating": ratingInfo.worstRating || 1
});

export const generateProductSchema = (productInfo: {
  name: string;
  description: string;
  image: string[];
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
  };
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": productInfo.name,
  "description": productInfo.description,
  "image": productInfo.image,
  "offers": {
    "@type": "Offer",
    "price": productInfo.offers.price,
    "priceCurrency": productInfo.offers.priceCurrency,
    "availability": productInfo.offers.availability
  }
});