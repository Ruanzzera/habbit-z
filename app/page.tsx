'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3, BriefcaseBusiness, Check, ChevronRight, CircleDollarSign, Flame,
  LayoutDashboard, ListChecks, Menu, Plus, Sparkles, Target, Trophy, UserRound, X,
} from 'lucide-react'

const initialHabits = [
  { id: 'h1', title: 'Treino / Movimento', meta: 'Diário • 20 XP', done: true, color: 'bg-primary' },
  { id: 'h2', title: 'Ler 30 minutos', meta: 'Diário • 15 XP', done: true, color: 'bg-primary' },
  { id: 'h3', title: 'Planejar o dia', meta: 'Diário • 10 XP', done: false, color: 'bg-accent' },
]
const activities = [
  ['Treino / Movimento', 'Hábito concluído', '+20 XP', '09:10'],
  ['Landing page — Acme', 'Projeto atualizado', '+15 XP', '08:42'],
  ['Ler 30 minutos', 'Hábito concluído', '+15 XP', 'Ontem'],
]
const heatmap = Array.from({ length: 84 }, (_, i) => (i % 9 === 0 ? 3 : i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0))

export default function Page() {
  const [active, setActive] = useState('Visão geral')
  const [habits, setHabits] = useState(initialHabits)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const completed = habits.filter((habit) => habit.done).length
  const progress = Math.round((completed / habits.length) * 100)
  const levelProgress = 68
  const nav = [
    { label: 'Visão geral', icon: LayoutDashboard },
    { label: 'Pessoal', icon: Target },
    { label: 'Trabalho', icon: BriefcaseBusiness },
    { label: 'Projetos', icon: ListChecks },
  ]

  const toggleHabit = async (id: string) => {
    const habit = habits.find((item) => item.id === id)
    if (!habit) return
    setHabits((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item))
    setToast(habit.done ? 'Hábito reaberto' : 'Hábito concluído. +XP!')
    window.setTimeout(() => setToast(''), 2200)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !habit.done) await supabase.from('lifequest_activity').insert({ user_id: user.id, activity_type: 'habit_completed', xp: 20, item_id: null })
    } catch { /* O modo demonstração continua funcionando sem sessão. */ }
  }

  const subtitle = useMemo(() => active === 'Visão geral' ? 'Seu painel de progresso pessoal' : `Acompanhe seu progresso em ${active.toLowerCase()}`, [active])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className={`${menuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-sidebar p-5 transition-transform lg:static lg:translate-x-0`}>
          <div className="mb-10 flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></div><span className="text-lg font-bold tracking-tight">LifeQuest</span></div>
            <button onClick={() => setMenuOpen(false)} className="lg:hidden" aria-label="Fechar menu"><X className="size-5" /></button>
          </div>
          <nav className="flex flex-col gap-2" aria-label="Navegação principal">
            {nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setMenuOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active === label ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="size-4" />{label}</button>)}
          </nav>
          <div className="mt-auto rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4 text-primary" />Nível 7</div><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>1.360 / 2.000 XP</span><span>68%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${levelProgress}%` }} /></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Mais 640 XP para chegar ao nível 8.</p></div>
        </aside>
        {menuOpen && <button className="fixed inset-0 z-10 bg-foreground/20 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}
        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <header className="mb-8 flex items-start justify-between gap-4"><div className="flex items-start gap-3"><button onClick={() => setMenuOpen(true)} className="mt-1 rounded-lg p-2 hover:bg-accent lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Quarta-feira, 30 de agosto</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Olá, Gabriel.</h1><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div></div><button className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground" aria-label="Perfil"><UserRound className="size-5" /></button></header>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Flame} label="Streak atual" value="12 dias" note="Seu melhor: 21 dias" tone="primary" />
            <Stat icon={Trophy} label="XP total" value="1.360 XP" note="+85 XP esta semana" tone="secondary" />
            <Stat icon={CircleDollarSign} label="A receber" value="R$ 4.250" note="3 projetos ativos" tone="accent" />
            <Stat icon={BarChart3} label="Foco semanal" value="76%" note="+12% vs. semana anterior" tone="primary" />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-semibold">Hábitos de hoje</h2><p className="mt-1 text-sm text-muted-foreground">{completed} de {habits.length} concluídos</p></div><button className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"><Plus className="size-4" />Novo</button></div><div className="mb-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div><div className="flex flex-col gap-3">{habits.map((habit) => <button key={habit.id} onClick={() => toggleHabit(habit.id)} className="group flex items-center gap-3 rounded-xl border border-border/70 p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${habit.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{habit.done && <Check className="size-4" />}</span><span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${habit.done ? 'text-muted-foreground line-through' : ''}`}>{habit.title}</span><span className="mt-1 block text-xs text-muted-foreground">{habit.meta}</span></span><ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></button>)}</div></div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Atividade recente</h2><p className="mt-1 text-sm text-muted-foreground">Seus últimos movimentos</p></div><button className="text-xs font-semibold text-primary hover:underline">Ver tudo</button></div><div className="flex flex-col gap-5">{activities.map(([title, type, xp, time]) => <div key={title} className="flex gap-3"><div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary"><Check className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{type}</p></div><div className="text-right"><p className="text-xs font-semibold text-primary">{xp}</p><p className="mt-1 text-[11px] text-muted-foreground">{time}</p></div></div>)}</div></div>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Consistência</h2><p className="mt-1 text-sm text-muted-foreground">Sua atividade nos últimos 12 semanas</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">82% ativo</span></div><div className="overflow-x-auto"><div className="grid min-w-[560px] grid-cols-[auto_1fr] gap-3"><div className="flex flex-col justify-between py-1 text-[10px] text-muted-foreground"><span>mais</span><span>menos</span></div><div><div className="mb-2 grid grid-cols-12 text-[10px] text-muted-foreground"><span>Jun</span><span></span><span>Jul</span><span></span><span>Ago</span></div><div className="grid grid-flow-col grid-rows-7 gap-1">{heatmap.map((value, i) => <span key={i} title={`${value} atividades`} className={`size-3 rounded-[3px] sm:size-4 ${value === 3 ? 'bg-primary' : value === 2 ? 'bg-primary/70' : value === 1 ? 'bg-primary/35' : 'bg-muted'}`} />)}</div></div></div></div></div>
          <div className="mt-6 grid gap-6 md:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center gap-2"><BriefcaseBusiness className="size-4 text-primary" /><h2 className="font-semibold">Projetos em foco</h2></div><div className="flex flex-col gap-4"><Project name="Landing page — Acme" client="Acme Corp" progress={72} value="R$ 2.400" /><Project name="Identidade visual — Nexo" client="Nexo Studio" progress={38} value="R$ 1.850" /></div></div><div className="rounded-2xl border border-border bg-primary p-5 text-primary-foreground"><div className="mb-4 flex items-center gap-2"><Sparkles className="size-4" /><h2 className="font-semibold">Missão do dia</h2></div><p className="text-lg font-semibold leading-snug">Finalize uma tarefa importante antes do meio-dia.</p><p className="mt-2 text-sm text-primary-foreground/70">Complete para ganhar um bônus de 50 XP.</p><button className="mt-5 rounded-lg bg-primary-foreground px-4 py-2 text-xs font-bold text-primary hover:opacity-90">Aceitar missão</button></div></div>
        </section>
      </div>{toast && <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">{toast}</div>}
    </main>
  )
}

function Stat({ icon: Icon, label, value, note, tone }: { icon: typeof Flame; label: string; value: string; note: string; tone: 'primary' | 'secondary' | 'accent' }) { return <div className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><span className={`flex size-8 items-center justify-center rounded-lg ${tone === 'primary' ? 'bg-accent text-primary' : tone === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-foreground'}`}><Icon className="size-4" /></span></div><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div> }
function Project({ name, client, progress, value }: { name: string; client: string; progress: number; value: string }) { return <div><div className="mb-2 flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{client}</p></div><span className="text-xs font-semibold">{value}</span></div><div className="flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div><span className="text-xs text-muted-foreground">{progress}%</span></div></div> }
