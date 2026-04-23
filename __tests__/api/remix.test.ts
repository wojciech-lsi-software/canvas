jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
}))
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'https://blob.vercel.com/test.html' }),
}))
jest.mock('@vercel/kv', () => ({
  kv: { set: jest.fn() },
}))
jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue('<h1>{{CLIENT_NAME}}</h1><p>{{PRODUCT_NAME}}</p><span>{{ACCENT_COLOR}}</span><img src="{{LOGO_URL}}"><em>{{CLIENT_INDUSTRY}}</em><b>{{FOCUS}}</b>'),
}))

import { POST } from '@/app/api/remix/route'

test('remix podmienia parametry i zapisuje do Blob', async () => {
  const req = new Request('http://localhost/api/remix', {
    method: 'POST',
    body: JSON.stringify({
      templateId: 'cinema-hotel-base',
      params: {
        clientName: 'Hotel Test',
        productName: 'Cinema',
        accentColor: '#ff0000',
        logoUrl: 'https://logo.test',
        clientIndustry: 'Hotele',
        focus: 'SPA',
      },
    }),
  })
  const res = await POST(req)
  const data = await res.json()
  expect(data).toHaveProperty('materialId')
  expect(data).toHaveProperty('url')
  expect(data.url).toBe('https://blob.vercel.com/test.html')
})
