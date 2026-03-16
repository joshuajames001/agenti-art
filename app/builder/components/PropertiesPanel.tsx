'use client'

import { useState, useEffect } from 'react'
import type { PipelineNode, NodeConfig } from '../types'
import { MODEL_COLOR } from '../types'

const MONO = "'Space Mono', monospace"

const MODEL_TIERS = ['fast', 'smart', 'powerful'] as const
const INPUT_TYPES = ['text', 'url', 'pdf', 'image', 'webhook'] as const
const OUTPUT_FORMATS = ['text', 'json', 'markdown'] as const

function configsEqual(a: NodeConfig, b: NodeConfig): boolean {
  return a.model === b.model
    && a.instructions === b.instructions
    && a.inputType === b.inputType
    && a.outputFormat === b.outputFormat
}

export function PropertiesPanel({
  node,
  visible,
  onClose,
  onUpdate,
}: {
  node: PipelineNode | null
  visible: boolean
  onClose: () => void
  onUpdate: (nodeId: string, config: Partial<NodeConfig>) => void
}) {
  const saved = node?.config ?? {}
  const [draft, setDraft] = useState<NodeConfig>({})

  // Reset draft when node changes or panel opens
  useEffect(() => {
    setDraft(node?.config ?? {})
  }, [node?.id, visible])

  if (!node) return null

  const dirty = !configsEqual(draft, saved)

  function handleSave() {
    if (!node || !dirty) return
    onUpdate(node.id, draft)
  }

  function updateDraft(partial: Partial<NodeConfig>) {
    setDraft(prev => ({ ...prev, ...partial }))
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

      {/* Panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0,
        height: '100vh', width: 360,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  fontFamily: 'var(--display)', fontSize: 22,
                  color: 'var(--cyan)', letterSpacing: '0.04em', lineHeight: 1,
                }}>
                  PROPERTIES
                </div>
                {dirty && (
                  <span style={{
                    fontFamily: MONO, fontSize: 9,
                    color: '#ffd166', letterSpacing: '0.06em',
                  }}>
                    UNSAVED
                  </span>
                )}
              </div>
              <div style={{
                fontFamily: MONO, fontSize: 10,
                color: '#55556a', marginTop: 8, letterSpacing: '0.08em',
              }}>
                STEP {String(node.stepOrder).padStart(2, '0')} · {node.nodeType.toUpperCase()}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                fontFamily: MONO, fontSize: 16,
                color: '#55556a', background: 'transparent',
                border: 'none', cursor: 'pointer',
                padding: '4px 8px', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {node.nodeType === 'agent' && node.agent && (
            <AgentProperties
              node={node}
              config={draft}
              onUpdate={updateDraft}
            />
          )}
          {node.nodeType === 'input' && (
            <InputProperties
              config={draft}
              onUpdate={updateDraft}
            />
          )}
          {node.nodeType === 'output' && (
            <OutputProperties
              config={draft}
              onUpdate={updateDraft}
            />
          )}
        </div>

        {/* Save button */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #ffffff12',
          flexShrink: 0,
        }}>
          <button
            onClick={handleSave}
            disabled={!dirty}
            style={{
              width: '100%',
              fontFamily: MONO, fontSize: 11, fontWeight: 700,
              color: dirty ? '#0a0a0c' : '#55556a',
              background: dirty ? '#00e5c8' : 'transparent',
              border: dirty ? 'none' : '1px solid #ffffff20',
              borderRadius: 6, padding: '10px',
              cursor: dirty ? 'pointer' : 'default',
              letterSpacing: '0.06em',
              transition: 'all 0.2s',
            }}
          >
            {dirty ? 'SAVE CHANGES' : 'NO CHANGES'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Agent properties ──
function AgentProperties({
  node,
  config,
  onUpdate,
}: {
  node: PipelineNode
  config: NodeConfig
  onUpdate: (config: Partial<NodeConfig>) => void
}) {
  const currentModel = config.model ?? node.agent?.model ?? 'smart'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Agent name */}
      <div>
        <Label>AGENT</Label>
        <div style={{
          fontFamily: MONO, fontSize: 13, fontWeight: 700,
          color: '#e8e8f0', marginTop: 4,
        }}>
          {node.agent?.name}
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 10,
          color: '#55556a', marginTop: 2,
        }}>
          {node.agent?.category} · {node.agent?.description}
        </div>
      </div>

      {/* Model tier */}
      <div>
        <Label>MODEL TIER</Label>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {MODEL_TIERS.map(tier => (
            <button
              key={tier}
              onClick={() => onUpdate({ model: tier })}
              style={{
                flex: 1,
                fontFamily: MONO, fontSize: 10, fontWeight: 700,
                color: currentModel === tier ? '#0a0a0c' : MODEL_COLOR[tier],
                background: currentModel === tier ? MODEL_COLOR[tier] : 'transparent',
                border: `1px solid ${MODEL_COLOR[tier]}40`,
                borderRadius: 4, padding: '6px 0',
                cursor: 'pointer', letterSpacing: '0.06em',
                transition: 'all 0.15s',
              }}
            >
              {tier.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom instructions */}
      <div>
        <Label>CUSTOM INSTRUCTIONS</Label>
        <textarea
          value={config.instructions ?? ''}
          onChange={e => onUpdate({ instructions: e.target.value })}
          placeholder="Additional context or constraints for this agent..."
          style={{
            width: '100%', marginTop: 6,
            fontFamily: MONO, fontSize: 11,
            color: '#e8e8f0', background: '#0a0a0c',
            border: '1px solid #ffffff15', borderRadius: 6,
            padding: '10px 12px', minHeight: 100,
            resize: 'vertical', outline: 'none',
            lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  )
}

// ── Input properties ──
function InputProperties({
  config,
  onUpdate,
}: {
  config: NodeConfig
  onUpdate: (config: Partial<NodeConfig>) => void
}) {
  const current = config.inputType ?? 'text'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Label>INPUT TYPE</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
          {INPUT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onUpdate({ inputType: type })}
              style={{
                fontFamily: MONO, fontSize: 11,
                color: current === type ? '#0a0a0c' : '#9090a8',
                background: current === type ? '#00e5c8' : 'transparent',
                border: `1px solid ${current === type ? '#00e5c8' : '#ffffff15'}`,
                borderRadius: 4, padding: '8px 12px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Output properties ──
function OutputProperties({
  config,
  onUpdate,
}: {
  config: NodeConfig
  onUpdate: (config: Partial<NodeConfig>) => void
}) {
  const current = config.outputFormat ?? 'text'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Label>OUTPUT FORMAT</Label>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {OUTPUT_FORMATS.map(fmt => (
            <button
              key={fmt}
              onClick={() => onUpdate({ outputFormat: fmt })}
              style={{
                flex: 1,
                fontFamily: MONO, fontSize: 10, fontWeight: 700,
                color: current === fmt ? '#0a0a0c' : '#9090a8',
                background: current === fmt ? '#ffd166' : 'transparent',
                border: `1px solid ${current === fmt ? '#ffd166' : '#ffffff15'}`,
                borderRadius: 4, padding: '6px 0',
                cursor: 'pointer', letterSpacing: '0.06em',
                transition: 'all 0.15s',
              }}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shared label ──
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: MONO, fontSize: 9,
      color: '#55556a', letterSpacing: '0.12em',
    }}>
      {children}
    </div>
  )
}
