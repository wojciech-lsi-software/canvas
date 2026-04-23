export interface LSIContext {
  team?: Array<{ id: string; name: string; role: string; initials: string }>
  epics?: Array<{ id: string; name: string; phase?: string }>
  leads?: Array<{ id: string; name: string; industry?: string }>
  synced_at?: string
}

export async function fetchContext(): Promise<LSIContext> {
  try {
    const res = await fetch('/api/context', { cache: 'no-store' })
    if (!res.ok) return {}
    return res.json() as Promise<LSIContext>
  } catch {
    return {}
  }
}
