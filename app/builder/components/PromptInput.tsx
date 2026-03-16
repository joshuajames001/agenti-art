export function PromptInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Enter prompt for pipeline..."
      disabled={disabled}
      style={{
        flex: 1,
        maxWidth: 400,
        background: '#141418',
        border: '1px solid #ffffff20',
        borderRadius: 4,
        color: '#e8e8f0',
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        padding: '7px 12px',
        outline: 'none',
      }}
    />
  )
}
