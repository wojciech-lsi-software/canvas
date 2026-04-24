'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchContext, LSIContext } from '@/lib/context'
import { fetchMaterials, Material } from '@/lib/storage'
import MaterialCard from '@/components/MaterialCard'

export default function Dashboard() {
  const [context, setContext] = useState<LSIContext>({})
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    fetchContext().then(setContext)
    fetchMaterials().then(mats => setMaterials(mats.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)))
  }, [])

  const synced = !!context.synced_at

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {[
          { n: materials.length, label: 'materiałów' },
          { n: materials.filter(m => new Date(m.createdAt) > new Date(Date.now() - 7 * 86400000)).length, label: 'w tym tygodniu' },
          { n: synced ? '✓' : '—', label: 'Growth Hub' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--bg-sidebar)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{s.n}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
        <Link href="/chat" style={{ padding: 24, background: 'var(--text-primary)', borderRadius: 10, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>Szybki chat</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Opisz co chcesz wygenerować</div>
        </Link>
        <Link href="/new" style={{ padding: 24, background: 'white', border: '1px solid var(--border)', borderRadius: 10, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Kreator</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Krok po kroku z wyborem szablonu</div>
        </Link>
      </div>

      {/* Recent materials */}
      {materials.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Ostatnie materiały</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {materials.map(m => <MaterialCard key={m.id} material={m} />)}
          </div>
        </>
      )}
    </div>
  )
}
