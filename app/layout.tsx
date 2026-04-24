import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'Canvas | LSI Software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/lsi-favicon.png" sizes="500x500" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
