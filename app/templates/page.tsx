'use client'
import Link from 'next/link'
import { TEMPLATES } from '@/lib/templates'

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  landing:      { bg: '#e7f0fd', color: '#2383e2' },
  presentation: { bg: '#ede9fe', color: '#5b21b6' },
  onepager:     { bg: '#e6f4f1', color: '#0f7b6c' },
}
const TYPE_LABELS: Record<string, string> = { landing: 'Landing Page', presentation: 'Prezentacja', onepager: 'One-pager', script: 'Skrypt handlowy', email: 'Sekwencja emaili' }

export default function TemplatesPage() {
  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Biblioteka szablonów</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#f7f7f5', borderBottom: '1px solid var(--border)' }}>
              <iframe
                src={`/templates/${t.file}`}
                title={t.name}
                loading="lazy"
                style={{ position: 'absolute', top: 0, left: 0, width: '400%', height: '400%', border: 0, transform: 'scale(0.25)', transformOrigin: 'top left', pointerEvents: 'none', background: 'white' }}
              />
              <span style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', background: TYPE_COLORS[t.type]?.bg ?? '#f7f7f5', color: TYPE_COLORS[t.type]?.color ?? '#787774', fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: 4 }}>{TYPE_LABELS[t.type] ?? t.type}</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{t.product}</div>
              <Link href={`/new?templateId=${t.id}`} style={{ display: 'block', padding: '6px 0', textAlign: 'center', background: 'var(--text-primary)', color: 'white', borderRadius: 5, fontSize: 12, fontWeight: 600, textDecoration: 'none', marginTop: 'auto' }}>Użyj szablonu</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
