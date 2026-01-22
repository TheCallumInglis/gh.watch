export const metadata = {
  title: 'GH Watch',
  description: 'Track open GitHub pull requests across multiple repositories.',
  repository: 'https://github.com/cinglis/gh.watch'
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
