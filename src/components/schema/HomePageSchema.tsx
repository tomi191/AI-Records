/**
 * JSON-LD Structured Data for AI-Records Homepage
 *
 * Includes:
 * 1. Organization - brand identity for Knowledge Panel
 * 2. WebSite + SearchAction - sitelinks search box
 * 3. WebApplication - describes the SaaS product with offers
 * 4. BreadcrumbList - breadcrumb rich results
 */

export default function HomePageSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.ai-records.eu/#organization",
    "name": "AI-Records",
    "url": "https://www.ai-records.eu",
    "description": "Първата платформа за създаване на българска музика с изкуствен интелект. Генерирай текстове и песни на български.",
    "foundingDate": "2025",
    "founders": [
      {
        "@type": "Person",
        "name": "Sarys"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "София",
      "addressCountry": "BG"
    },
    "sameAs": [],
    "inLanguage": "bg"
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.ai-records.eu/#website",
    "name": "AI-Records",
    "url": "https://www.ai-records.eu",
    "publisher": {
      "@id": "https://www.ai-records.eu/#organization"
    },
    "inLanguage": "bg",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.ai-records.eu/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://www.ai-records.eu/#application",
    "name": "AI-Records",
    "url": "https://www.ai-records.eu",
    "description": "Генерирай професионални български текстове и ги превърни в истински песни. Идеално за поп, чалга, рок, фолк и други стилове.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "inLanguage": "bg",
    "offers": [
      {
        "@type": "Offer",
        "name": "Безплатен",
        "description": "10 кредита месечно. Перфектен за изпробване на AI-Records.",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://www.ai-records.eu/pricing"
      },
      {
        "@type": "Offer",
        "name": "Стартер",
        "description": "50 кредита месечно. За любители музиканти. Генериране на текстове и музика.",
        "price": "9.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "9.00",
          "priceCurrency": "USD",
          "billingDuration": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "MON"
          }
        },
        "availability": "https://schema.org/InStock",
        "url": "https://www.ai-records.eu/pricing"
      },
      {
        "@type": "Offer",
        "name": "Про",
        "description": "200 кредита месечно. За професионални творци. Персонализирани стилове и API достъп.",
        "price": "29.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "29.00",
          "priceCurrency": "USD",
          "billingDuration": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "MON"
          }
        },
        "availability": "https://schema.org/InStock",
        "url": "https://www.ai-records.eu/pricing"
      }
    ],
    "provider": {
      "@id": "https://www.ai-records.eu/#organization"
    },
    "featureList": [
      "Генериране на текстове на български",
      "Създаване на музика с AI",
      "8 музикални стила: поп, чалга, рок, фолк и други",
      "Експорт и изтегляне на песни"
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Начало",
        "item": "https://www.ai-records.eu"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
