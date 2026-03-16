import type { LogEntry } from '../types'
import { LOG_TYPE_STYLE } from '../types'

export function LogPanel({
  logs,
  logRef,
}: {
  logs: LogEntry[]
  logRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div style={{
      borderTop: '1px solid #ffffff12',
      background: '#0a0a0c', padding: '10px 16px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ fontSize: 9, color: '#55556a', letterSpacing: '0.12em', marginBottom: 8, flexShrink: 0 }}>
        LIVE LOG
      </div>
      <div ref={logRef} style={{ overflowY: 'auto', flex: 1 }}>
        {logs.map(log => {
          const style = LOG_TYPE_STYLE[log.type]
          return (
            <div key={log.id} style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 11, alignItems: 'flex-start' }}>
              <span style={{ color: style.color, width: 12, flexShrink: 0, textAlign: 'center' }}>{style.icon}</span>
              <span style={{ color: '#55556a', flexShrink: 0, fontSize: 10 }}>{log.time}</span>
              <span style={{ color: '#9090a8' }}>
                {log.agent && <span style={{ color: '#00e5c8' }}>{log.agent} </span>}
                {log.message}
                {log.adrCode && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: '#ff4d6d18', border: '1px solid #ff4d6d30',
                    borderRadius: 3, padding: '0 5px', fontSize: 9,
                    color: '#ff4d6d', marginLeft: 6
                  }}>{log.adrCode}</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
