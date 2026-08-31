import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LifeQuestDashboard from '@/components/lifequest-dashboard'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return <LifeQuestDashboard authenticatedEmail={user.email ?? ''} />
}
