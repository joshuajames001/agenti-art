import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface RegistryAgent {
    name: string
    version: string
    category: string
    description: string
    tags: string
    author: string
    path: string
}

const MODEL_MAP: Record<string, string> = {
    'support-bot': 'fast',
    'auditor': 'powerful',
    'analytik': 'smart',
    'researcher': 'smart',
    'creator': 'smart',
    'strategist': 'powerful',
    'orchestrator': 'powerful',
    'adr-creator': 'powerful',
    'email-responder': 'smart',
    'data-extractor': 'smart',
    'browser-agent': 'fast',
}

const MODEL_COLOR: Record<string, string> = {
    fast: '#7eb8f7',
    smart: 'var(--cyan)',
    powerful: '#ffd166',
}

const CATEGORIES = ['all', 'data', 'content', 'qa', 'strategy', 'automation', 'browser', 'communication'] as const

function parseTags(raw: string): string[] {
    return raw.replace(/^\[|\]$/g, '').split(',').map(t => t.trim()).filter(Boolean)
}

export default async function StorePage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
}) {
    const { category: filterCategory } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let agents: RegistryAgent[] = []
    try {
        const res = await fetch(
            process.env.GITHUB_REGISTRY_URL ?? 'https://raw.githubusercontent.com/joshuajames001/agenti-art/main/registry.json',
            { next: { revalidate: 300 } }
        )
        if (res.ok) {
            const data = await res.json()
            agents = data.agents || []
        }
    } catch {
        // Fallback: empty
    }

    const activeFilter = filterCategory && filterCategory !== 'all' ? filterCategory : null
    const filtered = activeFilter
        ? agents.filter(a => a.category === activeFilter)
        : agents

    return (
        <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>

            {/* Nav */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 40px', borderBottom: '1px solid var(--border)'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" stroke="#00e5c8" strokeWidth="1.5" strokeDasharray="4 2" />
                        <circle cx="16" cy="16" r="4" fill="#00e5c8" />
                        <circle cx="16" cy="4" r="2" fill="#00e5c8" opacity="0.6" />
                        <circle cx="16" cy="28" r="2" fill="#00e5c8" opacity="0.6" />
                        <circle cx="4" cy="16" r="2" fill="#00e5c8" opacity="0.6" />
                        <circle cx="28" cy="16" r="2" fill="#00e5c8" opacity="0.6" />
                    </svg>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--cyan)', fontWeight: 700 }}>
                        runagent.art
                    </span>
                </Link>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Link href="/missions" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>
                        missions
                    </Link>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', borderBottom: '1px solid var(--cyan)' }}>
                        agent store
                    </span>
                    {user ? (
                        <Link href="/dashboard" style={{
                            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--bg)',
                            background: 'var(--cyan)', padding: '6px 16px', borderRadius: 4,
                            textDecoration: 'none', fontWeight: 700
                        }}>
                            dashboard
                        </Link>
                    ) : (
                        <Link href="/login" style={{
                            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--bg)',
                            background: 'var(--cyan)', padding: '6px 16px', borderRadius: 4,
                            textDecoration: 'none', fontWeight: 700
                        }}>
                            sign in
                        </Link>
                    )}
                </div>
            </nav>

            <div style={{ padding: '48px 40px', maxWidth: 1100, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 48, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                        AGENT STORE
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                        Browse and install agents into your pipeline · {agents.length} agents
                    </div>
                </div>

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                    {CATEGORIES.map(cat => {
                        const isActive = cat === 'all' ? !activeFilter : activeFilter === cat
                        return (
                            <Link
                                key={cat}
                                href={cat === 'all' ? '/store' : `/store?category=${cat}`}
                                style={{
                                    fontFamily: 'var(--mono)', fontSize: 11,
                                    color: isActive ? 'var(--bg)' : 'var(--text-3)',
                                    background: isActive ? 'var(--cyan)' : 'transparent',
                                    border: `1px solid ${isActive ? 'var(--cyan)' : 'var(--border-2)'}`,
                                    borderRadius: 4, padding: '5px 14px',
                                    textDecoration: 'none', textTransform: 'uppercase',
                                    letterSpacing: '0.06em', fontWeight: isActive ? 700 : 400,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {cat}
                            </Link>
                        )
                    })}
                </div>

                {/* Agent grid */}
                {filtered.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {filtered.map((agent, i) => {
                            const model = MODEL_MAP[agent.name] || 'smart'
                            const tags = parseTags(agent.tags)
                            const desc = agent.description.length > 120
                                ? agent.description.slice(0, 120) + '...'
                                : agent.description

                            return (
                                <div
                                    key={agent.name}
                                    className="fade-up"
                                    style={{
                                        animationDelay: `${i * 0.06}s`,
                                        background: 'var(--bg-2)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 10,
                                        padding: 24,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'border 0.2s',
                                    }}
                                >
                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{
                                            fontFamily: 'var(--display)', fontSize: 22,
                                            color: 'var(--text)', letterSpacing: '0.03em', lineHeight: 1.1,
                                        }}>
                                            {agent.name.toUpperCase()}
                                        </div>
                                        <div style={{
                                            fontFamily: 'var(--mono)', fontSize: 9,
                                            color: MODEL_COLOR[model],
                                            border: `1px solid ${MODEL_COLOR[model]}40`,
                                            borderRadius: 4, padding: '2px 8px',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {model}
                                        </div>
                                    </div>

                                    {/* Category badge */}
                                    <div style={{
                                        fontFamily: 'var(--mono)', fontSize: 10,
                                        color: 'var(--cyan)', background: 'var(--cyan-dim)',
                                        borderRadius: 4, padding: '2px 8px',
                                        display: 'inline-block', width: 'fit-content',
                                        marginBottom: 12, textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}>
                                        {agent.category}
                                    </div>

                                    {/* Description */}
                                    <div style={{
                                        fontFamily: 'var(--sans)', fontSize: 13,
                                        color: 'var(--text-2)', lineHeight: 1.6,
                                        marginBottom: 16, flex: 1,
                                    }}>
                                        {desc}
                                    </div>

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                                            {tags.slice(0, 5).map(tag => (
                                                <span key={tag} style={{
                                                    fontFamily: 'var(--mono)', fontSize: 9,
                                                    color: 'var(--text-3)', border: '1px solid var(--border)',
                                                    borderRadius: 4, padding: '2px 6px',
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {tags.length > 5 && (
                                                <span style={{
                                                    fontFamily: 'var(--mono)', fontSize: 9,
                                                    color: 'var(--text-3)',
                                                }}>
                                                    +{tags.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <Link
                                        href={`/builder?agent=${agent.name}`}
                                        style={{
                                            display: 'block', textAlign: 'center',
                                            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                                            color: 'var(--bg)', background: 'var(--cyan)',
                                            padding: '10px', borderRadius: 6,
                                            textDecoration: 'none', letterSpacing: '0.06em',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        ADD TO BUILDER →
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        border: '1px dashed var(--border)', borderRadius: 12,
                    }}>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: 'var(--text-3)', letterSpacing: '0.04em', marginBottom: 12 }}>
                            NO AGENTS FOUND
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>
                            No agents match the selected filter.{' '}
                            <Link href="/store" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Show all</Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
