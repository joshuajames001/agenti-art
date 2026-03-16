// app/api/pipelines/save/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { name?: string; missionSlug?: string; steps?: any[] }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { name, missionSlug, steps } = body

    if (!name || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get mission id if slug provided
    let missionId: string | null = null
    if (missionSlug) {
      const { data: mission } = await supabase
        .from('missions')
        .select('id')
        .eq('slug', missionSlug)
        .single() as { data: { id: string } | null }
      missionId = mission?.id || null
    }

    // Create pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert({
        user_id: user.id,
        mission_id: missionId,
        name,
        status: 'active',
        config: {},
      } as any)
      .select()
      .single() as { data: { id: string } | null; error: any }

    if (pipelineError || !pipeline) {
      return NextResponse.json({ error: pipelineError?.message || 'Failed to create pipeline' }, { status: 500 })
    }

    // Create pipeline steps
    const stepsToInsert = steps.map((step: {
      agentName: string
      stepOrder: number
      model: string
      connectors: string[]
      inputFromStepOrder: number | null
    }) => ({
      pipeline_id: pipeline.id,
      agent_name: step.agentName,
      step_order: step.stepOrder,
      model_override: null,
      connectors: step.connectors || [],
      input_from_step: null,
      config: { model: step.model },
    }))

    const { error: stepsError } = await supabase
      .from('pipeline_steps')
      .insert(stepsToInsert as any)

    if (stepsError) {
      // Rollback pipeline
      await supabase.from('pipelines').delete().eq('id', pipeline.id)
      return NextResponse.json({ error: stepsError.message }, { status: 500 })
    }

    // If mission completed — increment missions_completed on profile
    if (missionId) {
      try {
        await supabase.rpc('increment_missions_completed' as any, { user_id: user.id } as any)
      } catch {
        /* non-critical */
      }
    }

    return NextResponse.json({ pipeline_id: pipeline.id, success: true })
  } catch (err) {
    console.error('[pipelines/save]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
