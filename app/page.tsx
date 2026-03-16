import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#00e5c8" strokeWidth="1.5" strokeDasharray="4 2"/>
            <circle cx="16" cy="16" r="4" fill="#00e5c8"/>
            <circle cx="16" cy="4"  r="2" fill="#00e5c8" opacity="0.6"/>
            <circle cx="16" cy="28" r="2" fill="#00e5c8" opacity="0.6"/>
            <circle cx="4"  cy="16" r="2" fill="#00e5c8" opacity="0.6"/>
            <circle cx="28" cy="16" r="2" fill="#00e5c8" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--cyan)', fontWeight: 700 }}>
            runagent.art
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/missions" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>
            missions
          </Link>
          <Link href="/store" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>
            agent store
          </Link>
          <Link href="/login" style={{
            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--bg)',
            background: 'var(--cyan)', padding: '6px 16px', borderRadius: 4,
            textDecoration: 'none', fontWeight: 700
          }}>
            sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 40px', textAlign: 'center', gap: 32
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--cyan-dim)', borderRadius: 20,
          padding: '4px 16px', fontFamily: 'var(--mono)', fontSize: 11,
          color: 'var(--cyan)'
        }}>
          <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block' }}/>
          alpha · beta access open
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(56px, 10vw, 120px)',
          lineHeight: 0.9,
          letterSpacing: '0.02em',
          color: 'var(--text)',
        }}>
          <span style={{ display: 'block' }}>AGENTS</span>
          <span style={{ display: 'block', color: 'var(--cyan)' }} className="glow-cyan">RULE</span>
          <span style={{ display: 'block' }}>TOMORROW</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: 'var(--sans)', fontSize: 18, color: 'var(--text-2)',
          maxWidth: 480, lineHeight: 1.7
        }}>
          Build real AI agent pipelines by completing missions.
          No setup. No empty dashboards. Just play — and ship.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/missions" style={{
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
            color: 'var(--bg)', background: 'var(--cyan)',
            padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
            letterSpacing: '0.05em'
          }}>
            START FIRST MISSION →
          </Link>
          <Link href="/store" style={{
            fontFamily: 'var(--mono)', fontSize: 13,
            color: 'var(--text-2)', border: '1px solid var(--border-2)',
            padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
            letterSpacing: '0.05em'
          }}>
            BROWSE AGENTS
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 48, marginTop: 40,
          borderTop: '1px solid var(--border)', paddingTop: 40
        }}>
          {[
            { value: '11', label: 'base agents' },
            { value: '11', label: 'system ADRs' },
            { value: '∞', label: 'pipelines' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 40, color: 'var(--cyan)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer style={{
        padding: '20px 40px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
          GhostFactory · runagent.art
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
          v0.1.0-alpha
        </span>
      </footer>

    </main>
  )
}
