import { createSupabaseServerClient } from '@/lib/supabase-server'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = { title: 'LSCE Admin' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // No user = login page (middleware already handles redirect for protected routes).
  // Render children directly — no sidebar, no shell.
  if (!user) {
    return (
      <html lang="en" className="h-full">
        <body className="min-h-full bg-[#0D0D0D] text-white antialiased">
          {children}
        </body>
      </html>
    )
  }

  // Authenticated — full admin shell with sidebar
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0D0D0D] text-white antialiased">
        <AdminShell email={user.email}>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}
