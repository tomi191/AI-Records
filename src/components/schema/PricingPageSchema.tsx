/**
 * JSON-LD Structured Data for AI-Records Pricing Page
 *
 * Includes:
 * - BreadcrumbList for pricing page
 * - WebPage with pricing-specific metadata
 *
 * NOTE: FAQPage schema is NOT included because Google restricted
 * FAQ rich results to government/healthcare sites in August 2023.
 * The FAQ content on the pricing page is still valuable for users
 * but should not be marked up with FAQPage schema.
 */

export default function PricingPageSchema() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Начало",
        "item": "https://www.ai-records.eu"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Цени",
        "item": "https://www.ai-records.eu/pricing"
      }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.ai-records.eu/pricing/#webpage",
    "name": "Цени | AI-Records",
    "description": "Избери перфектния план за твоите музикални нужди. Безплатен, Стартер ($9/мес) и Про ($29/мес) планове.",
    "url": "https://www.ai-records.eu/pricing",
    "isPartOf": {
      "@id": "https://www.ai-records.eu/#website"
    },
    "about": {
      "@id": "https://www.ai-records.eu/#application"
    },
    "inLanguage": "bg"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
