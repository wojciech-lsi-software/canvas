jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
}))

global.fetch = jest.fn()

jest.mock('@vercel/kv', () => ({
  kv: { get: jest.fn().mockResolvedValue({ id: 'mat_1', blobUrl: 'https://blob.test/file.html' }) },
}))

import { POST } from '@/app/api/save/route'

beforeEach(() => {
  process.env.SHAREPOINT_CLIENT_ID = 'client_id'
  process.env.SHAREPOINT_CLIENT_SECRET = 'client_secret'
  process.env.SHAREPOINT_TENANT_ID = 'tenant_id'
  process.env.SHAREPOINT_SITE_ID = 'site_id'
  process.env.SHAREPOINT_FOLDER = 'MaterialMaker'

  ;(global.fetch as jest.Mock)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'tok123' }) })
    .mockResolvedValueOnce({ ok: true, text: async () => 'html content' })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'sp_file_id' }) })
})

test('POST pobiera plik z Blob i uploaduje do SharePoint', async () => {
  const req = new Request('http://localhost/api/save', {
    method: 'POST',
    body: JSON.stringify({ materialId: 'mat_1', filename: 'test.html' }),
  })
  const res = await POST(req)
  const data = await res.json()
  expect(data.ok).toBe(true)
  expect(global.fetch).toHaveBeenCalledTimes(3)
})
