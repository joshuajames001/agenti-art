export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PipelineStatus = 'draft' | 'active' | 'archived'
export type RunStatus = 'pending' | 'running' | 'done' | 'failed'
export type RunStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped'
export type AdrStatus = 'draft' | 'accepted' | 'deprecated' | 'superseded'
export type ViolationAction = 'STOP' | 'WARN' | 'LOG' | 'ESCALATE'
export type MemoryType = 'episodic' | 'semantic'
export type UserPlan = 'free' | 'pro' | 'team'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          plan: UserPlan
          preferred_model: string
          locale: 'en' | 'cs'
          missions_completed: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'missions_completed'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      missions: {
        Row: {
          id: string
          slug: string
          title_en: string
          title_cs: string
          description_en: string | null
          description_cs: string | null
          difficulty: number
          template_pipeline: Json
          required_agents: string[]
          is_free: boolean
          order_index: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['missions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['missions']['Insert']>
      }
      pipelines: {
        Row: {
          id: string
          user_id: string
          mission_id: string | null
          name: string
          description: string | null
          status: PipelineStatus
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pipelines']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pipelines']['Insert']>
      }
      pipeline_steps: {
        Row: {
          id: string
          pipeline_id: string
          agent_name: string
          step_order: number
          model_override: string | null
          connectors: string[]
          input_from_step: string | null
          config: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pipeline_steps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pipeline_steps']['Insert']>
      }
      runs: {
        Row: {
          id: string
          pipeline_id: string
          user_id: string
          status: RunStatus
          trigger: 'manual' | 'scheduled' | 'webhook'
          total_tokens: number
          started_at: string | null
          finished_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['runs']['Row'], 'id' | 'created_at' | 'total_tokens'>
        Update: Partial<Database['public']['Tables']['runs']['Insert']>
      }
      run_steps: {
        Row: {
          id: string
          run_id: string
          step_id: string
          status: RunStepStatus
          input: Json | null
          output: Json | null
          error: string | null
          tokens_used: number
          started_at: string | null
          finished_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['run_steps']['Row'], 'id' | 'tokens_used'>
        Update: Partial<Database['public']['Tables']['run_steps']['Insert']>
      }
      adrs: {
        Row: {
          id: string
          user_id: string
          pipeline_id: string | null
          adr_number: number
          title: string
          status: AdrStatus
          rule: string
          failure_category: string | null
          evidence: Json
          enforced_by: string | null
          violation_action: ViolationAction
          superseded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['adrs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['adrs']['Insert']>
      }
      audit_log: {
        Row: {
          id: string
          run_id: string | null
          user_id: string
          agent: string
          action: string
          input_hash: string | null
          output_hash: string | null
          prev_hash: string | null
          adr_violations: string[]
          metadata: Json
          timestamp: string
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'timestamp'>
        Update: never
      }
      documents: {
        Row: {
          id: string
          user_id: string
          pipeline_id: string | null
          name: string
          source_type: 'upload' | 'url' | 'github' | 'manual'
          source_url: string | null
          content_type: string
          size_bytes: number | null
          status: 'processing' | 'ready' | 'failed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      agent_memories: {
        Row: {
          id: string
          user_id: string
          pipeline_id: string | null
          agent_name: string
          memory_type: MemoryType
          content: string
          run_id: string | null
          importance: number
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['agent_memories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['agent_memories']['Insert']>
      }
    }
    Functions: {
      search_document_chunks: {
        Args: {
          query_embedding: number[]
          match_user_id: string
          match_pipeline?: string
          match_count?: number
          similarity_threshold?: number
        }
        Returns: Array<{ id: string; content: string; metadata: Json; similarity: number }>
      }
      recall_agent_memories: {
        Args: {
          query_embedding: number[]
          match_user_id: string
          match_agent: string
          match_type?: string
          match_count?: number
        }
        Returns: Array<{ id: string; content: string; memory_type: string; importance: number; similarity: number }>
      }
    }
  }
}
