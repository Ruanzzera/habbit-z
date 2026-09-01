import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LifeQuestDashboard from '@/components/lifequest-dashboard'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('lifequest_profiles').select('setup_completed, display_name, level, total_xp').eq('id', user.id).maybeSingle()
  if (!profile || profile.setup_completed !== true) redirect('/onboarding')
  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' })
  const windowStart = new Date(`${todayKey}T00:00:00Z`)
  windowStart.setUTCDate(windowStart.getUTCDate() - 83)
  const windowStartStr = windowStart.toISOString().slice(0, 10)
  const [{ data: items }, { data: projects }, { data: activity }, { data: history }] = await Promise.all([
    supabase.from('lifequest_items').select('id, title, frequency, xp_reward, completed').eq('user_id', user.id).eq('kind', 'habit').order('created_at'),
    supabase.from('lifequest_projects').select('id, name, client_name, hourly_rate, hours, paid, status').eq('user_id', user.id).order('created_at'),
    supabase.from('lifequest_activity').select('id, activity_type, xp, occurred_on, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('lifequest_activity').select('activity_type, xp, occurred_on').eq('user_id', user.id).gte('occurred_on', windowStartStr),
  ])
  return <LifeQuestDashboard authenticatedEmail={user.email ?? ''} profile={profile} items={items ?? []} projects={projects ?? []} activity={activity ?? []} history={history ?? []} />
}
