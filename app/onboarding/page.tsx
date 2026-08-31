'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [habits, setHabits] = useState('')
  const [projects, setProjects] = useState('')
  const [goal, setGoal] = useState('')
  const [focus, setFocus] = useState('Equilibrado')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function finish() {
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/login'); return }
    const habitRows = habits.split('\n').map((title) => title.trim()).filter(Boolean).map((title) => ({ user_id: user.id, title, kind: 'habit', category: 'Pessoal', frequency: 'Diário', xp_reward: 10, completed: false }))
    const projectRows = projects.split('\n').map((name) => name.trim()).filter(Boolean).map((name) => ({ user_id: user.id, name, client_name: null, hourly_rate: 0, hours: 0, paid: 0, status: 'Em andamento' }))
    const profile = await supabase.from('lifequest_profiles').upsert({ id: user.id, display_name: name.trim() || 'Aventureiro', setup_completed: true, total_xp: 0, level: 1, updated_at: new Date().toISOString() })
    if (profile.error) { setError('Não foi possível salvar seu perfil. Tente novamente.'); setBusy(false); return }
    if (habitRows.length) { const result = await supabase.from('lifequest_items').insert(habitRows); if (result.error) { setError('Não foi possível salvar seus hábitos.'); setBusy(false); return } }
    if (projectRows.length) { const result = await supabase.from('lifequest_projects').insert(projectRows); if (result.error) { setError('Não foi possível salvar seus projetos.'); setBusy(false); return } }
    router.replace('/')
    router.refresh()
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground"><section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold text-primary">LifeQuest</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Vamos configurar sua jornada</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tudo começa do zero. Você define o que importa.</p></div><span className="text-sm font-semibold text-muted-foreground">{step} / 4</span></div><div className="mb-8 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step * 25}%` }} /></div>{step === 1 && <div className="flex flex-col gap-4"><label className="text-sm font-semibold">Como devemos chamar você?<input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="Seu nome" /></label><button onClick={() => setStep(2)} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Continuar</button></div>}{step === 2 && <div className="flex flex-col gap-4"><label className="text-sm font-semibold">Quais hábitos quer acompanhar?<span className="mt-1 block font-normal text-muted-foreground">Um por linha. Você poderá editar depois.</span><textarea value={habits} onChange={(e) => setHabits(e.target.value)} className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder={'Beber água\nTreinar\nLer 20 minutos'} /></label><div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold">Voltar</button><button onClick={() => setStep(3)} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Continuar</button></div></div>}{step === 3 && <div className="flex flex-col gap-4"><label className="text-sm font-semibold">Quais projetos quer organizar?<span className="mt-1 block font-normal text-muted-foreground">Um projeto por linha. Pode deixar vazio.</span><textarea value={projects} onChange={(e) => setProjects(e.target.value)} className="mt-2 min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder={'Meu próximo produto\nFreelance — cliente'} /></label><label className="text-sm font-semibold">Qual é sua principal meta agora?<input value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" placeholder="Ex.: lançar meu projeto" /></label><div className="flex gap-3"><button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold">Voltar</button><button onClick={() => setStep(4)} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Continuar</button></div></div>}{step === 4 && <div className="flex flex-col gap-4"><label className="text-sm font-semibold">Como prefere organizar seu foco?<select value={focus} onChange={(e) => setFocus(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary"><option>Equilibrado</option><option>Alta performance</option><option>Leve e consistente</option></select></label><div className="rounded-2xl bg-accent p-4 text-sm leading-relaxed text-accent-foreground">Sua meta: <strong>{goal || 'Definir uma direção'}</strong><br />Foco: <strong>{focus}</strong></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex gap-3"><button onClick={() => setStep(3)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold">Voltar</button><button onClick={finish} disabled={busy} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">{busy ? 'Salvando...' : 'Começar minha jornada'}</button></div></div>}</section></main>
}
