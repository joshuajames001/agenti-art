// Builder v3 - feature-slice architecture
'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { BuilderProps, PipelineNode } from './types'
import { STATUS_COLOR, MODEL_COLOR } from './types'
import { usePipeline } from './hooks/usePipeline'
import { AgentPool } from './components/AgentPool'
import { LogPanel } from './components/LogPanel'
import { OutputPanel } from './components/OutputPanel'
import { PromptInput } from './components/PromptInput'

// ── Sortable node wrapper ──
function SortableNode({
  node,
  index,
  totalNodes,
  running,
  onRemove,
}: {
  node: PipelineNode
  index: number
  totalNodes: number
  running: boolean
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, disabled: running })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    display: 'flex' as const,
    alignItems: 'center' as const,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          background: '#141418',
          border: `1px solid ${STATUS_COLOR[node.status]}`,
          borderRadius: 8, padding: '12px 16px',
          minWidth: 120, position: 'relative',
          transition: 'border 0.3s',
          boxShadow: node.status === 'running' ? `0 0 12px ${STATUS_COLOR.running}20` : 'none',
          cursor: running ? 'default' : 'grab',
          touchAction: 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 10, height: 10, borderRadius: '50%',
          background: STATUS_COLOR[node.status],
          border: '2px solid #0a0a0c',
          animation: node.status === 'running' ? 'pulse-dot 0.8s ease-in-out infinite' : 'none'
        }}/>

        {!running && (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onRemove(node.id)}
            style={{
              position: 'absolute', top: -4, left: -4,
              width: 16, height: 16, borderRadius: '50%',
              background: '#ff4d6d', border: '2px solid #0a0a0c',
              color: '#fff', fontSize: 9, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, padding: 0
            }}
          >×</button>
        )}

        <div style={{ fontSize: 9, color: '#55556a', marginBottom: 4 }}>
          STEP {String(node.stepOrder).padStart(2, '0')}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#e8e8f0' }}>
          {node.agent?.name ?? node.label ?? node.nodeType}
        </div>
        {node.agent && (
          <div style={{ fontSize: 9, color: MODEL_COLOR[node.agent.model] || '#55556a', marginTop: 2 }}>
            {node.agent.model}
          </div>
        )}
        {node.tokensUsed > 0 && (
          <div style={{ fontSize: 9, color: '#00e5c8', marginTop: 2 }}>
            {node.tokensUsed.toLocaleString()} tokens
          </div>
        )}
      </div>

      {index < totalNodes - 1 && (
        <div style={{ position: 'relative', width: 40, height: 2 }}>
          <div style={{
            width: '100%', height: '100%',
            background: node.status === 'done' ? '#3B6D1180' :
                        node.status === 'running' ? '#00e5c8' : '#ffffff15',
            transition: 'background 0.3s'
          }}/>
          <div style={{
            position: 'absolute', right: -1, top: -3,
            borderLeft: `7px solid ${node.status === 'done' ? '#3B6D1180' : node.status === 'running' ? '#00e5c8' : '#ffffff15'}`,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            transition: 'border-left-color 0.3s'
          }}/>
          {node.status === 'running' && (
            <div style={{
              position: 'absolute', top: -3,
              width: 6, height: 6, borderRadius: '50%',
              background: '#00e5c8',
              animation: 'flow-dot 1.2s linear infinite'
            }}/>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Builder ──
export default function Builder(props: BuilderProps) {
  const {
    nodes, logs, running, done, saving, totalTokens,
    dragOver, setDragOver, userPrompt, setUserPrompt,
    finalOutput, finalAgent, finalTokens,
    logRef, sensors, usedAgentIds,
    addAgent, handleDragEnd, removeNode,
    runPipeline, stopPipeline, savePipeline, resetPipeline,
  } = usePipeline(props)

  const { missionSlug, missionTitle, availableAgents } = props

  const [showOutput, setShowOutput] = useState(false)

  useEffect(() => {
    if (done && finalOutput) setShowOutput(true)
  }, [done, finalOutput])

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      height: '100vh',
      background: '#0a0a0c',
      color: '#e8e8f0',
      fontFamily: "'Space Mono', monospace",
      overflow: 'hidden',
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', background: '#0f0f12',
        borderBottom: '1px solid #ffffff12', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/missions" style={{ color: '#55556a', fontSize: 11, textDecoration: 'none' }}>← missions</a>
          <div style={{ width: 1, height: 16, background: '#ffffff12' }}/>
          <div>
            <div style={{ fontSize: 11, color: '#9090a8' }}>
              {missionSlug ? `MISSION · ` : 'BUILDER · '}
              <span style={{ color: '#00e5c8' }}>{missionTitle || 'CUSTOM PIPELINE'}</span>
            </div>
            <div style={{ fontSize: 9, color: '#55556a', marginTop: 2 }}>
              {nodes.length} steps · {totalTokens.toLocaleString()} tokens
            </div>
          </div>
        </div>

        <PromptInput value={userPrompt} onChange={setUserPrompt} disabled={running} />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {done && nodes.every(n => n.status === 'done') && (
            <button
              onClick={savePipeline}
              disabled={saving}
              style={{
                background: saving ? '#ffffff10' : '#3B6D11',
                border: 'none', color: '#e8e8f0',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, fontWeight: 700, padding: '7px 20px',
                borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer',
                letterSpacing: '0.08em', transition: 'background 0.2s',
              }}
            >
              {saving ? 'SAVING...' : '💾 SAVE PIPELINE'}
            </button>
          )}
          {done && (
            <button onClick={resetPipeline} style={{
              background: 'transparent', border: '1px solid #ffffff20',
              color: '#9090a8', fontFamily: "'Space Mono', monospace",
              fontSize: 11, padding: '6px 14px', borderRadius: 4, cursor: 'pointer'
            }}>
              RESET
            </button>
          )}
          <button
            onClick={running ? stopPipeline : runPipeline}
            disabled={!running && nodes.length === 0}
            style={{
              background: running ? '#ff4d6d' : nodes.length === 0 ? '#ffffff10' : '#00e5c8',
              border: 'none', color: running ? '#fff' : '#0a0a0c',
              fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
              padding: '7px 20px', borderRadius: 4,
              cursor: !running && nodes.length === 0 ? 'not-allowed' : 'pointer',
              letterSpacing: '0.08em', transition: 'background 0.2s',
              animation: running ? 'pulse-btn 1s ease-in-out infinite' : 'none',
            }}
          >
            {running ? '■ STOP' : done ? '▶ RUN AGAIN' : '▶ RUN PIPELINE'}
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>

        <AgentPool
          availableAgents={availableAgents}
          usedAgentIds={usedAgentIds}
          running={running}
          nodeCount={nodes.length}
          addAgent={addAgent}
        />

        {/* ── CANVAS ── */}
        <div style={{
          display: 'grid', gridTemplateRows: '1fr 160px',
          overflow: 'hidden'
        }}>

          {/* Canvas area */}
          <div
            style={{
              position: 'relative', overflow: 'hidden',
              background: dragOver ? '#00e5c805' : '#0a0a0c',
              transition: 'background 0.2s',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              const agentId = e.dataTransfer.getData('agentId')
              const agent = availableAgents.find(a => a.id === agentId)
              if (agent) addAgent(agent)
            }}
          >
            {/* Grid */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)',
              backgroundSize: '32px 32px', pointerEvents: 'none'
            }}/>

            {nodes.length === 0 ? (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8
              }}>
                <div style={{ fontSize: 28, opacity: 0.15 }}>+</div>
                <div style={{ fontSize: 11, color: '#ffffff20' }}>click agents to add them to the pipeline</div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={nodes.map(n => n.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px 32px', gap: 0, overflowX: 'auto'
                  }}>
                    {nodes.map((node, i) => (
                      <SortableNode
                        key={node.id}
                        node={node}
                        index={i}
                        totalNodes={nodes.length}
                        running={running}
                        onRemove={removeNode}
                      />
                    ))}

                    {/* Output node */}
                    {nodes.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: 40, height: 2 }}>
                          <div style={{
                            width: '100%', height: '100%',
                            background: done && nodes.every(n => n.status === 'done') ? '#3B6D1180' : '#ffffff15'
                          }}/>
                          <div style={{
                            position: 'absolute', right: -1, top: -3,
                            borderLeft: `7px solid ${done && nodes.every(n => n.status === 'done') ? '#3B6D1180' : '#ffffff15'}`,
                            borderTop: '4px solid transparent', borderBottom: '4px solid transparent'
                          }}/>
                        </div>
                        <div style={{
                          background: '#141418',
                          border: `1px solid ${done && nodes.every(n => n.status === 'done') ? '#3B6D1140' : '#ffffff12'}`,
                          borderRadius: 8, padding: '12px 16px', minWidth: 100,
                        }}>
                          <div style={{ fontSize: 9, color: '#55556a', marginBottom: 4 }}>OUTPUT</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: done && nodes.every(n => n.status === 'done') ? '#3B6D11' : '#55556a' }}>
                            {done && nodes.every(n => n.status === 'done') ? 'ready ✓' : 'waiting...'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <LogPanel logs={logs} logRef={logRef} />
        </div>
      </div>

      {/* ── BOTTOM STATUS ── */}
      <div style={{
        display: 'flex', gap: 20, padding: '6px 20px',
        background: '#0f0f12', borderTop: '1px solid #ffffff10',
        fontSize: 10, color: '#55556a'
      }}>
        <span>status: <span style={{ color: running ? '#00e5c8' : done ? '#3B6D11' : '#55556a' }}>
          {running ? 'RUNNING' : done ? 'DONE' : 'READY'}
        </span></span>
        <span>steps: <span style={{ color: '#00e5c8' }}>{nodes.length}</span></span>
        <span>tokens: <span style={{ color: '#00e5c8' }}>{totalTokens.toLocaleString()}</span></span>
        <span>adrs: <span style={{ color: '#00e5c8' }}>3 active</span></span>
        <span style={{ marginLeft: 'auto' }}>runagent.art · v0.1.0-alpha</span>
      </div>

      <OutputPanel
        output={finalOutput}
        agentName={finalAgent}
        tokens={finalTokens}
        visible={showOutput}
        onClose={() => setShowOutput(false)}
      />

      <style>{`
        @keyframes pulse-btn { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes flow-dot { from{left:0;opacity:1} to{left:calc(100% - 6px);opacity:0} }
      `}</style>
    </div>
  )
}
