import { remixTemplate, TEMPLATES } from '@/lib/templates'

test('remixTemplate podmienia wszystkie placeholdery', () => {
  const html = '<h1>{{CLIENT_NAME}}</h1><p>{{PRODUCT_NAME}}</p><a style="color:{{ACCENT_COLOR}}">{{CLIENT_INDUSTRY}}</a>'
  const result = remixTemplate(html, {
    clientName: 'Hotel Malinowski',
    productName: 'Cinema',
    accentColor: '#2383e2',
    clientIndustry: 'Horeca',
    logoUrl: 'https://example.com/logo.png',
    focus: 'rezerwacje SPA',
  })
  expect(result).toContain('Hotel Malinowski')
  expect(result).toContain('Cinema')
  expect(result).toContain('#2383e2')
  expect(result).toContain('Horeca')
  expect(result).not.toContain('{{')
})

test('TEMPLATES zawiera co najmniej 6 szablonów', () => {
  expect(TEMPLATES.length).toBeGreaterThanOrEqual(6)
})

test('każdy szablon ma wymagane pola', () => {
  for (const t of TEMPLATES) {
    expect(t).toHaveProperty('id')
    expect(t).toHaveProperty('name')
    expect(t).toHaveProperty('type')
    expect(t).toHaveProperty('product')
    expect(t).toHaveProperty('file')
  }
})
