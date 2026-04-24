'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchMaterials, Material } from '@/lib/storage'

const TYPE_LABELS: Record<string, string> = { landing: 'Landing Page', presentation: 'Prezentacja', onepager: 'One-pager', script: 'Skrypt handlowy', email: 'Sekwencja emaili' }

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    fetchMaterials().then(mats => setMaterials(mats.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
  }, [])

  if (!materials.length) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', paddingTop: 100 }}>
      <div style={{ fontSize: 16, marginBottom: 8 }}>Brak wygenerowanych materiałów</div>
      <Link href="/chat" style={{ display: 'inline-block', padding: '8px 20px', background: 'var(--text-primary)', color: 'white', borderRadius: 5, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Wygeneruj pierwszy</Link>
    </div>
  )

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Moje materiały</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Klient', 'Produkt', 'Typ', 'Nazwa', 'Data', 'Akcje'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {materials.map(m => {
            const d = new Date(m.createdAt)
            return (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{m.client}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>{m.product || '—'}</td>
                <td style={{ padding: '10px 12px', fontSize: 11 }}>{TYPE_LABELS[m.type] ?? m.type}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{m.name}</td>
                <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.toLocaleDateString('pl')} · {d.toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={m.blobUrl} target="_blank" style={{ padding: '3px 8px', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, textDecoration: 'none', color: 'var(--text-secondary)' }}>Podgląd</a>
                    <Link href={`/material/${m.id}`} style={{ padding: '3px 8px', background: 'var(--accent)', color: 'white', borderRadius: 4, fontSize: 11, textDecoration: 'none' }}>Edytuj</Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
