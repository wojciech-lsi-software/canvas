jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
  },
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown) => ({
      json: () => Promise.resolve(data),
    }),
  },
}))

import { kv } from '@vercel/kv'
import { GET } from '@/app/api/context/route'

const MOCK_CONTEXT = {
  team: [{ id: 'wojciech', name: 'Wojciech', role: 'Head of Marketing', initials: 'W' }],
  epics: [{ id: 'paid', name: 'Kampanie Paid Media' }],
  synced_at: '2026-04-23T10:00:00Z',
}

test('GET zwraca kontekst z KV', async () => {
  (kv.get as jest.Mock).mockResolvedValue(MOCK_CONTEXT)
  const res = await GET()
  const data = await res.json()
  expect(data.team).toHaveLength(1)
  expect(data.team[0].name).toBe('Wojciech')
})

test('GET zwraca pusty obiekt gdy KV nie ma danych', async () => {
  (kv.get as jest.Mock).mockResolvedValue(null)
  const res = await GET()
  const data = await res.json()
  expect(data).toEqual({})
})
