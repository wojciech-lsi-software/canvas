'use client'
import { useEffect, useState } from 'react'
import { fetchContext, LSIContext } from '@/lib/context'

export default function ContextPage() {
  const [ctx, setCtx] = useState<LSIContext>({})
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { fetchContext().then(setCtx) }, [])

  async function syncNow() {
    setSyncing(true)
    try {
      await fetch('https://marketing-hub.vercel.app/api/sync-context', { method: 'POST' })
      const fresh = await fetchContext()
      setCtx(fresh)
    } catch {
      // sync failed silently — context will be stale
    } finally {
      setSyncing(false)
    }
  }

  const synced = !!ctx.synced_at

  return (
    <div style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Kontekst Growth Hub</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: synced ? 'var(--green)' : 'var(--text-muted)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {synced ? `Zsynchronizowano: ${new Date(ctx.synced_at!).toLocaleString('pl')}` : 'Brak synchronizacji'}
        </span>
        <button onClick={syncNow} disabled={syncing} style={{ marginLeft: 'auto', padding: '5px 14px', background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: syncing ? 'default' : 'pointer' }}>
          {syncing ? 'Synchronizuję...' : 'Synchronizuj teraz'}
        </button>
      </div>

      {ctx.team?.length ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Zespół</div>
          {ctx.team.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{m.initials}</div>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role}</div></div>
            </div>
          ))}
        </div>
      ) : null}

      {ctx.epics?.length ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Epiki</div>
          {ctx.epics.map(e => (
            <div key={e.id} style={{ padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              {e.name}{e.phase ? <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)' }}>{e.phase}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
