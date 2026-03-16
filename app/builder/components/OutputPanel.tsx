'use client'

import { useState } from 'react'

export function OutputPanel({
  output,
  agentName,
  tokens,
  visible,
  onClose,
}: {
  output: string | null
  agentName: string | null
  tokens: number
  visible: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 49,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Slide-over panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0,
        height: '100vh', width: 480,
        background: '#0f0f12',
        borderLeft: '1px solid #ffffff20',
        zIndex: 50,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: '1px solid #ffffff12',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--display)', fontSize: 28,
                color: 'var(--cyan)', letterSpacing: '0.04em', lineHeight: 1,
              }}>
                MISSION RESULT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                {agentName && (
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    color: '#00e5c8', background: '#00e5c810',
                    border: '1px solid #00e5c830', borderRadius: 3,
                    padding: '2px 8px',
                  }}>
                    {agentName}
                  </span>
                )}
                {tokens > 0 && (
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    color: '#55556a',
                  }}>
                    {tokens.toLocaleString()} tokens
                  </span>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                fontFamily: "'Space Mono', monospace", fontSize: 16,
                color: '#55556a', background: 'transparent',
                border: 'none', cursor: 'pointer',
                padding: '4px 8px', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Output content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <pre style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            lineHeight: 1.8,
            color: '#e8e8f0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}>
            {output}
          </pre>
        </div>

        {/* Copy button */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #ffffff12',
          flexShrink: 0,
        }}>
          <button
            onClick={handleCopy}
            style={{
              width: '100%',
              fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
              color: copied ? '#e8e8f0' : 'var(--bg)',
              background: copied ? '#3B6D11' : 'var(--cyan)',
              border: 'none', borderRadius: 6,
              padding: '12px', cursor: 'pointer',
              letterSpacing: '0.06em',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ COPIED' : 'COPY OUTPUT'}
          </button>
        </div>
      </div>
    </>
  )
}
