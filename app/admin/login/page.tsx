import LoginForm from '@/components/admin/LoginForm'

export const metadata = { title: 'Admin Login — LSCE' }

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <LoginForm />
  )
}
