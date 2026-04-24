import { Material } from '@/lib/storage'

const TYPE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  landing:      { bg: '#e7f0fd', color: '#2383e2', label: 'Landing' },
  presentation: { bg: '#ede9fe', color: '#5b21b6', label: 'Prezentacja' },
  onepager:     { bg: '#e6f4f1', color: '#0f7b6c', label: 'One-pager' },
  script:       { bg: '#fff3e6', color: '#c4320a', label: 'Skrypt' },
  email:        { bg: '#fef3f2', color: '#9b6700', label: 'Email' },
}

export default function MaterialCard({ material }: { material: Material }) {
  const type = TYPE_COLORS[material.type] ?? TYPE_COLORS.landing

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
      <div style={{ height: 80, background: material.type === 'landing' ? '#e7f0fd' : material.type === 'presentation' ? '#ede9fe' : '#e6f4f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: type.color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{type.label}</span>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: type.bg, color: type.color, fontWeight: 600 }}>{type.label}</span>
          <span style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{material.name}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{material.client} · {new Date(material.createdAt).toLocaleDateString('pl')}</div>
      </div>
      <div style={{ padding: '0 12px 10px', display: 'flex', gap: 6 }}>
        <a href={material.blobUrl} target="_blank" style={{ flex: 1, padding: '4px 0', textAlign: 'center', background: 'var(--bg-sidebar)', borderRadius: 4, fontSize: 10, color: 'var(--text-secondary)', textDecoration: 'none' }}>Podgląd</a>
        <a href={`/material/${material.id}`} style={{ flex: 1, padding: '4px 0', textAlign: 'center', background: 'var(--accent)', borderRadius: 4, fontSize: 10, color: 'white', textDecoration: 'none' }}>Edytuj</a>
      </div>
    </div>
  )
}
