export type AgentStatus = 'idle' | 'running' | 'done' | 'failed'

export type NodeType = 'input' | 'output' | 'agent' | 'script' | 'router' | 'department'

export type Agent = {
  id: string
  name: string
  model: string
  category: string
  description: string
}

export type NodeConfig = {
  model?: string
  instructions?: string
  inputType?: 'text' | 'url' | 'pdf' | 'image' | 'webhook'
  outputFormat?: 'text' | 'json' | 'markdown'
}

export type PipelineNode = {
  nodeType: NodeType
  id: string
  agent?: Agent
  label?: string
  config?: NodeConfig
  status: AgentStatus
  tokensUsed: number
  stepOrder: number
  inputFromStep: string | null
}

export type LogEntry = {
  id: string
  time: string
  type: 'info' | 'success' | 'error' | 'adr' | 'running'
  agent?: string
  message: string
  adrCode?: string
}

export type BuilderProps = {
  missionSlug?: string
  missionTitle?: string
  availableAgents: Agent[]
  initialNodes?: PipelineNode[]
}

export const STATUS_COLOR: Record<AgentStatus, string> = {
  idle:    '#55556a',
  running: '#00e5c8',
  done:    '#3B6D11',
  failed:  '#ff4d6d',
}

export const MODEL_COLOR: Record<string, string> = {
  fast:     '#7eb8f7',
  smart:    '#00e5c8',
  powerful: '#ffd166',
}

export const LOG_TYPE_STYLE: Record<LogEntry['type'], { icon: string; color: string }> = {
  info:    { icon: '·', color: '#55556a' },
  success: { icon: '✓', color: '#3B6D11' },
  error:   { icon: '✗', color: '#ff4d6d' },
  adr:     { icon: '⚠', color: '#ff4d6d' },
  running: { icon: '→', color: '#00e5c8' },
}
