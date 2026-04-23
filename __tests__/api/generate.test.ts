jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'https://blob.example.com/mat_test.html' }),
}))
jest.mock('@vercel/kv', () => ({
  kv: { set: jest.fn().mockResolvedValue('OK') },
}))
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
}))
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ intent: 'swap', detectedTemplate: 'cinema-hotel-base', detectedClient: 'Radisson', detectedChanges: ['logo'] }) }],
      }),
      stream: jest.fn(),
    },
  })),
}))

import { POST } from '@/app/api/generate/route'

test('mode=classify zwraca intent JSON', async () => {
  const req = new Request('http://localhost/api/generate', {
    method: 'POST',
    body: JSON.stringify({ mode: 'classify', message: 'zrób jak Cinema Hotel ale dla Radisson' }),
  })
  const res = await POST(req)
  const data = await res.json()
  expect(data.intent).toBe('swap')
  expect(data.detectedTemplate).toBe('cinema-hotel-base')
})

test('mode=classify zwraca fallback gdy Claude nie zwróci poprawnego JSON', async () => {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const instance = (Anthropic as jest.Mock).mock.results[0].value
  instance.messages.create.mockResolvedValueOnce({
    content: [{ type: 'text', text: 'nie json' }],
  })
  const req = new Request('http://localhost/api/generate', {
    method: 'POST',
    body: JSON.stringify({ mode: 'classify', message: 'cokolwiek' }),
  })
  const res = await POST(req)
  const data = await res.json()
  expect(data.intent).toBe('generate')
  expect(data.detectedTemplate).toBeNull()
})
