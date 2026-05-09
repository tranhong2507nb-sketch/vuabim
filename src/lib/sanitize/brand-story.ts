import 'server-only'
import sanitizeHtml, { type IOptions } from 'sanitize-html'

/**
 * Lấy hostname Supabase từ env để chỉ cho phép ảnh từ Storage của project.
 * NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
 */
function getAllowedImageHosts(): string[] {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    return [url.hostname]
  } catch {
    return []
  }
}

/**
 * Whitelist 12 tag + transform a/img.
 * Whitelist này PHẢI khớp TipTap output (xem §28.8 THIET-KE.md).
 */
export const brandStoryConfig: IOptions = {
  allowedTags: [
    'p',
    'h2',
    'h3',
    'strong',
    'em',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'br',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer'
      }
      return { tagName, attribs }
    },
    img: (tagName, attribs) => {
      const allowed = getAllowedImageHosts()
      try {
        const url = new URL(attribs.src ?? '')
        if (!allowed.includes(url.hostname)) {
          return { tagName: 'span', text: '', attribs: {} }
        }
      } catch {
        return { tagName: 'span', text: '', attribs: {} }
      }
      return { tagName, attribs }
    },
  },
}

export function sanitizeBrandStory(input: string): string {
  return sanitizeHtml(input ?? '', brandStoryConfig)
}
