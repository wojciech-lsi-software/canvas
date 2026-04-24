async function getToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.SHAREPOINT_CLIENT_ID!,
        client_secret: process.env.SHAREPOINT_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  )
  const data = await res.json()
  return data.access_token
}

export async function uploadToSharePoint(filename: string, content: string): Promise<string> {
  const token = await getToken()
  const siteId = process.env.SHAREPOINT_SITE_ID
  const folder = process.env.SHAREPOINT_FOLDER ?? 'MaterialMaker'

  const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/root:/${folder}/${filename}:/content`
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/html',
    },
    body: content,
  })

  if (!res.ok) throw new Error(`SharePoint upload failed: ${res.status}`)
  const data = await res.json()
  return data.id
}
