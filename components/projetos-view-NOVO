'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

type Project = { id: string; name: string; client_name: string | null; hourly_rate: number; hours: number; paid: number; status: string }

export function ProjetosView({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [newOpen, setNewOpen] = useState(false)
  const [logOpen, setLogOpen] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [hoursInput, setHoursInput] = useState('')
  const [payInput, setPayInput] = useState('')

  async function createProject() {
    const rateValue = Number(rate.replace(',', '.'))
    if (!name.trim() || Number.isNaN(rateValue) || rateValue < 0) return
    setBusy(true)
    const supabase = createClient()
    await supabase.from('lifequest_projects').insert({ name: name.trim(), hourly_rate: rateValue, hours: 0, paid: 0, status: 'active' })
    setBusy(false)
    setNewOpen(false)
    setName(''); setRate('')
    router.refresh()
  }

  async function logHours(project: Project) {
    const hoursValue = Number(hoursInput.replace(',', '.'))
    if (Number.isNaN(hoursValue) || hoursValue <= 0) return
    setBusy(true)
    const supabase = createClient()
    const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' })
    const xp = Math.round(hoursValue * 5)
    await supabase.from('lifequest_projects').update({ hours: Number(project.hours) + hoursValue }).eq('id', project.id)
    await supabase.from('lifequest_activity').insert({ activity_type: 'project_hours', xp, occurred_on: todayKey })
    setBusy(false)
    setLogOpen(null)
    setHoursInput('')
    router.refresh()
  }

  async function logPayment(project: Project) {
    const payValue = Number(payInput.replace(',', '.'))
    if (Number.isNaN(payValue) || payValue <= 0) return
    setBusy(true)
    const supabase = createClient()
    await supabase.from('lifequest_projects').update({ paid: Number(project.paid) + payValue }).eq('id', project.id)
    setBusy(false)
    setPayOpen(null)
    setPayInput('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Seus projetos</h2>
        <button onClick={() => setNewOpen(true)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"><Plus className="size-4" />Novo projeto</button>
      </div>

      {projects.length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Você ainda não tem projetos. Crie o primeiro — pode ser um hobby, um canal, um freela.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => {
          const saldo = Number(project.hourly_rate) * Number(project.hours) - Number(project.paid)
          return (
            <div key={project.id} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold">{project.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">R$ {Number(project.hourly_rate).toLocaleString('pt-BR')}/hora • {Number(project.hours).toLocaleString('pt-BR')}h registradas</p>
              <p className="mt-3 text-2xl font-bold text-primary">R$ {saldo.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground">saldo a receber</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setLogOpen(project.id); setPayOpen(null) }} className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent">Registrar horas</button>
                <button onClick={() => { setPayOpen(project.id); setLogOpen(null) }} className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent">Recebi pagamento</button>
              </div>
              {logOpen === project.id && (
                <div className="mt-3 flex items-center gap-2">
                  <input value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} inputMode="decimal" placeholder="Horas" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <button onClick={() => logHours(project)} disabled={busy} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">OK</button>
                  <button onClick={() => setLogOpen(null)} aria-label="Cancelar"><X className="size-4" /></button>
                </div>
              )}
              {payOpen === project.id && (
                <div className="mt-3 flex items-center gap-2">
                  <input value={payInput} onChange={(e) => setPayInput(e.target.value)} inputMode="decimal" placeholder="Valor recebido" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <button onClick={() => logPayment(project)} disabled={busy} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">OK</button>
                  <button onClick={() => setPayOpen(null)} aria-label="Cancelar"><X className="size-4" /></button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {newOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between"><h2 className="text-xl font-bold">Novo projeto</h2><button onClick={() => setNewOpen(false)} aria-label="Fechar"><X className="size-5" /></button></div>
            <div className="flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do projeto" className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              <input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" placeholder="Valor por hora (R$)" className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              <button onClick={createProject} disabled={busy} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? 'Criando...' : 'Criar projeto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
