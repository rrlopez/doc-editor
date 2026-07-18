import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FileText, Loader2, ShieldAlert } from 'lucide-react'
import { useEffect } from 'react'
import z from 'zod'
import { Form } from '@/components/custom/form'
import { TextInput } from '@/components/custom/form/text-input'
import { ThemeToggle } from '@/components/custom/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { useIsOnline } from '@/hooks/use-is-online'
import { AuthEngine } from '@/lib/better-auth/auth-engine'
import { APP_NAME } from '@/lib/constants'
import { clearModals } from '@/lib/overlay'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/(public)/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const isOnline = useIsOnline()
  const navigate = useNavigate()

  useEffect(() => {
    clearModals()
  }, [])

  const form = useForm({
    defaultValues: { email: '', password: '' } as LoginValues,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      if (isOnline) {
        await AuthEngine.loginOnline(value.email, value.password, () => navigate({ to: '/docs' }))
      } else {
        await AuthEngine.loginOffline(value.email, value.password, () => navigate({ to: '/docs' }))
      }
    },
  })

  return (
    <div className='flex flex-col min-h-screen bg-background font-sans selection:bg-primary/20 relative overflow-hidden antialiased'>
      {/* Background Tech Accent Pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(#3b82f603_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none' />

      {/* TOP HEADER SECTION: Tightened margins, perfectly leveled top bar */}
      <header className='w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-30 shrink-0 border-b border-border/10'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-primary shadow-[0_0_10px_color-mix(in_oklch,var(--primary)_30%,transparent)]'>
            <FileText className='h-4 w-4' />
          </div>
          <div>
            <div className='font-bold text-sm tracking-tight text-foreground leading-none'>{APP_NAME}</div>
            <span className='text-[9px] font-mono tracking-widest text-muted-foreground uppercase font-semibold block mt-0.5'>Portal</span>
          </div>
        </div>

        <div className='flex items-center gap-3 h-8'>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-tight border ${
              isOnline ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
            }`}
          >
            <span className={`h-1 w-1 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isOnline ? 'SYS_ONLINE' : 'OFFLINE_CACHE_ACTIVE'}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* MAIN FORM PANEL: Centered container layout */}
      <main className='flex-1 flex flex-col justify-center items-center px-6 py-8 z-20 w-full max-w-md mx-auto'>
        <div className='w-full p-8 md:p-10 rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-xl shadow-foreground/1 space-y-7 transition-all'>
          <div className='space-y-2 text-center'>
            <h1 className='text-2xl font-extrabold tracking-tight text-foreground'>Sign In</h1>
            <p className='text-xs text-muted-foreground leading-relaxed max-w-[320px] mx-auto'>
              {isOnline
                ? 'Sign in to access your documents.'
                : 'Local authentication active. Changes will sync when you reconnect.'}
            </p>
          </div>

          <Form onSubmit={form.handleSubmit} className='space-y-4.5'>
            <div className='space-y-3.5'>
              <form.Field
                name='email'
                children={field => (
                  <TextInput
                    field={field}
                    label='Email Address'
                    placeholder='name@doc-editor.com'
                    className='h-10.5 shadow-inner focus-visible:ring-primary/30 text-xs'
                  />
                )}
              />
              <form.Field
                name='password'
                children={field => (
                  <TextInput field={field} label='Password' type='password' className='h-10.5 shadow-inner focus-visible:ring-primary/30 text-xs' />
                )}
              />
            </div>

            {/* Warning block message when dropping connection links */}
            {!isOnline && (
              <div className='rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex items-start gap-2.5 text-[11px] text-amber-600 dark:text-amber-400 shadow-sm'>
                <ShieldAlert className='w-3.5 h-3.5 shrink-0 mt-0.5' />
                <span className='leading-normal font-medium'>Network disconnected. Session data caching enabled.</span>
              </div>
            )}

            <form.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type='submit'
                  className='w-full h-10.5 text-xs font-semibold tracking-wide transition-all shadow-md bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.985] cursor-pointer mt-1'
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className='flex items-center gap-2 justify-center'>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      <span>Signing in…</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              )}
            />
          </Form>
        </div>
      </main>

      {/* FOOTER SECTION: Perfectly centered at bottom */}
      <footer className='w-full py-4 text-center text-[10px] font-mono text-zinc-500 dark:text-zinc-600 tracking-wider z-30 shrink-0 border-t border-border/10'>
        FOLIO v0.1.0 • All Rights Reserved
      </footer>
    </div>
  )
}
