'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'

const LSI_LOGO = 'https://www.lsisoftware.pl/wp-content/uploads/2020/01/LSI_Software_blue_500px.png'

const icoStyle: React.CSSProperties = { width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, flexShrink: 0 }

const NAV = [
  {
    section: 'Generuj',
    items: [
      {
        href: '/chat',
        label: 'Opisz i generuj',
        icon: <svg style={icoStyle} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      },
      {
        href: '/new',
        label: 'Kreator krok po kroku',
        icon: <svg style={icoStyle} viewBox="0 0 24 24"><path d="M12 2l1.68 3.4 3.77.55-2.73 2.66.65 3.75L12 10.5l-3.37 1.86.65-3.75L6.55 5.95l3.77-.55L12 2z"/><path d="M5 22v-4"/><path d="M12 22v-7"/><path d="M19 22v-2"/></svg>,
      },
      {
        href: '/remix',
        label: 'Remix HTML',
        icon: <svg style={icoStyle} viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
      },
    ],
  },
  {
    section: 'Biblioteka',
    items: [
      {
        href: '/templates',
        label: 'Szablony',
        icon: <svg style={icoStyle} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
      },
      {
        href: '/materials',
        label: 'Moje materiały',
        icon: <svg style={icoStyle} viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
      },
    ],
  },
  {
    section: 'System',
    items: [
      {
        href: '/context',
        label: 'Synchronizacja danych',
        icon: <svg style={icoStyle} viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
      },
    ],
  },
]

const TOOLS = [
  {
    href: 'https://task-agent-eight.vercel.app',
    label: 'Pulse',
    icon: <svg style={icoStyle} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    href: 'https://marketing-hub.vercel.app',
    label: 'Growth Hub',
    icon: <svg style={icoStyle} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
]

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  return (
    <aside style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '14px 12px 8px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 5, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
          <img src={LSI_LOGO} alt="LSI Software" style={{ height: 16 }} />
          Canvas
        </Link>
      </div>

      {NAV.map(group => (
        <div key={group.section} style={{ padding: '6px 0' }}>
          <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {group.section}
          </div>
          {group.items.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 4, margin: '1px 4px', fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', background: active ? 'var(--bg-selected)' : 'transparent', fontWeight: active ? 500 : 400, transition: 'background 0.1s', textDecoration: 'none' }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}

      <div style={{ padding: '6px 0', marginTop: 'auto' }}>
        <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Narzędzia
        </div>
        {TOOLS.map(tool => (
          <a
            key={tool.href}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 4, margin: '1px 4px', fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', fontWeight: 400, transition: 'background 0.1s', textDecoration: 'none' }}
          >
            {tool.icon}
            {tool.label}
            <svg style={{ ...icoStyle, width: 10, height: 10, marginLeft: 'auto', opacity: 0.4 }} viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        ))}
      </div>

      <div style={{ padding: '8px 4px 16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => { logout(); onLogout() }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 4, width: '100%', fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.1s', textAlign: 'left' }}
        >
          <svg style={icoStyle} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Wyloguj
        </button>
        <div style={{ padding: '3px 12px 0', fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>Canvas · v1.0</div>
      </div>
    </aside>
  )
}
