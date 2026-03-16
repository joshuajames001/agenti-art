-- ============================================================
-- runagent.art — Supabase Database Migration
-- Version: 1.0.0 | March 2026 | GhostFactory
-- ============================================================
-- Run in Supabase SQL Editor or via supabase db push
-- Enable pgvector first: CREATE EXTENSION IF NOT EXISTS vector;
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            text UNIQUE NOT NULL,
  display_name     text,
  plan             text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  preferred_model  text NOT NULL DEFAULT 'smart',
  locale           text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'cs')),
  missions_completed int4 NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- missions (game template pipelines)
CREATE TABLE missions (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             text UNIQUE NOT NULL,
  title_en         text NOT NULL,
  title_cs         text NOT NULL,
  description_en   text,
  description_cs   text,
  difficulty       int2 NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  template_pipeline jsonb NOT NULL DEFAULT '{}',
  required_agents  text[] NOT NULL DEFAULT '{}',
  is_free          bool NOT NULL DEFAULT false,
  order_index      int2 NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- pipelines
CREATE TABLE pipelines (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id       uuid REFERENCES missions(id) ON DELETE SET NULL,
  name             text NOT NULL,
  description      text,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  config           jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- pipeline_steps
CREATE TABLE pipeline_steps (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id      uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  agent_name       text NOT NULL,
  step_order       int2 NOT NULL,
  model_override   text,
  connectors       text[] NOT NULL DEFAULT '{}',
  input_from_step  uuid REFERENCES pipeline_steps(id) ON DELETE SET NULL,
  config           jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pipeline_id, step_order)
);

-- ============================================================
-- RUNTIME TABLES
-- ============================================================

-- runs
CREATE TABLE runs (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id      uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
  trigger          text NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual', 'scheduled', 'webhook')),
  total_tokens     int4 NOT NULL DEFAULT 0,
  started_at       timestamptz,
  finished_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- run_steps
CREATE TABLE run_steps (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id           uuid NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  step_id          uuid NOT NULL REFERENCES pipeline_steps(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed', 'skipped')),
  input            jsonb,
  output           jsonb,
  error            text,
  tokens_used      int4 NOT NULL DEFAULT 0,
  started_at       timestamptz,
  finished_at      timestamptz
);

-- ============================================================
-- GOVERNANCE TABLES
-- ============================================================

-- adrs
CREATE TABLE adrs (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pipeline_id      uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  adr_number       int2 NOT NULL,
  title            text NOT NULL,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'accepted', 'deprecated', 'superseded')),
  rule             text NOT NULL,
  failure_category text,
  evidence         jsonb NOT NULL DEFAULT '{}',
  enforced_by      text,
  violation_action text NOT NULL DEFAULT 'STOP' CHECK (violation_action IN ('STOP', 'WARN', 'LOG', 'ESCALATE')),
  superseded_by    uuid REFERENCES adrs(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pipeline_id, adr_number)
);

-- audit_log (append-only ledger)
CREATE TABLE audit_log (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id           uuid REFERENCES runs(id) ON DELETE SET NULL,
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agent            text NOT NULL,
  action           text NOT NULL,
  input_hash       text,
  output_hash      text,
  prev_hash        text,
  adr_violations   text[] NOT NULL DEFAULT '{}',
  metadata         jsonb NOT NULL DEFAULT '{}',
  timestamp        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- KNOWLEDGE BASE + RAG
-- ============================================================

-- documents (knowledge base files per user/pipeline)
CREATE TABLE documents (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pipeline_id      uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  name             text NOT NULL,
  source_type      text NOT NULL DEFAULT 'upload' CHECK (source_type IN ('upload', 'url', 'github', 'manual')),
  source_url       text,
  content_type     text NOT NULL DEFAULT 'text/plain',
  size_bytes       int4,
  status           text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- document_chunks (pgvector RAG)
CREATE TABLE document_chunks (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id      uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chunk_index      int4 NOT NULL,
  content          text NOT NULL,
  embedding        vector(1536),
  metadata         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- AGENT MEMORY
-- ============================================================

-- agent_memories (episodic + semantic)
CREATE TABLE agent_memories (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pipeline_id      uuid REFERENCES pipelines(id) ON DELETE CASCADE,
  agent_name       text NOT NULL,
  memory_type      text NOT NULL CHECK (memory_type IN ('episodic', 'semantic')),
  content          text NOT NULL,
  embedding        vector(1536),
  run_id           uuid REFERENCES runs(id) ON DELETE SET NULL,
  importance       int2 NOT NULL DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Core
CREATE INDEX idx_pipelines_user ON pipelines(user_id);
CREATE INDEX idx_pipelines_mission ON pipelines(mission_id);
CREATE INDEX idx_pipeline_steps_pipeline ON pipeline_steps(pipeline_id);
CREATE INDEX idx_pipeline_steps_order ON pipeline_steps(pipeline_id, step_order);

-- Runtime
CREATE INDEX idx_runs_pipeline ON runs(pipeline_id);
CREATE INDEX idx_runs_user ON runs(user_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_run_steps_run ON run_steps(run_id);
CREATE INDEX idx_run_steps_status ON run_steps(status);

-- Governance
CREATE INDEX idx_adrs_user ON adrs(user_id);
CREATE INDEX idx_adrs_pipeline ON adrs(pipeline_id);
CREATE INDEX idx_adrs_status ON adrs(status);
CREATE INDEX idx_audit_log_run ON audit_log(run_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- RAG (ivfflat for approximate nearest neighbor)
CREATE INDEX idx_document_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX idx_document_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_user ON document_chunks(user_id);

-- Memory
CREATE INDEX idx_agent_memories_embedding
  ON agent_memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX idx_agent_memories_user_agent ON agent_memories(user_id, agent_name);
CREATE INDEX idx_agent_memories_type ON agent_memories(memory_type);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_steps   ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_steps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE adrs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories   ENABLE ROW LEVEL SECURITY;
-- missions: public read, no RLS needed for users

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- pipelines
CREATE POLICY "Users can CRUD own pipelines"
  ON pipelines FOR ALL USING (auth.uid() = user_id);

-- pipeline_steps
CREATE POLICY "Users can CRUD own pipeline steps"
  ON pipeline_steps FOR ALL
  USING (auth.uid() = (SELECT user_id FROM pipelines WHERE id = pipeline_id));

-- runs
CREATE POLICY "Users can CRUD own runs"
  ON runs FOR ALL USING (auth.uid() = user_id);

-- run_steps
CREATE POLICY "Users can view own run steps"
  ON run_steps FOR ALL
  USING (auth.uid() = (SELECT user_id FROM runs WHERE id = run_id));

-- adrs
CREATE POLICY "Users can CRUD own adrs"
  ON adrs FOR ALL USING (auth.uid() = user_id);

-- audit_log (insert + select only — never update/delete)
CREATE POLICY "Users can view own audit log"
  ON audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert audit log"
  ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- documents
CREATE POLICY "Users can CRUD own documents"
  ON documents FOR ALL USING (auth.uid() = user_id);

-- document_chunks
CREATE POLICY "Users can CRUD own document chunks"
  ON document_chunks FOR ALL USING (auth.uid() = user_id);

-- agent_memories
CREATE POLICY "Users can CRUD own agent memories"
  ON agent_memories FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER adrs_updated_at
  BEFORE UPDATE ON adrs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RAG similarity search function
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding vector(1536),
  match_user_id   uuid,
  match_pipeline  uuid DEFAULT NULL,
  match_count     int DEFAULT 5,
  similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id          uuid,
  content     text,
  metadata    jsonb,
  similarity  float
)
LANGUAGE sql STABLE AS $$
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.user_id = match_user_id
    AND (match_pipeline IS NULL OR dc.document_id IN (
      SELECT id FROM documents WHERE pipeline_id = match_pipeline
    ))
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Agent memory recall function
CREATE OR REPLACE FUNCTION recall_agent_memories(
  query_embedding  vector(1536),
  match_user_id    uuid,
  match_agent      text,
  match_type       text DEFAULT NULL,
  match_count      int DEFAULT 5
)
RETURNS TABLE (
  id           uuid,
  content      text,
  memory_type  text,
  importance   int2,
  similarity   float
)
LANGUAGE sql STABLE AS $$
  SELECT
    am.id,
    am.content,
    am.memory_type,
    am.importance,
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM agent_memories am
  WHERE am.user_id = match_user_id
    AND am.agent_name = match_agent
    AND (match_type IS NULL OR am.memory_type = match_type)
    AND (am.expires_at IS NULL OR am.expires_at > now())
  ORDER BY am.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- SEED DATA — first mission
-- ============================================================

INSERT INTO missions (slug, title_en, title_cs, description_en, description_cs, difficulty, is_free, order_index, template_pipeline, required_agents)
VALUES (
  'first-support-bot',
  'Build your first support bot',
  'Postav svého prvního support bota',
  'Learn the basics by building a customer support bot. Configure it with your product knowledge base and watch it handle customer questions.',
  'Nauč se základy vytvořením zákaznického support bota. Nastav ho se znalostní bází svého produktu a sleduj jak odpovídá na otázky zákazníků.',
  1,
  true,
  1,
  '{"steps": [{"agent": "support-bot", "order": 1, "connectors": ["file-ops"]}]}',
  ARRAY['support-bot']
);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE profiles IS 'User profiles — extends Supabase auth.users';
COMMENT ON TABLE missions IS 'Game missions — template pipelines for onboarding';
COMMENT ON TABLE pipelines IS 'User-created agent pipelines';
COMMENT ON TABLE pipeline_steps IS 'Individual agent steps within a pipeline';
COMMENT ON TABLE runs IS 'Pipeline execution instances';
COMMENT ON TABLE run_steps IS 'Per-step execution state within a run';
COMMENT ON TABLE adrs IS 'Architecture Decision Records — binding pipeline rules';
COMMENT ON TABLE audit_log IS 'Append-only ledger — never update or delete rows';
COMMENT ON TABLE documents IS 'Knowledge base documents for RAG';
COMMENT ON TABLE document_chunks IS 'Chunked document content with pgvector embeddings';
COMMENT ON TABLE agent_memories IS 'Episodic and semantic agent memory with pgvector';

COMMENT ON COLUMN audit_log.prev_hash IS 'Chain-of-hashes integrity — links to previous log entry';
COMMENT ON COLUMN adrs.pipeline_id IS 'NULL = global ADR (applies to all user pipelines)';
COMMENT ON COLUMN agent_memories.memory_type IS 'episodic = specific events, semantic = general patterns';
