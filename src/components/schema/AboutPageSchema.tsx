/**
 * JSON-LD Structured Data for AI-Records About Page
 *
 * Includes:
 * - BreadcrumbList
 * - AboutPage type
 */

export default function AboutPageSchema() {
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
        "name": "За нас",
        "item": "https://www.ai-records.eu/about"
      }
    ]
  };

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://www.ai-records.eu/about/#webpage",
    "name": "За AI-Records",
    "description": "Мисията ни е да демократизираме създаването на българска музика, като дадем на всеки творец инструментите да превърне идеите си в реалност.",
    "url": "https://www.ai-records.eu/about",
    "isPartOf": {
      "@id": "https://www.ai-records.eu/#website"
    },
    "about": {
      "@id": "https://www.ai-records.eu/#organization"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
    </>
  );
}
