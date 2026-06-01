import { createSupabaseServerClient } from '@/lib/supabase-server'
import TeamManager from '@/components/admin/TeamManager'

export const metadata = { title: 'Team — LSCE Admin' }

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <TeamManager currentUserEmail={user?.email} />
}
