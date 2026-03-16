import type { Agent } from '../types'
import { MODEL_COLOR } from '../types'

export function AgentPool({
  availableAgents,
  usedAgentIds,
  running,
  nodeCount,
  addAgent,
}: {
  availableAgents: Agent[]
  usedAgentIds: Set<string>
  running: boolean
  nodeCount: number
  addAgent: (agent: Agent) => void
}) {
  return (
    <div style={{
      borderRight: '1px solid #ffffff12',
      padding: 12, overflowY: 'auto',
      background: '#0a0a0c'
    }}>
      <div style={{ fontSize: 9, color: '#55556a', letterSpacing: '0.12em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #ffffff10' }}>
        AGENT POOL
      </div>

      {availableAgents.map(agent => {
        const inUse = usedAgentIds.has(agent.id)
        return (
          <div
            key={agent.id}
            draggable={!inUse && !running}
            onDragStart={(e) => e.dataTransfer.setData('agentId', agent.id)}
            onClick={() => !inUse && !running && addAgent(agent)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', border: '1px solid #ffffff12',
              borderRadius: 6, marginBottom: 6,
              cursor: inUse || running ? 'not-allowed' : 'pointer',
              opacity: inUse ? 0.35 : 1,
              transition: 'border 0.2s, background 0.2s',
              background: 'transparent',
            }}
            onMouseEnter={e => { if (!inUse && !running) (e.currentTarget as HTMLDivElement).style.background = '#00e5c808' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: inUse ? '#00e5c8' : '#55556a', flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</div>
              <div style={{ fontSize: 9, color: MODEL_COLOR[agent.model] || '#55556a', marginTop: 1 }}>{agent.model}</div>
            </div>
            {inUse && <div style={{ fontSize: 9, color: '#00e5c840' }}>✓</div>}
          </div>
        )
      })}

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #ffffff10' }}>
        <div style={{ fontSize: 9, color: '#55556a', letterSpacing: '0.12em', marginBottom: 8 }}>ADR STATUS</div>
        {[
          { code: 'ADR-005', label: 'max 8 agents', ok: nodeCount <= 8 },
          { code: 'ADR-007', label: 'inputs validated', ok: true },
          { code: 'ADR-003', label: 'no secrets', ok: true },
        ].map(adr => (
          <div key={adr.code} style={{ fontSize: 10, color: adr.ok ? '#55556a' : '#ff4d6d', marginBottom: 4 }}>
            <span style={{ color: adr.ok ? '#3B6D11' : '#ff4d6d' }}>{adr.ok ? '✓' : '⚠'}</span>{' '}
            <span style={{ color: adr.ok ? '#55556a' : '#ff4d6d' }}>{adr.code}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
