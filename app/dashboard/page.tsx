import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main style={{ position: 'relative', zIndex: 1, padding: 40 }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: 'var(--cyan)', letterSpacing: '0.04em' }}>
            DASHBOARD
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {profile?.email || user.email}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11,
          color: 'var(--cyan)', border: '1px solid var(--cyan-dim)',
          padding: '4px 12px', borderRadius: 4
        }}>
          {profile?.plan || 'free'}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'MISSIONS COMPLETED', value: profile?.missions_completed || 0, color: 'var(--cyan)' },
          { label: 'PIPELINES', value: 0, color: 'var(--text)' },
          { label: 'RUNS', value: 0, color: 'var(--text)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 24
          }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 48, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 8 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 32, textAlign: 'center'
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
          ready for your first mission?
        </div>
        <a href="/missions" style={{
          fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
          color: 'var(--bg)', background: 'var(--cyan)',
          padding: '12px 28px', borderRadius: 6,
          textDecoration: 'none', letterSpacing: '0.05em',
          display: 'inline-block'
        }}>
          VIEW MISSIONS →
        </a>
      </div>

    </main>
  )
}
