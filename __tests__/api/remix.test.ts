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

test('returns 404 for unknown templateId', async () => {
  const req = new Request('http://localhost/api/remix', {
    method: 'POST',
    body: JSON.stringify({
      templateId: 'nonexistent',
      params: {
        clientName: 'Test', productName: 'X', accentColor: '#000',
        logoUrl: 'https://x.test', clientIndustry: 'Y', focus: 'Z',
      },
    }),
  })
  const res = await POST(req)
  expect(res.status).toBe(404)
})

test('calls kv.set with materialId after successful remix', async () => {
  const { kv } = await import('@vercel/kv')
  const req = new Request('http://localhost/api/remix', {
    method: 'POST',
    body: JSON.stringify({
      templateId: 'cinema-hotel-base',
      params: {
        clientName: 'Hotel Test', productName: 'Cinema', accentColor: '#ff0000',
        logoUrl: 'https://logo.test', clientIndustry: 'Hotele', focus: 'SPA',
      },
    }),
  })
  await POST(req)
  expect(kv.set).toHaveBeenCalled()
  const callArg = (kv.set as jest.Mock).mock.calls[0][0] as string
  expect(callArg).toMatch(/^mm:material:mat_/)
})
