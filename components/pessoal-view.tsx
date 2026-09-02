'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Plus, Trash2, X } from 'lucide-react'

type Item = { id: string; title: string; meta: string; done: boolean; xpReward: number; kind: string }

export function PessoalView({ items, onToggle }: { items: Item[]; onToggle: (id: string) => void }) {
  const router = useRouter()
  const [newOpen, setNewOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState('Diário')
  const [xpReward, setXpReward] = useState('10')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function createItem() {
    if (!title.trim()) return
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sessão expirada. Recarregue a página e faça login de novo.'); setBusy(false); return }
    const kind = frequency === 'Pontual' ? 'task' : 'habit'
    const { error: err } = await supabase.from('lifequest_items').insert({ user_id: user.id, title: title.trim(), kind, category: 'Pessoal', frequency, xp_reward: Number(xpReward) || 10, completed: false })
    setBusy(false)
    if (err) { setError(err.message); return }
    setNewOpen(false)
    setTitle('')
    setXpReward('10')
    router.refresh()
  }

  async function removeItem(id: string) {
    setBusy(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('lifequest_items').delete().eq('id', id)
    setBusy(false)
    if (err) { setError(err.message); return }
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Hábitos e tarefas</h2>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} no total</p>
        </div>
        <button onClick={() => setNewOpen(true)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"><Plus className="size-4" />Novo</button>
      </div>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}

      {items.length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Você ainda não tem hábitos ou tarefas. Crie o primeiro.</p>}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
            <button onClick={() => onToggle(item.id)} className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${item.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>{item.done && <Check className="size-4" />}</button>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-medium ${item.done ? 'text-muted-foreground line-through' : ''}`}>{item.title}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{item.meta} • {item.kind === 'task' ? 'Pontual' : 'Recorrente'}</span>
            </span>
            <button onClick={() => removeItem(item.id)} disabled={busy} aria-label="Remover" className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>

      {newOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between"><h2 className="text-xl font-bold">Novo hábito ou tarefa</h2><button onClick={() => setNewOpen(false)} aria-label="Fechar"><X className="size-5" /></button></div>
            <div className="flex flex-col gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                <option value="Diário">Diário (recorrente)</option>
                <option value="Semanal">Semanal (recorrente)</option>
                <option value="Pontual">Pontual (uma vez)</option>
              </select>
              <input value={xpReward} onChange={(e) => setXpReward(e.target.value)} inputMode="numeric" placeholder="XP ao concluir (ex: 10)" className="rounded-xl border border-border bg-background px-4 py-3 text-sm" />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button onClick={createItem} disabled={busy} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? 'Criando...' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
