import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

export default async function MissionDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('slug', slug)
    .single() as { data: { id: string; slug: string; title_en: string; description_en: string; difficulty: number; is_free: boolean; required_agents: string[]; order_index: number } | null }

  if (!mission) notFound()

  const difficultyLabel = ['', 'ROOKIE', 'JUNIOR', 'MID', 'SENIOR', 'EXPERT'][mission.difficulty]
  const difficultyColor = ['', '#00e5c8', '#7eb8f7', '#ffd166', '#ff9a3c', '#ff4d6d'][mission.difficulty]

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#00e5c8" strokeWidth="1.5" strokeDasharray="4 2"/>
              <circle cx="16" cy="16" r="4" fill="#00e5c8"/>
              <circle cx="16" cy="4" r="2" fill="#00e5c8" opacity="0.6"/>
              <circle cx="16" cy="28" r="2" fill="#00e5c8" opacity="0.6"/>
              <circle cx="4" cy="16" r="2" fill="#00e5c8" opacity="0.6"/>
              <circle cx="28" cy="16" r="2" fill="#00e5c8" opacity="0.6"/>
            </svg>
          </Link>
          <Link href="/missions" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}>
            ← missions
          </Link>
        </div>
        {user ? (
          <Link href="/dashboard" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-2)', textDecoration: 'none' }}>
            dashboard
          </Link>
        ) : (
          <Link href="/login" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--bg)',
            background: 'var(--cyan)', padding: '5px 14px', borderRadius: 4,
            textDecoration: 'none', fontWeight: 700
          }}>sign in</Link>
        )}
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 40px' }}>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            border: '1px solid var(--border)', borderRadius: 4,
            padding: '3px 10px', color: 'var(--text-3)'
          }}>MISSION {String(mission.order_index).padStart(2, '0')}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            border: `1px solid ${difficultyColor}40`,
            borderRadius: 4, padding: '3px 10px',
            color: difficultyColor
          }}>{difficultyLabel}</span>
          {mission.is_free && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10,
              background: 'var(--cyan)', color: 'var(--bg)',
              borderRadius: 4, padding: '3px 10px', fontWeight: 700
            }}>FREE</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--display)', fontSize: 'clamp(36px, 6vw, 64px)',
          color: 'var(--text)', letterSpacing: '0.03em', lineHeight: 1,
          marginBottom: 24
        }}>
          {mission.title_en.toUpperCase()}
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--sans)', fontSize: 16,
          color: 'var(--text-2)', lineHeight: 1.8,
          marginBottom: 40, maxWidth: 600
        }}>
          {mission.description_en}
        </p>

        {/* What you'll build */}
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 28, marginBottom: 32
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', marginBottom: 16, letterSpacing: '0.1em' }}>
            WHAT YOU WILL BUILD
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Configure a support bot with your product knowledge base',
              'Connect the file-ops skill to load context',
              'Add an auditor agent to validate responses',
              'Set ADR rules to prevent auto-sending',
              'Run the pipeline and watch it handle test queries',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agents used */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.1em' }}>
            AGENTS IN THIS MISSION
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mission.required_agents?.map((agent: string) => (
              <div key={agent} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '8px 14px'
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)' }}/>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{agent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {user ? (
          <Link href={`/builder?mission=${mission.slug}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
            color: 'var(--bg)', background: 'var(--cyan)',
            padding: '14px 32px', borderRadius: 6,
            textDecoration: 'none', letterSpacing: '0.06em'
          }}>
            OPEN BUILDER →
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
              color: 'var(--bg)', background: 'var(--cyan)',
              padding: '14px 32px', borderRadius: 6,
              textDecoration: 'none', letterSpacing: '0.06em'
            }}>
              SIGN IN TO START →
            </Link>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
              or try as guest (progress not saved)
            </span>
          </div>
        )}

      </div>
    </main>
  )
}
