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
  const [previewKey, setPreviewKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/materials?id=${id}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then((m: Material) => {
        if (!m) return
        setMaterial(m)
        setPreviewUrl(`/p/${m.id}`)
        setParams(prev => ({ ...prev, clientName: m.client, productName: m.product }))
      })
      .catch(() => setMaterial(null))
  }, [id])

  async function regenerate() {
    if (!material) return
    setLoading(true)
    setError('')
    try {
      if (material.templateId) {
        const res = await fetch('/api/remix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: material.templateId, params, materialId: material.id }),
        })
        if (!res.ok) {
          setError(`Regeneracja nie powiodła się (${res.status})`)
          return
        }
      } else {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'generate',
            type: material.type,
            client: { name: params.clientName, industry: params.clientIndustry },
            product: params.productName,
            focus: params.focus,
            logoUrl: params.logoUrl,
            accentColor: params.accentColor,
            materialId: material.id,
          }),
        })
        if (!res.ok || !res.body) {
          setError(`Regeneracja nie powiodła się (${res.status})`)
          return
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false
        while (!finished) {
          const { value, done: streamDone } = await reader.read()
          if (streamDone) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            if (!part.startsWith('data: ')) continue
            try {
              const evt = JSON.parse(part.slice(6))
              if (evt.error) { setError('Generacja AI nie powiodła się'); finished = true; break }
              if (evt.done) { finished = true; break }
            } catch {}
          }
        }
      }
      setPreviewUrl(`/p/${material.id}`)
      setPreviewKey(k => k + 1)
    } catch (e: any) {
      setError(`Błąd sieci: ${e?.message ?? 'nieznany'}`)
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
    if (!material) return
    const abs = `${window.location.origin}/p/${material.id}`
    navigator.clipboard.writeText(abs).catch(() => {})
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
        <ParamsPanel
          params={params}
          onChange={setParams}
          onRegenerate={regenerate}
          loading={loading}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: loading ? '#f59e0b' : 'var(--green)' }} />
            {loading ? 'Regeneruję...' : 'Podgląd live'}
            {error && <span style={{ color: '#b91c1c', marginLeft: 8 }}>{error}</span>}
          </div>
          <iframe key={previewKey} src={previewUrl} style={{ flex: 1, border: 'none', width: '100%' }} />
        </div>
      </div>
    </div>
  )
}
