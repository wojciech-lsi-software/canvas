import { NextRequest, NextResponse } from 'next/server'
import { anthropic, ANALYZE_CLIENT_SYSTEM } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  let htmlContext = ''

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pl,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    })

    if (res.ok) {
      const raw = await res.text()
      htmlContext = raw
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000)
    }
  } catch {
    // fetch failed — Claude will infer from URL alone
  }

  const userContent = htmlContext
    ? `URL: ${url}\n\nTreść strony:\n${htmlContext}`
    : `URL: ${url}\n\nNie udało się pobrać strony (bot protection lub timeout). Wywnioskuj dane firmy na podstawie domeny i URL.`

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: ANALYZE_CLIENT_SYSTEM,
    messages: [{ role: 'user', content: userContent }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  try {
    const result = JSON.parse(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'parse_failed' }, { status: 500 })
  }
}
