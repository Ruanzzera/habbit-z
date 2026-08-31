import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LifeQuestDashboard from '@/components/lifequest-dashboard'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('lifequest_profiles').select('setup_completed').eq('id', user.id).maybeSingle()
  if (!profile || profile.setup_completed !== true) redirect('/onboarding')
  return <LifeQuestDashboard authenticatedEmail={user.email ?? ''} />
}
