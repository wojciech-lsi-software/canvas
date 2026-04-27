export interface Material {
  id: string
  name: string
  type: 'landing' | 'presentation' | 'onepager' | 'script' | 'email'
  client: string
  product: string
  blobUrl: string
  thumbnailUrl?: string
  templateId?: string
  params?: {
    clientName: string
    clientIndustry: string
    productName: string
    logoUrl: string
    accentColor: string
    focus: string
  }
  locked?: boolean
  createdAt: string
}

export async function fetchMaterials(): Promise<Material[]> {
  try {
    const res = await fetch('/api/materials', { cache: 'no-store' })
    if (!res.ok) return []
    return res.json() as Promise<Material[]>
  } catch {
    return []
  }
}
