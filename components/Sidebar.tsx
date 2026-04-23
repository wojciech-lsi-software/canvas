'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'

const LSI_LOGO = 'https://www.lsisoftware.pl/wp-content/uploads/2020/01/LSI_Software_blue_500px.png'

const NAV = [
  { section: 'Generuj', items: [
    { href: '/chat', label: 'Szybki chat', icon: '⚡' },
    { href: '/new', label: 'Nowy materiał', icon: '✨' },
  ]},
  { section: 'Biblioteka', items: [
    { href: '/templates', label: 'Szablony', icon: '📚' },
    { href: '/materials', label: 'Moje materiały', icon: '📄' },
  ]},
  { section: 'System', items: [
    { href: '/context', label: 'Kontekst', icon: '🔗' },
  ]},
]

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  return (
    <aside style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '14px 12px 8px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 5, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          <img src={LSI_LOGO} alt="LSI Software" style={{ height: 16 }} />
          Canvas
        </Link>
      </div>

      {NAV.map(group => (
        <div key={group.section} style={{ padding: '6px 0' }}>
          <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {group.section}
          </div>
          {group.items.map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 4, margin: '1px 4px', fontSize: 13.5, color: pathname === item.href ? 'var(--text-primary)' : 'var(--text-secondary)', background: pathname === item.href ? 'var(--bg-selected)' : 'transparent', fontWeight: pathname === item.href ? 500 : 400, transition: 'background 0.1s' }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '8px 12px 16px' }}>
        <button onClick={() => { logout(); onLogout() }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 4, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', width: '100%', transition: 'background 0.1s' }}>
          Wyloguj
        </button>
      </div>
    </aside>
  )
}
