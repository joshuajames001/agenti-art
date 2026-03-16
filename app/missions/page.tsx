import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Mission {
    id: string
    slug: string
    title_en: string
    title_cs: string
    description_en: string
    description_cs: string
    difficulty: number
    is_free: boolean
    required_agents: string[]
    order_index: number
    created_at: string
}

export default async function MissionsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .order('order_index', { ascending: true }) as { data: Mission[] | null }

    const { data: completedMissions } = user ? await supabase
        .from('pipelines')
        .select('mission_id')
        .eq('user_id', user.id)
        .eq('status', 'active') as { data: { mission_id: string }[] | null } : { data: [] as { mission_id: string }[] }

    const completedIds = new Set(completedMissions?.map(p => p.mission_id) || [])

    const difficultyLabel = (d: number) => ['', 'ROOKIE', 'JUNIOR', 'MID', 'SENIOR', 'EXPERT'][d]
    const difficultyColor = (d: number) => ['', 'var(--cyan)', '#7eb8f7', '#ffd166', '#ff9a3c', 'var(--red)'][d]

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
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', borderBottom: '1px solid var(--cyan)' }}>
                        missions
                    </span>
                    <Link href="/store" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}>
                        agent store
                    </Link>
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
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 48, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                        MISSIONS
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                        Complete missions to build real agent pipelines. First mission is always free.
                    </div>
                </div>

                {/* Mission grid */}
                {missions && missions.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {missions.map((mission: Mission, i: number) => {
                            const isCompleted = completedIds.has(mission.id)
                            const isLocked = !mission.is_free && !user
                            const animDelay = `${i * 0.08}s`

                            return (
                                <div
                                    key={mission.id}
                                    className="fade-up"
                                    style={{
                                        animationDelay: animDelay,
                                        background: 'var(--bg-2)',
                                        border: `1px solid ${isCompleted ? 'var(--cyan-dim)' : 'var(--border)'}`,
                                        borderRadius: 10,
                                        padding: 28,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        opacity: isLocked ? 0.5 : 1,
                                        transition: 'border 0.2s, transform 0.2s',
                                    }}
                                >
                                    {/* Completed glow */}
                                    {isCompleted && (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'radial-gradient(ellipse at top left, var(--cyan-dim) 0%, transparent 60%)',
                                            pointerEvents: 'none'
                                        }} />
                                    )}

                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>

                                        {/* Mission number */}
                                        <div style={{
                                            fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)',
                                            border: '1px solid var(--border)', borderRadius: 4,
                                            padding: '2px 8px'
                                        }}>
                                            MISSION {String(i + 1).padStart(2, '0')}
                                        </div>

                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {/* Difficulty */}
                                            <div style={{
                                                fontFamily: 'var(--mono)', fontSize: 10,
                                                color: difficultyColor(mission.difficulty),
                                                border: `1px solid ${difficultyColor(mission.difficulty)}40`,
                                                borderRadius: 4, padding: '2px 8px'
                                            }}>
                                                {difficultyLabel(mission.difficulty)}
                                            </div>

                                            {/* Free badge */}
                                            {mission.is_free && (
                                                <div style={{
                                                    fontFamily: 'var(--mono)', fontSize: 10,
                                                    color: 'var(--bg)', background: 'var(--cyan)',
                                                    borderRadius: 4, padding: '2px 8px', fontWeight: 700
                                                }}>
                                                    FREE
                                                </div>
                                            )}

                                            {/* Completed */}
                                            {isCompleted && (
                                                <div style={{
                                                    fontFamily: 'var(--mono)', fontSize: 10,
                                                    color: 'var(--cyan)', border: '1px solid var(--cyan-dim)',
                                                    borderRadius: 4, padding: '2px 8px'
                                                }}>
                                                    ✓ DONE
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div style={{
                                        fontFamily: 'var(--display)', fontSize: 22,
                                        color: isCompleted ? 'var(--cyan)' : 'var(--text)',
                                        letterSpacing: '0.03em', marginBottom: 10, lineHeight: 1.1
                                    }}>
                                        {mission.title_en.toUpperCase()}
                                    </div>

                                    {/* Description */}
                                    <div style={{
                                        fontFamily: 'var(--sans)', fontSize: 13,
                                        color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20
                                    }}>
                                        {mission.description_en}
                                    </div>

                                    {/* Agents required */}
                                    {mission.required_agents?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                                            {mission.required_agents.map((agent: string) => (
                                                <span key={agent} style={{
                                                    fontFamily: 'var(--mono)', fontSize: 10,
                                                    color: 'var(--text-3)', border: '1px solid var(--border)',
                                                    borderRadius: 4, padding: '2px 8px'
                                                }}>
                                                    {agent}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* CTA */}
                                    {isLocked ? (
                                        <div style={{
                                            fontFamily: 'var(--mono)', fontSize: 11,
                                            color: 'var(--text-3)', textAlign: 'center', padding: '10px 0'
                                        }}>
                                            🔒 sign in to unlock
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/missions/${mission.slug}`}
                                            style={{
                                                display: 'block', textAlign: 'center',
                                                fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                                                color: isCompleted ? 'var(--cyan)' : 'var(--bg)',
                                                background: isCompleted ? 'transparent' : 'var(--cyan)',
                                                border: isCompleted ? '1px solid var(--cyan-dim)' : 'none',
                                                padding: '11px', borderRadius: 6,
                                                textDecoration: 'none', letterSpacing: '0.06em',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {isCompleted ? 'VIEW PIPELINE →' : 'START MISSION →'}
                                        </Link>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    /* Empty state */
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        border: '1px dashed var(--border)', borderRadius: 12
                    }}>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: 'var(--text-3)', letterSpacing: '0.04em', marginBottom: 12 }}>
                            NO MISSIONS YET
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>
                            Run the Supabase migration SQL to seed the first mission.
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}
