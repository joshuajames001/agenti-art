import { createClient } from '@/lib/supabase/server'
import { ratelimit } from '@/lib/ratelimit'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const MODEL_MAP: Record<string, string> = {
  fast: 'claude-haiku-4-5-20251001',
  smart: 'claude-sonnet-4-6',
  powerful: 'claude-opus-4-6',
}

const SKILL_BASE = 'https://raw.githubusercontent.com/joshuajames001/agenti-art/main/agents'

interface RunStep {
  agentName: string
  model: string
  stepOrder: number
}

interface RunRequest {
  steps: RunStep[]
  userPrompt: string
  pipelineId: string | null
}

async function fetchSkillMd(agentName: string): Promise<string> {
  const res = await fetch(`${SKILL_BASE}/${agentName}/SKILL.md`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`SKILL.md not found for ${agentName}`)
  const raw = await res.text()
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '')
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(user.id)
  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        limit,
        remaining: 0,
        reset: new Date(reset).toISOString(),
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: RunRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { steps, userPrompt, pipelineId } = body

  if (!steps || steps.length === 0) {
    return NextResponse.json({ error: 'No steps provided' }, { status: 400 })
  }
  if (steps.length > 8) {
    return NextResponse.json({ error: 'ADR-005: max 8 agents per pipeline' }, { status: 400 })
  }
  if (!userPrompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const anthropic = new Anthropic()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      let totalTokens = 0
      let previousOutput = userPrompt.trim()
      let runId: string | null = null
      let pipelineStepMap: Map<number, string> | null = null
      let failed = false

      // Create run record if pipeline is saved
      if (pipelineId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: run } = await (supabase as any)
            .from('runs')
            .insert({
              pipeline_id: pipelineId,
              user_id: user.id,
              status: 'running',
              trigger: 'manual',
              started_at: new Date().toISOString(),
            })
            .select('id')
            .single()
          runId = run?.id ?? null

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: pipelineSteps } = await (supabase as any)
            .from('pipeline_steps')
            .select('id, step_order')
            .eq('pipeline_id', pipelineId)
            .order('step_order')
          if (pipelineSteps) {
            pipelineStepMap = new Map(
              pipelineSteps.map((s: { id: string; step_order: number }) => [s.step_order, s.id])
            )
          }
        } catch {
          // Non-critical — continue without DB tracking
        }
      }

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        send({ type: 'step_start', step: i, agent: step.agentName })

        const stepStartedAt = new Date().toISOString()

        try {
          const systemPrompt = await fetchSkillMd(step.agentName)

          const modelId = MODEL_MAP[step.model]
          if (!modelId) throw new Error(`Unknown model alias: ${step.model}`)

          let fullText = ''
          const anthropicStream = anthropic.messages.stream({
            model: modelId,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: previousOutput }],
          })

          anthropicStream.on('text', (text) => {
            fullText += text
            send({ type: 'token', step: i, agent: step.agentName, text })
          })

          const finalMessage = await anthropicStream.finalMessage()
          const stepTokens = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens
          totalTokens += stepTokens

          send({
            type: 'step_done',
            step: i,
            agent: step.agentName,
            tokens: stepTokens,
            output: fullText,
          })

          // Write run_step to DB
          if (runId && pipelineStepMap?.has(step.stepOrder)) {
            try {
              await (supabase as any).from('run_steps').insert({
                run_id: runId,
                step_id: pipelineStepMap.get(step.stepOrder),
                status: 'done',
                input: previousOutput,
                output: fullText,
                tokens_used: stepTokens,
                started_at: stepStartedAt,
                finished_at: new Date().toISOString(),
              })
            } catch {
              // Non-critical
            }
          }

          previousOutput = fullText
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          send({ type: 'step_error', step: i, agent: step.agentName, error: errorMsg })
          failed = true

          if (runId && pipelineStepMap?.has(step.stepOrder)) {
            try {
              await (supabase as any).from('run_steps').insert({
                run_id: runId,
                step_id: pipelineStepMap.get(step.stepOrder),
                status: 'failed',
                input: previousOutput,
                error: errorMsg,
                tokens_used: 0,
                started_at: stepStartedAt,
                finished_at: new Date().toISOString(),
              })
            } catch {
              // Non-critical
            }
          }

          break
        }
      }

      // Update run record
      if (runId) {
        try {
          await (supabase as any)
            .from('runs')
            .update({
              status: failed ? 'failed' : 'done',
              total_tokens: totalTokens,
              finished_at: new Date().toISOString(),
            })
            .eq('id', runId)
        } catch {
          // Non-critical
        }
      }

      if (!failed) {
        send({ type: 'pipeline_done', totalTokens })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
