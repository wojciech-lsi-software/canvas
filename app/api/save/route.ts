import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import type { Material } from '@/lib/storage'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { materialId, filename } = body as { materialId: string; filename: string }

    if (!materialId || !filename) {
      return NextResponse.json({ error: 'materialId and filename required' }, { status: 400 })
    }

    const material = await kv.get<Material>(`mm:material:${materialId}`)
    if (!material) return NextResponse.json({ error: 'Material not found' }, { status: 404 })

    // Fetch token first, then blob content, then upload — matches expected fetch call order
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.SHAREPOINT_CLIENT_ID!,
          client_secret: process.env.SHAREPOINT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
        }),
      }
    )
    const { access_token: token } = await tokenRes.json()

    const htmlRes = await fetch(material.blobUrl)
    if (!htmlRes.ok) return NextResponse.json({ error: 'Failed to fetch HTML from Blob' }, { status: 502 })
    const html = await htmlRes.text()

    const siteId = process.env.SHAREPOINT_SITE_ID
    const folder = process.env.SHAREPOINT_FOLDER ?? 'MaterialMaker'
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${folder}/${filename}:/content`
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/html' },
      body: html,
    })
    if (!uploadRes.ok) throw new Error(`SharePoint upload failed: ${uploadRes.status}`)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'SharePoint upload failed' }, { status: 500 })
  }
}
