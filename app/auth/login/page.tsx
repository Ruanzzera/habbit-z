'use client'

import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

function messageFor(error: unknown) {
  const value = error as { code?: string; status?: number }
  if (value?.code === 'email_not_confirmed') return 'Confirme seu email antes de entrar.'
  if (value?.code === 'over_request_rate_limit' || value?.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  if (value?.code === 'invalid_credentials') return 'Email ou senha inválidos.'
  return 'Não foi possível entrar agora. Tente novamente.'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } })
    setLoading(false)
    if (result.error) { setError(messageFor(result.error)); return }
    if (mode === 'signup' && !result.data.session) { setError('Conta criada. Confira seu email para confirmar o acesso.'); return }
    router.replace('/')
    router.refresh()
  }

  return <main className="min-h-svh bg-background text-foreground"><div className="mx-auto flex min-h-svh max-w-6xl items-center justify-center p-5 sm:p-8"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:grid-cols-[1.05fr_0.95fr]"><section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15"><Sparkles className="size-5" /></div><span className="text-xl font-bold">LifeQuest</span></div><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] opacity-70">Seu progresso, com propósito</p><h1 className="max-w-md text-5xl font-bold leading-tight">Volte a construir a vida que você quer.</h1><p className="mt-5 max-w-md leading-relaxed opacity-80">Organize hábitos, projetos e objetivos em um só lugar.</p></div><p className="text-sm opacity-60">Um espaço privado para o seu próximo nível.</p></section><section className="p-6 sm:p-10"><div className="mb-8 flex items-center gap-3 lg:hidden"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></div><span className="text-lg font-bold">LifeQuest</span></div><div className="mb-8"><p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"><LockKeyhole className="size-4" />Área protegida</p><h2 className="text-3xl font-bold tracking-tight">{mode === 'login' ? 'Bem-vindo de volta.' : 'Crie seu acesso.'}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode === 'login' ? 'Entre para continuar sua jornada.' : 'Comece a acompanhar seu progresso hoje.'}</p></div><form onSubmit={submit} className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><label className="flex flex-col gap-2 text-sm font-medium">Senha<div className="relative"><input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>{error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}<button disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar no LifeQuest' : 'Criar minha conta'}{!loading && <ArrowRight className="size-4" />}</button></form><p className="mt-6 text-center text-sm text-muted-foreground">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} className="font-semibold text-primary hover:underline">{mode === 'login' ? 'Criar acesso' : 'Entrar'}</button></p></section></div></div></main>
}
