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

  const thisWeek = materials.filter(m => new Date(m.createdAt) > new Date(Date.now() - 7 * 86400000)).length

  const stats = [
    {
      value: materials.length,
      label: 'Wygenerowanych materiałów',
      sub: 'łącznie',
      accent: '#2383e2',
      accentBg: '#e7f0fd',
      bar: Math.min(100, materials.length * 10),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    },
    {
      value: thisWeek,
      label: 'W tym tygodniu',
      sub: thisWeek === 1 ? 'materiał' : 'materiałów',
      accent: '#0f7b6c',
      accentBg: '#e6f4f1',
      bar: Math.min(100, thisWeek * 20),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      value: synced ? 'OK' : '—',
      label: 'Synchronizacja danych',
      sub: synced ? `Growth Hub · ${new Date(context.synced_at!).toLocaleDateString('pl')}` : 'brak połączenia',
      accent: synced ? '#0f7b6c' : '#aaa9a5',
      accentBg: synced ? '#e6f4f1' : '#f7f7f5',
      bar: synced ? 100 : 0,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
    },
  ]

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 960, margin: '0 auto' }}>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'white', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ padding: '18px 20px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: s.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-2px', color: s.accent, lineHeight: 1, marginBottom: 5 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
            <div style={{ height: 3, background: 'var(--border)' }}>
              <div style={{ height: '100%', background: s.accent, width: `${s.bar}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Zacznij tutaj</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 48 }}>
        <Link href="/chat" style={{ padding: '20px 20px 18px', background: 'var(--text-primary)', borderRadius: 8, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Najszybciej</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>Opisz i generuj</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>Napisz dla kogo i co — AI wygeneruje materiał</div>
        </Link>
        <Link href="/new" style={{ padding: '20px 20px 18px', background: 'white', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Krok po kroku</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Kreator</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Wybierz typ, klienta i parametry</div>
        </Link>
        <Link href="/remix" style={{ padding: '20px 20px 18px', background: 'white', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Gotowy plik</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Remix HTML</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Wgraj plik i dostosuj do nowego klienta</div>
        </Link>
      </div>

      {/* Recent materials */}
      {materials.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ostatnie materiały</div>
            <Link href="/materials" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Wszystkie →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {materials.map(m => <MaterialCard key={m.id} material={m} />)}
          </div>
        </>
      )}

      {materials.length === 0 && (
        <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Brak wygenerowanych materiałów</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Zacznij od "Opisz i generuj" powyżej</div>
        </div>
      )}
    </div>
  )
}
