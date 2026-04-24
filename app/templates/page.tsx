'use client'
import Link from 'next/link'
import { TEMPLATES } from '@/lib/templates'

const TYPE_ICONS: Record<string, string> = { landing: '🌐', presentation: '📊', onepager: '📄' }
const TYPE_LABELS: Record<string, string> = { landing: 'Landing Page', presentation: 'Prezentacja', onepager: 'One-pager' }

export default function TemplatesPage() {
  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>📚 Biblioteka szablonów</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
            <div style={{ height: 80, background: 'linear-gradient(135deg, var(--bg-sidebar), var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {TYPE_ICONS[t.type]}
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{TYPE_LABELS[t.type]} · {t.product}</div>
              <Link href={`/new?templateId=${t.id}`} style={{ display: 'block', padding: '5px 0', textAlign: 'center', background: 'var(--text-primary)', color: 'white', borderRadius: 5, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>Użyj szablonu</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
