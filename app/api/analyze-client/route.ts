import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'

export const runtime = 'edge'
export const maxDuration = 60

const SYSTEM = `Jesteś ekspertem od brandingu i analizy stron firmowych. Zwróć TYLKO czysty JSON, bez markdown, bez komentarzy.

Schema:
{
  "name": string,
  "industry": string,
  "description": string,
  "tagline": string | null,
  "logoUrl": string | null,
  "primaryColor": string | null
}

Wskazówki:
- name: nazwa firmy z <title>, og:site_name, h1 lub domeny
- industry: branża w 2-3 słowach (np. "Deweloper logistyczny", "E-commerce", "Robotyka przemysłowa", "HoReCa")
- description: 1-2 zdania co firma robi, KONKRETNIE
- tagline: hasło marketingowe jeśli widoczne, inaczej null
- logoUrl: BEZWZGLĘDNY URL do logo (http/https). Szukaj <img> z "logo" w src/class/alt. Jeśli URL jest względny, doklej bazowy host. Jeśli nie masz absolutnego URL, wstaw null.
- primaryColor: dominujący KOLOR MARKI jako hex #RRGGBB. Szukaj w kolejności:
  1. <meta name="theme-color">
  2. CSS vars --primary/--brand/--accent/--color-primary
  3. background-color na .logo/.nav/.header/.btn-primary
  4. najczęściej powtarzający się nietrywialny kolor
  Odrzuć czarny (#000), biały (#fff), szarości. Jeśli marka faktycznie jest czarno-biała, zwróć #111111 lub null.

Jeśli nie udało się pobrać strony, wywnioskuj name/industry/description z samego URL i domeny. Logo i kolor mogą być null.`

function buildUserContent(url: string, html: string | null) {
  if (!html) return `URL: ${url}\n\nNie udało się pobrać strony (bot protection lub timeout). Wywnioskuj dane firmy z URL i nazwy domeny.`
  const trimmed = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 22000)
  return `URL: ${url}\n\nHTML (skrócony, zachowane <style>, <meta>, <img>, <link>):\n${trimmed}`
}

function absolutize(maybeUrl: string | null, base: string): string | null {
  if (!maybeUrl) return null
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl
  try {
    return new URL(maybeUrl, base).toString()
  } catch {
    return null
  }
}

function normalizeUrl(input: string) {
  const trimmed = input.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const payload = (fenced ? fenced[1] : text).trim()
  try { return JSON.parse(payload) } catch {}
  const first = payload.indexOf('{')
  const last = payload.lastIndexOf('}')
  if (first >= 0 && last > first) {
    try { return JSON.parse(payload.slice(first, last + 1)) } catch {}
  }
  return null
}

export async function POST(req: NextRequest) {
  let body: { url?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }) }
  const rawUrl = body.url?.trim()
  if (!rawUrl) return NextResponse.json({ error: 'url_required' }, { status: 400 })

  const url = normalizeUrl(rawUrl)
  let html: string | null = null

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pl,en-US;q=0.7,en;q=0.3',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    })
    if (res.ok) html = await res.text()
  } catch { /* ignore — Claude will infer */ }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildUserContent(url, html) }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const parsed = extractJson(text)
    if (!parsed) return NextResponse.json({ error: 'parse_failed', raw: text.slice(0, 200) }, { status: 502 })

    const result = {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      industry: typeof parsed.industry === 'string' ? parsed.industry : '',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      tagline: typeof parsed.tagline === 'string' ? parsed.tagline : null,
      logoUrl: absolutize(typeof parsed.logoUrl === 'string' ? parsed.logoUrl : null, url),
      primaryColor: typeof parsed.primaryColor === 'string' && /^#[0-9a-f]{6}$/i.test(parsed.primaryColor)
        ? parsed.primaryColor : null,
      sourceUrl: url,
      fetched: html !== null,
    }
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'analyze_failed', detail: String(err).slice(0, 200) }, { status: 502 })
  }
}
