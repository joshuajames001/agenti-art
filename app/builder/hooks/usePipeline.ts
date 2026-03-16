'use client'

import { useState, useRef, useCallback } from 'react'
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Agent, PipelineNode, LogEntry, BuilderProps } from '../types'
import { processSSEStream, type SSEEvent } from './useSSE'

function now() {
  const d = new Date()
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export function usePipeline({ missionSlug, missionTitle, availableAgents, initialNodes = [] }: BuilderProps) {
  const [nodes, setNodes] = useState<PipelineNode[]>(initialNodes)
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '0', time: '00:00', type: 'info', message: 'Builder ready. Drag agents to build your pipeline.' }
  ])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [totalTokens, setTotalTokens] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [finalOutput, setFinalOutput] = useState<string | null>(null)
  const [finalAgent, setFinalAgent] = useState<string | null>(null)
  const [finalTokens, setFinalTokens] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastOutputRef = useRef('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const usedAgentIds = new Set(nodes.map(n => n.agent?.id).filter((id): id is string => !!id))

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'time'>) => {
    const log: LogEntry = { ...entry, id: Math.random().toString(36), time: now() }
    setLogs(prev => [...prev, log])
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    }, 50)
  }, [])

  function addIONode(nodeType: 'input' | 'output', label: string) {
    const node: PipelineNode = {
      nodeType,
      id: Math.random().toString(36),
      label,
      status: 'idle',
      tokensUsed: 0,
      stepOrder: nodes.length + 1,
      inputFromStep: nodes.length > 0 ? nodes[nodes.length - 1].id : null,
    }
    setNodes(prev => [...prev, node])
    addLog({ type: 'info', message: `${label} node added to pipeline (step ${node.stepOrder})` })
  }

  function addAgent(agent: Agent) {
    if (usedAgentIds.has(agent.id)) return
    const node: PipelineNode = {
      nodeType: 'agent',
      id: Math.random().toString(36),
      agent,
      status: 'idle',
      tokensUsed: 0,
      stepOrder: nodes.length + 1,
      inputFromStep: nodes.length > 0 ? nodes[nodes.length - 1].id : null,
    }
    setNodes(prev => [...prev, node])
    addLog({ type: 'info', agent: agent.name, message: `${agent.name} added to pipeline (step ${node.stepOrder})` })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setNodes(prev => {
      const oldIndex = prev.findIndex(n => n.id === active.id)
      const newIndex = prev.findIndex(n => n.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      return reordered.map((n, i) => ({
        ...n,
        stepOrder: i + 1,
        inputFromStep: i > 0 ? reordered[i - 1].id : null,
      }))
    })
  }

  function removeNode(nodeId: string) {
    setNodes(prev => {
      const filtered = prev.filter(n => n.id !== nodeId)
      return filtered.map((n, i) => ({
        ...n,
        stepOrder: i + 1,
        inputFromStep: i > 0 ? filtered[i - 1]?.id || null : null
      }))
    })
  }

  function handleSSEEvent(event: SSEEvent) {
    switch (event.type) {
      case 'step_start':
        setNodes(prev => prev.map((n, i) =>
          i === event.step ? { ...n, status: 'running' } : n
        ))
        addLog({ type: 'running', agent: event.agent, message: `${event.agent} starting...` })
        break

      case 'token':
        // Future: could display streaming text in output panel
        break

      case 'step_done':
        setNodes(prev => prev.map((n, i) =>
          i === event.step ? { ...n, status: 'done', tokensUsed: event.tokens } : n
        ))
        setTotalTokens(prev => prev + event.tokens)
        setFinalOutput(event.output)
        setFinalAgent(event.agent)
        setFinalTokens(event.tokens)
        lastOutputRef.current = event.output
        addLog({
          type: 'success',
          agent: event.agent,
          message: `${event.agent} completed · ${event.tokens.toLocaleString()} tokens`,
        })
        if (event.agent === 'email-responder') {
          addLog({
            type: 'adr',
            agent: event.agent,
            message: 'ADR-004: email held in draft — awaiting approval',
            adrCode: 'ADR-004',
          })
        }
        break

      case 'step_error':
        setNodes(prev => prev.map((n, i) =>
          i === event.step ? { ...n, status: 'failed' } : n
        ))
        addLog({ type: 'error', agent: event.agent, message: `${event.agent} failed: ${event.error}` })
        setDone(true)
        setRunning(false)
        break

      case 'pipeline_done':
        setDone(true)
        setRunning(false)
        addLog({ type: 'success', message: `─── Pipeline complete · ${event.totalTokens.toLocaleString()} tokens ───` })
        addLog({ type: 'success', message: '🎯 Mission objective met! Save your pipeline to complete the mission.' })
        setNodes(prev => prev.map(n =>
          n.nodeType === 'output'
            ? { ...n, status: 'done', label: lastOutputRef.current }
            : n
        ))
        break

      case 'pipeline_error':
        setDone(true)
        setRunning(false)
        addLog({ type: 'error', message: `Pipeline error: ${event.error}` })
        break
    }
  }

  async function runPipeline() {
    if (nodes.length === 0) {
      addLog({ type: 'error', message: 'Add at least one agent to the pipeline before running.' })
      return
    }
    if (nodes.length > 8) {
      addLog({ type: 'adr', message: 'ADR-005 violation: max 8 agents per pipeline.', adrCode: 'ADR-005' })
      return
    }
    if (!userPrompt.trim()) {
      addLog({ type: 'error', message: 'Enter a prompt before running the pipeline.' })
      return
    }

    setRunning(true)
    setDone(false)
    setTotalTokens(0)
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle', tokensUsed: 0 })))

    addLog({ type: 'info', message: '─── Pipeline started ───' })
    addLog({ type: 'info', message: `ADR-INDEX loaded · ${nodes.length} steps · checking rules...` })

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: nodes.filter(n => n.agent).map(n => ({
            agentName: n.agent!.name,
            model: n.agent!.model,
            stepOrder: n.stepOrder,
          })),
          userPrompt: userPrompt.trim(),
          pipelineId: null,
        }),
        signal: abort.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      if (!res.body) throw new Error('No response stream')

      await processSSEStream(res.body, handleSSEEvent)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addLog({ type: 'error', message: `Pipeline error: ${(err as Error).message}` })
        setDone(true)
      }
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }

  function stopPipeline() {
    abortRef.current?.abort()
    addLog({ type: 'info', message: '─── Pipeline stopped by user ───' })
  }

  async function savePipeline() {
    setSaving(true)
    try {
      const res = await fetch('/api/pipelines/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: missionTitle || 'My Pipeline',
          missionSlug,
          steps: nodes.filter(n => n.agent).map(n => ({
            agentName: n.agent!.name,
            stepOrder: n.stepOrder,
            model: n.agent!.model,
            connectors: [],
          })),
        }),
      })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      addLog({ type: 'success', message: '✓ Pipeline saved!' })
      addLog({ type: 'info', message: '→ View your pipelines at /dashboard' })
    } catch (err) {
      addLog({ type: 'error', message: `Save failed: ${err instanceof Error ? err.message : 'unknown error'}` })
    } finally {
      setSaving(false)
    }
  }

  function resetPipeline() {
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle', tokensUsed: 0 })))
    setTotalTokens(0)
    setDone(false)
    setFinalOutput(null)
    setFinalAgent(null)
    setFinalTokens(0)
    addLog({ type: 'info', message: '─── Pipeline reset ───' })
  }

  return {
    nodes, setNodes,
    logs,
    running, done, saving,
    totalTokens,
    dragOver, setDragOver,
    userPrompt, setUserPrompt,
    finalOutput, finalAgent, finalTokens,
    logRef,
    sensors,
    usedAgentIds,
    addLog, addAgent, addIONode, handleDragEnd, removeNode,
    runPipeline, stopPipeline, savePipeline, resetPipeline,
  }
}
