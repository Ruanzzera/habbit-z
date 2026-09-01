'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CalendarCheck } from 'lucide-react'

type WorkData = { id: string; month: string; monthly_salary: number } | null

export function TrabalhoView({ work, workDaysCount, alreadyMarkedToday, monthLabel }: { work: WorkData; workDaysCount: number; alreadyMarkedToday: boolean; monthLabel: string }) {
  const router = useRouter()
  const [salaryInput, setSalaryInput] = useState(work ? String(work.monthly_salary) : '')
  const [busy, setBusy] = useState(false)

  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' })
  const year = Number(todayKey.slice(0, 4))
  const month = Number(todayKey.slice(5, 7))
  const daysInMonth = new Date(year, month, 0).getDate()
  let businessDays = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const weekday = new Date(year, month - 1, d).getDay()
    if (weekday !== 0 && weekday !== 6) businessDays++
  }

  const monthlySalary = work ? Number(work.monthly_salary) : 0
  const dailyValue = businessDays > 0 ? monthlySalary / businessDays : 0
  const accumulated = dailyValue * workDaysCount

  async function saveSalary() {
    const value = Number(salaryInput.replace(',', '.'))
    if (Number.isNaN(value) || value < 0) return
    setBusy(true)
    const supabase = createClient()
    const monthKey = todayKey.slice(0, 7)
    await supabase.from('lifequest_work').upsert({ month: monthKey, monthly_salary: value }, { onConflict: 'user_id,month' })
    setBusy(false)
    router.refresh()
  }

  async function markToday() {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('lifequest_work_days').insert({ worked_on: todayKey })
    if (!error) await supabase.from('lifequest_activity').insert({ activity_type: 'work_day', xp: 10, occurred_on: todayKey })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-semibold">Salário de {monthLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Informe o valor bruto do mês para acompanhar quanto você já &quot;ganhou&quot; a cada dia trabalhado.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)} inputMode="decimal" placeholder="Ex: 2500" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm sm:max-w-xs" />
          <button onClick={saveSalary} disabled={busy} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? 'Salvando...' : 'Salvar salário'}</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Dias úteis no mês</p><p className="mt-1 text-2xl font-bold">{businessDays}</p></div>
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Valor por dia</p><p className="mt-1 text-2xl font-bold">R$ {dailyValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p></div>
        <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Já acumulado no mês</p><p className="mt-1 text-2xl font-bold text-primary">R$ {accumulated.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p></div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Dias trabalhados</h2>
            <p className="mt-1 text-sm text-muted-foreground">{workDaysCount} dia{workDaysCount === 1 ? '' : 's'} marcado{workDaysCount === 1 ? '' : 's'} este mês</p>
          </div>
          <button onClick={markToday} disabled={busy || alreadyMarkedToday} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            <CalendarCheck className="size-4" />{alreadyMarkedToday ? 'Hoje já marcado' : 'Marquei hoje'}
          </button>
        </div>
      </div>
    </div>
  )
}
