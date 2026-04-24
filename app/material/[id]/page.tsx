'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ParamsPanel from '@/components/ParamsPanel'
import { RemixParams } from '@/lib/templates'
import { Material } from '@/lib/storage'

const DEFAULT_PARAMS: RemixParams = { clientName: '', clientIndustry: '', productName: 'Cinema', logoUrl: '', accentColor: '#2383e2', focus: '' }

export default function MaterialEditor() {
  const { id } = useParams<{ id: string }>()
  const [material, setMaterial] = useState<Material | null>(null)
  const [params, setParams] = useState<RemixParams>(DEFAULT_PARAMS)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/materials?id=${id}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then((m: Material) => {
        if (!m) return
        setMaterial(m)
        setPreviewUrl(m.blobUrl)
        setParams(prev => ({ ...prev, clientName: m.client, productName: m.product }))
      })
      .catch(() => setMaterial(null))
  }, [id])

  async function regenerate() {
    if (!material?.templateId) return
    setLoading(true)
    try {
      const res = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: material.templateId, params }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.url) setPreviewUrl(data.url)
    } catch {
      // network error — loading resets, preview unchanged
    } finally {
      setLoading(false)
    }
  }

  async function saveToSharePoint() {
    if (!material) return
    setSaved(false)
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: material.id, filename: `${material.name.replace(/\s+/g, '-')}.html` }),
    })
    if (res.ok) setSaved(true)
  }

  function copyUrl() {
    navigator.clipboard.writeText(previewUrl).catch(() => {})
  }

  if (!material) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Ładowanie materiału...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{material.name}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyUrl} style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 4, background: 'white', fontSize: 11, cursor: 'pointer' }}>Skopiuj URL</button>
          <a href={previewUrl} download={`${material.name}.html`} style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 4, background: 'white', fontSize: 11, textDecoration: 'none', color: 'var(--text-primary)' }}>Pobierz</a>
          <button onClick={saveToSharePoint} style={{ padding: '4px 12px', border: 'none', borderRadius: 4, background: saved ? 'var(--green)' : 'var(--accent)', color: 'white', fontSize: 11, cursor: 'pointer' }}>
            {saved ? 'Zapisano' : 'SharePoint'}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ParamsPanel params={params} onChange={setParams} onRegenerate={regenerate} loading={loading} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            Podgląd live
          </div>
          <iframe src={previewUrl} style={{ flex: 1, border: 'none', width: '100%' }} />
        </div>
      </div>
    </div>
  )
}
