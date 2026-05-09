/**
 * Render JSON-LD structured data trong <script>.
 * Dùng tại Server Component để tránh bloat client bundle.
 *
 * Tham khảo:
 * - Product: https://schema.org/Product
 * - WebSite + SearchAction: https://schema.org/WebSite
 * - BreadcrumbList: https://schema.org/BreadcrumbList
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
