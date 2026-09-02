'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, BriefcaseBusiness, Check, ChevronRight, CircleDollarSign, Flame, LayoutDashboard, ListChecks, Menu, Plus, Sparkles, Target, Trophy, UserRound, X, LogIn, LogOut, RotateCcw } from 'lucide-react'
import { TrabalhoView } from '@/components/trabalho-view'
import { ProjetosView } from '@/components/projetos-view'
import { PessoalView } from '@/components/pessoal-view'

type DashboardItem = { id: string; title: string; frequency: string; xp_reward: number; completed: boolean; kind: string }
type DashboardProject = { id: string; name: string; client_name: string | null; hourly_rate: number; hours: number; paid: number; status: string }
type DashboardActivity = { id: string; activity_type: string; xp: number; occurred_on: string; created_at: string }
type HistoryEntry = { activity_type: string; xp: number; occurred_on: string }
type WorkData = { id: string; month: string; monthly_salary: number } | null

export default function LifeQuestDashboard({ authenticatedEmail, profile, items, projects, activity, history, work, workDaysCount, alreadyMarkedToday, monthLabel }: { authenticatedEmail: string; profile: { display_name: string; level: number; total_xp: number }; items: DashboardItem[]; projects: DashboardProject[]; activity: DashboardActivity[]; history: HistoryEntry[]; work: WorkData; workDaysCount: number; alreadyMarkedToday: boolean; monthLabel: string }) {
  const router = useRouter()
  const [active, setActive] = useState('Visão geral')
  const [allItems, setAllItems] = useState(items.map((item) => ({ id: item.id, title: item.title, meta: `${item.frequency} • ${item.xp_reward} XP`, done: item.completed, xpReward: item.xp_reward, kind: item.kind })))
  const habits = allItems.filter((item) => item.kind !== 'task')
  const [liveXp, setLiveXp] = useState(profile.total_xp)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userEmail, setUserEmail] = useState(authenticatedEmail)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const completed = habits.filter((habit) => habit.done).length
  const progress = habits.length ? Math.round((completed / habits.length) * 100) : 0
  const brDateKey = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' })
  const todayKey = brDateKey(new Date())
  const todayMidnight = new Date(`${todayKey}T00:00:00Z`)
  const headerDate = (() => {
    const raw = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Fortaleza' })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  })()
  const totalXp = liveXp
  const xpTarget = Math.max(profile.level * 300, 300)
  const xpProgress = Math.min(100, Math.round((totalXp / xpTarget) * 100))
  const xpRemaining = Math.max(xpTarget - totalXp, 0)
  const projectIncome = projects.reduce((sum, project) => sum + Number(project.hourly_rate || 0) * Number(project.hours || 0) - Number(project.paid || 0), 0)

  const dayMs = 24 * 60 * 60 * 1000
  const toKey = (d: Date) => d.toISOString().slice(0, 10)
  const habitEntries = history.filter((entry) => entry.activity_type === 'habit_completed')
  const countsByDay: Record<string, number> = {}
  const xpByDay: Record<string, number> = {}
  habitEntries.forEach((entry) => {
    countsByDay[entry.occurred_on] = (countsByDay[entry.occurred_on] || 0) + 1
    xpByDay[entry.occurred_on] = (xpByDay[entry.occurred_on] || 0) + Number(entry.xp || 0)
  })
  const dailyCounts = Array.from({ length: 84 }, (_, i) => countsByDay[toKey(new Date(todayMidnight.getTime() - (83 - i) * dayMs))] || 0)
  const heatmap = dailyCounts.map((count) => count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3)
  const activePercent = Math.round((heatmap.filter((value) => value > 0).length / 84) * 100)

  let currentStreak = 0
  for (let i = 83; i >= 0; i--) { if (dailyCounts[i] > 0) currentStreak++; else break }
  let bestStreak = 0; let run = 0
  for (let i = 0; i < 84; i++) { if (dailyCounts[i] > 0) { run++; bestStreak = Math.max(bestStreak, run) } else { run = 0 } }

  const last7Counts = dailyCounts.slice(-7).reduce((sum, count) => sum + count, 0)
  const weeklyTarget = habits.length * 7
  const weeklyFocus = weeklyTarget > 0 ? Math.min(100, Math.round((last7Counts / weeklyTarget) * 100)) : 0
  const last7Keys = Array.from({ length: 7 }, (_, i) => toKey(new Date(todayMidnight.getTime() - (6 - i) * dayMs)))
  const weeklyXp = last7Keys.reduce((sum, key) => sum + (xpByDay[key] || 0), 0)
  const nav = [{ label: 'Visão geral', icon: LayoutDashboard }, { label: 'Pessoal', icon: Target }, { label: 'Trabalho', icon: BriefcaseBusiness }, { label: 'Projetos', icon: ListChecks }]
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400) }

  async function authenticate() {
    setBusy(true)
    const supabase = createClient()
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } })
    setBusy(false)
    if (result.error) { notify(result.error.message.includes('Invalid') ? 'Email ou senha inválidos.' : result.error.message); return }
    setUserEmail(email); setAccountOpen(false); notify(authMode === 'login' ? 'Sessão iniciada.' : 'Conta criada. Verifique seu email se necessário.')
  }

  async function resetAccount() {
    if (!userEmail || !window.confirm('Apagar todos os seus hábitos, projetos, atividades e XP? Esta ação não pode ser desfeita.')) return
    setBusy(true); const { error } = await createClient().rpc('reset_lifequest_account'); setBusy(false)
    if (error) { notify('Não foi possível resetar agora.'); return }
    setAllItems([])
    notify('Dados da conta apagados com sucesso.')
    router.replace('/onboarding')
    router.refresh()
  }
  async function logout() { await createClient().auth.signOut(); setUserEmail(''); setAccountOpen(false); router.replace('/auth/login'); router.refresh() }
  async function toggleItem(id: string) {
    const item = allItems.find((entry) => entry.id === id)
    if (!item) return
    const wasDone = item.done
    setAllItems((entries) => entries.map((entry) => entry.id === id ? { ...entry, done: !entry.done } : entry))
    notify(wasDone ? 'Reaberto.' : `Concluído. +${item.xpReward} XP!`)
    const supabase = createClient()
    await supabase.from('lifequest_items').update({ completed: !wasDone }).eq('id', id)
    if (!userEmail) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const todayStr = brDateKey(new Date())
    if (!wasDone) {
      await supabase.from('lifequest_activity').insert({ activity_type: 'habit_completed', xp: item.xpReward, occurred_on: todayStr })
      const newTotal = totalXp + item.xpReward
      await supabase.from('lifequest_profiles').update({ total_xp: newTotal }).eq('id', user.id)
      setLiveXp(newTotal)
    } else {
      const { data: recentEntry } = await supabase.from('lifequest_activity').select('id').eq('user_id', user.id).eq('activity_type', 'habit_completed').eq('xp', item.xpReward).eq('occurred_on', todayStr).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (recentEntry) await supabase.from('lifequest_activity').delete().eq('id', recentEntry.id)
      const newTotal = Math.max(0, totalXp - item.xpReward)
      await supabase.from('lifequest_profiles').update({ total_xp: newTotal }).eq('id', user.id)
      setLiveXp(newTotal)
    }
  }

  return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto flex min-h-screen max-w-[1500px]">
    <aside className={`${menuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-sidebar p-5 transition-transform lg:static lg:translate-x-0`}><div className="mb-10 flex items-center justify-between gap-3 px-2"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></div><span className="text-lg font-bold">LifeQuest</span></div><button onClick={() => setMenuOpen(false)} className="lg:hidden" aria-label="Fechar menu"><X className="size-5" /></button></div><nav className="flex flex-col gap-2" aria-label="Navegação principal">{nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setMenuOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${active === label ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="size-4" />{label}</button>)}</nav><div className="mt-auto rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4 text-primary" />Nível {profile.level}</div><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{totalXp} / {xpTarget} XP</span><span>{xpProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${xpProgress}%` }} /></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Mais {xpRemaining} XP para chegar ao nível {profile.level + 1}.</p></div></aside>
    {menuOpen && <button className="fixed inset-0 z-10 bg-foreground/20 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}
    <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10"><header className="mb-8 flex items-start justify-between gap-4"><div className="flex items-start gap-3"><button onClick={() => setMenuOpen(true)} className="mt-1 rounded-lg p-2 hover:bg-accent lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{headerDate}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Olá, {profile.display_name}.</h1><p className="mt-2 text-sm text-muted-foreground">Seu painel de progresso pessoal</p></div></div><button onClick={() => setAccountOpen(true)} className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Abrir conta"><UserRound className="size-5" /></button></header>
      {active === 'Visão geral' && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Flame} label="Streak atual" value={`${currentStreak} dia${currentStreak === 1 ? '' : 's'}`} note={`Seu melhor: ${bestStreak} dia${bestStreak === 1 ? '' : 's'}`} /><Stat icon={Trophy} label="XP total" value={`${totalXp} XP`} note={`+${weeklyXp} XP esta semana`} /><Stat icon={CircleDollarSign} label="A receber" value={`R$ ${projectIncome.toLocaleString('pt-BR')}`} note={`${projects.length} projetos ativos`} /><Stat icon={BarChart3} label="Foco semanal" value={`${weeklyFocus}%`} note="Hábitos concluídos nos últimos 7 dias" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]"><div className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-semibold">Hábitos de hoje</h2><p className="mt-1 text-sm text-muted-foreground">{completed} de {habits.length} concluídos</p></div><button onClick={() => setActive('Pessoal')} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"><Plus className="size-4" />Novo</button></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div><div className="flex flex-col gap-3">{habits.map((habit) => <button key={habit.id} onClick={() => toggleItem(habit.id)} className="group flex items-center gap-3 rounded-xl border border-border/70 p-3 text-left hover:border-primary/40 hover:bg-accent/50"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${habit.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{habit.done && <Check className="size-4" />}</span><span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${habit.done ? 'text-muted-foreground line-through' : ''}`}>{habit.title}</span><span className="mt-1 block text-xs text-muted-foreground">{habit.meta}</span></span><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div></div><div className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="mb-5"><h2 className="font-semibold">Atividade recente</h2><p className="mt-1 text-sm text-muted-foreground">Seus últimos movimentos</p></div><div className="flex flex-col gap-5">{activity.map((entry) => { const title = entry.activity_type === 'habit_completed' ? 'Hábito concluído' : 'Atividade registrada'; const type = entry.activity_type; const xp = `+${entry.xp} XP`; const time = new Date(entry.created_at).toLocaleDateString('pt-BR'); return <div key={title} className="flex gap-3"><div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><Check className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{type}</p></div><div className="text-right"><p className="text-xs font-semibold text-primary">{xp}</p><p className="mt-1 text-[11px] text-muted-foreground">{time}</p></div></div>})}</div></div></div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Consistência</h2><p className="mt-1 text-sm text-muted-foreground">Sua atividade nos últimos 12 semanas</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">{activePercent}% ativo</span></div><div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">{heatmap.map((value, i) => <span key={i} title={`${value} atividades`} className={`size-4 rounded-[3px] ${value === 3 ? 'bg-primary' : value === 2 ? 'bg-primary/70' : value === 1 ? 'bg-primary/35' : 'bg-muted'}`} />)}</div></div>
      </>}
      {active === 'Trabalho' && <div className="mt-2"><TrabalhoView work={work} workDaysCount={workDaysCount} alreadyMarkedToday={alreadyMarkedToday} monthLabel={monthLabel} /></div>}
      {active === 'Projetos' && <div className="mt-2"><ProjetosView projects={projects} /></div>}
      {active === 'Pessoal' && <div className="mt-2"><PessoalView items={allItems} onToggle={toggleItem} /></div>}
    </section></div>
    {accountOpen && <div className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/30 p-4"><div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-bold">Sua conta</h2><p className="mt-1 text-sm text-muted-foreground">Salve seu progresso e controle seus dados.</p></div><button onClick={() => setAccountOpen(false)} aria-label="Fechar conta"><X className="size-5" /></button></div>{userEmail ? <div className="flex flex-col gap-3"><p className="rounded-xl bg-accent p-3 text-sm"><strong>Conectado:</strong> {userEmail}</p><button onClick={resetAccount} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"><RotateCcw className="size-4" />{busy ? 'Apagando dados...' : 'Apagar todos os dados'}</button><button onClick={logout} className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-accent"><LogOut className="size-4" />Sair da conta</button></div> : <div className="flex flex-col gap-4"><div className="flex gap-2 rounded-lg bg-muted p-1"><button onClick={() => setAuthMode('login')} className={`flex-1 rounded-md px-3 py-2 text-sm ${authMode === 'login' ? 'bg-card font-semibold shadow-sm' : ''}`}>Entrar</button><button onClick={() => setAuthMode('signup')} className={`flex-1 rounded-md px-3 py-2 text-sm ${authMode === 'signup' ? 'bg-card font-semibold shadow-sm' : ''}`}>Criar conta</button></div><label className="flex flex-col gap-2 text-sm font-medium">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-xl border border-border bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="voce@email.com" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} className="rounded-xl border border-border bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="Mínimo de 6 caracteres" /></label><button onClick={authenticate} disabled={busy || !email || password.length < 6} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"><LogIn className="size-4" />{busy ? 'Processando...' : authMode === 'login' ? 'Entrar' : 'Criar minha conta'}</button><p className="text-center text-xs text-muted-foreground">Seu progresso fica separado por conta. O reset mantém seu email e acesso.</p></div>}</div></div>}
    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">{toast}</div>}
  </main>
}
function Stat({ icon: Icon, label, value, note }: { icon: typeof Flame; label: string; value: string; note: string }) { return <div className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="size-4" /></span></div><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div> }
