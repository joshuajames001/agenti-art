export type SSEEvent =
  | { type: 'step_start'; step: number; agent: string; nodeId?: string }
  | { type: 'token'; step: number; agent: string; text: string }
  | { type: 'step_done'; step: number; agent: string; tokens: number; output: string; nodeId?: string }
  | { type: 'step_error'; step: number; agent: string; error: string; nodeId?: string }
  | { type: 'pipeline_done'; totalTokens: number }
  | { type: 'pipeline_error'; error: string }

export async function processSSEStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: SSEEvent) => void
) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const event = JSON.parse(line.slice(6)) as SSEEvent
        onEvent(event)
      } catch {
        // skip malformed lines
      }
    }
  }

  // Flush remaining buffer after stream ends
  if (buffer.trim()) {
    for (const line of buffer.split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const event = JSON.parse(line.slice(6)) as SSEEvent
        onEvent(event)
      } catch {
        // skip malformed
      }
    }
  }
}
