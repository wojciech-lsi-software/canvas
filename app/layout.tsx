import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'Canvas — LSI Software',
  icons: {
    icon: 'https://www.lsisoftware.pl/wp-content/uploads/2020/01/LSI_Software_blue_500px.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
