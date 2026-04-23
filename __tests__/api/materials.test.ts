jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
}))

const mockKv: Record<string, unknown> = {}
jest.mock('@vercel/kv', () => ({
  kv: {
    set: jest.fn((key: string, val: unknown) => { mockKv[key] = val }),
    keys: jest.fn(() => Object.keys(mockKv).filter(k => k.startsWith('mm:material:'))),
    mget: jest.fn((...keys: string[]) => keys.map((k: string) => mockKv[k] ?? null)),
  },
}))

import { GET, POST } from '@/app/api/materials/route'

const MATERIAL = {
  id: 'mat_1', name: 'Test', type: 'landing', client: 'Test Co',
  product: 'Cinema', blobUrl: 'https://blob.test/file.html', createdAt: '2026-04-23T00:00:00Z',
}

beforeEach(() => {
  Object.keys(mockKv).forEach(k => delete mockKv[k])
})

test('POST zapisuje materiał i zwraca ok', async () => {
  const req = new Request('http://localhost/api/materials', {
    method: 'POST',
    body: JSON.stringify(MATERIAL),
  })
  const res = await POST(req)
  const data = await res.json()
  expect(data.ok).toBe(true)
})

test('GET zwraca listę materiałów', async () => {
  mockKv['mm:material:mat_1'] = MATERIAL
  const res = await GET()
  const data = await res.json()
  expect(Array.isArray(data)).toBe(true)
})
