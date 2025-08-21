import './globals.css'

export const metadata = {
  title: 'Control Plane - Restaurant Management',
  description: 'Admin dashboard for restaurant management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}