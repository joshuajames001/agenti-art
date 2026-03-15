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
  searchParams: Promise<{ mission?: string }>
}) {
  const { mission: missionSlug } = await searchParams
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
      .single()
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

  return (
    <Builder
      missionSlug={missionSlug}
      missionTitle={missionTitle}
      availableAgents={availableAgents}
    />
  )
}
