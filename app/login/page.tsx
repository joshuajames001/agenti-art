'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main style={{
      position: 'relative', zIndex: 1,
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 24
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        border: '1px solid var(--border-2)',
        borderRadius: 12, padding: 40,
        background: 'var(--bg-2)'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ display: 'block', margin: '0 auto 12px' }}>
              <circle cx="16" cy="16" r="14" stroke="#00e5c8" strokeWidth="1.5" strokeDasharray="4 2"/>
              <circle cx="16" cy="16" r="4" fill="#00e5c8"/>
              <circle cx="16" cy="4"  r="2" fill="#00e5c8" opacity="0.6"/>
              <circle cx="16" cy="28" r="2" fill="#00e5c8" opacity="0.6"/>
              <circle cx="4"  cy="16" r="2" fill="#00e5c8" opacity="0.6"/>
              <circle cx="28" cy="16" r="2" fill="#00e5c8" opacity="0.6"/>
            </svg>
          </Link>
          <div style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--cyan)', letterSpacing: '0.04em' }}>
            runagent.art
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            AGENTS RULE TOMORROW
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📬</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--cyan)', marginBottom: 8 }}>
              mission link sent
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Check your email at <strong style={{ color: 'var(--text)' }}>{email}</strong>.
              Click the link to enter.
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'var(--bg-3)', border: '1px solid var(--border-2)',
                  borderRadius: 6, color: 'var(--text)',
                  fontFamily: 'var(--mono)', fontSize: 13,
                  outline: 'none', transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
              />
            </div>

            {error && (
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                color: 'var(--red)', marginBottom: 12
              }}>
                ✗ {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'var(--border-2)' : 'var(--cyan)',
                border: 'none', borderRadius: 6,
                color: 'var(--bg)', fontFamily: 'var(--mono)',
                fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                letterSpacing: '0.06em', transition: 'all 0.2s',
                marginBottom: 16
              }}
            >
              {loading ? 'SENDING...' : 'SEND MAGIC LINK →'}
            </button>

            <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
              No password needed. Magic link to your inbox.
            </div>
          </>
        )}
      </div>
    </main>
  )
}
