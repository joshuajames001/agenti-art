import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Builder from './Builder'

type Agent = {
  id: string
  name: string
  model: string
  category: string
  description: string
}

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ mission?: string; pipeline?: string; agent?: string }>
}) {
  const { mission: missionSlug, pipeline: pipelineId, agent: agentParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/builder')

  // Load mission if slug provided
  let missionTitle: string | undefined
  if (missionSlug) {
    const { data: mission } = await supabase
      .from('missions')
      .select('title_en, required_agents')
      .eq('slug', missionSlug)
      .single() as { data: { title_en: string; required_agents: string[] } | null }
    missionTitle = mission?.title_en
  }

  // Static agent list from registry (will load from registry.json later)
  const availableAgents: Agent[] = [
    { id: 'support-bot',     name: 'support-bot',     model: 'fast',     category: 'communication', description: 'Customer support conversations' },
    { id: 'auditor',         name: 'auditor',         model: 'powerful', category: 'qa',            description: 'QA, fact-checking, review' },
    { id: 'analytik',        name: 'analytik',        model: 'smart',    category: 'data',          description: 'Data analysis and reporting' },
    { id: 'researcher',      name: 'researcher',      model: 'smart',    category: 'data',          description: 'Multi-source research' },
    { id: 'creator',         name: 'creator',         model: 'smart',    category: 'content',       description: 'Copywriting and content' },
    { id: 'strategist',      name: 'strategist',      model: 'powerful', category: 'strategy',      description: 'Business strategy and GTM' },
    { id: 'orchestrator',    name: 'orchestrator',    model: 'powerful', category: 'automation',    description: 'Multi-agent coordination' },
    { id: 'adr-creator',     name: 'adr-creator',     model: 'powerful', category: 'qa',            description: 'Failure analysis, rule extraction' },
    { id: 'email-responder', name: 'email-responder', model: 'smart',    category: 'communication', description: 'Email triage and drafting' },
    { id: 'data-extractor',  name: 'data-extractor',  model: 'smart',    category: 'data',          description: 'Parsing, scraping, ETL' },
    { id: 'browser-agent',   name: 'browser-agent',   model: 'fast',     category: 'browser',       description: 'Web scraping and automation' },
  ]

  // Load existing pipeline if ID provided
  let initialNodes: {
    nodeType: 'agent'
    id: string
    agent: Agent
    status: 'idle'
    tokensUsed: 0
    stepOrder: number
    inputFromStep: string | null
  }[] | undefined

  if (pipelineId) {
    const { data: pipeline } = await supabase
      .from('pipelines')
      .select('*, pipeline_steps(*)')
      .eq('id', pipelineId)
      .single() as { data: { name: string; pipeline_steps: { agent_name: string; step_order: number }[] } | null }

    if (pipeline) {
      if (!missionTitle && pipeline.name) {
        missionTitle = pipeline.name
      }

      const steps = (pipeline.pipeline_steps || []).sort(
        (a: { step_order: number }, b: { step_order: number }) => a.step_order - b.step_order
      )

      initialNodes = steps
        .map((step: { agent_name: string; step_order: number }, i: number) => {
          const agent = availableAgents.find(a => a.name === step.agent_name)
          if (!agent) return null
          return {
            nodeType: 'agent' as const,
            id: Math.random().toString(36),
            agent,
            status: 'idle' as const,
            tokensUsed: 0 as const,
            stepOrder: step.step_order,
            inputFromStep: i > 0 ? 'prev' : null,
          }
        })
        .filter(Boolean) as typeof initialNodes
    }
  }

  // Pre-add agent from ?agent= query param
  if (agentParam && !initialNodes) {
    const agent = availableAgents.find(a => a.name === agentParam)
    if (agent) {
      initialNodes = [{
        nodeType: 'agent' as const,
        id: Math.random().toString(36),
        agent,
        status: 'idle' as const,
        tokensUsed: 0 as const,
        stepOrder: 1,
        inputFromStep: null,
      }]
    }
  }

  return (
    <Builder
      missionSlug={missionSlug}
      missionTitle={missionTitle}
      availableAgents={availableAgents}
      initialNodes={initialNodes}
    />
  )
}
