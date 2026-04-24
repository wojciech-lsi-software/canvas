export interface Template {
  id: string
  name: string
  type: 'landing' | 'presentation' | 'onepager' | 'script' | 'email'
  product: string
  file: string
}

export interface RemixParams {
  clientName: string
  clientIndustry: string
  productName: string
  logoUrl: string
  accentColor: string
  focus: string
}

export const TEMPLATES: Template[] = [
  { id: 'cinema-hotel-base', name: 'POSitive Cinema dla hoteli', type: 'landing', product: 'POSitive Cinema', file: 'cinema-hotel.html' },
  { id: 'cinema-generic-base', name: 'POSitive Cinema — generyczny', type: 'landing', product: 'POSitive Cinema', file: 'cinema-generic.html' },
  { id: 'lsicloud-base', name: 'LSI Cloud', type: 'landing', product: 'LSI Cloud', file: 'lsicloud.html' },
  { id: 'pitch-generic', name: 'Prezentacja sprzedażowa', type: 'presentation', product: 'Generic', file: 'pitch-generic.html' },
  { id: 'onepager-generic', name: 'One-pager', type: 'onepager', product: 'Generic', file: 'onepager-generic.html' },
]

export function remixTemplate(html: string, params: RemixParams): string {
  return html
    .replaceAll('{{CLIENT_NAME}}', params.clientName)
    .replaceAll('{{CLIENT_INDUSTRY}}', params.clientIndustry)
    .replaceAll('{{PRODUCT_NAME}}', params.productName)
    .replaceAll('{{LOGO_URL}}', params.logoUrl)
    .replaceAll('{{ACCENT_COLOR}}', params.accentColor)
    .replaceAll('{{FOCUS}}', params.focus)
}
