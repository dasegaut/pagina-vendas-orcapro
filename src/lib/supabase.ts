import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validação mais robusta
const isConfigured = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== 'https://placeholder.supabase.co' &&
                     supabaseAnonKey !== 'placeholder-key'

if (!isConfigured) {
  console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente.')
}

// Cliente mock para quando Supabase não está configurado
const mockSupabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: new Error('Supabase não configurado') }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase não configurado') }),
    signUp: async () => ({ data: { user: null }, error: new Error('Supabase não configurado') }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error('Supabase não configurado') }),
      }),
      gte: () => ({ data: null, error: new Error('Supabase não configurado') }),
    }),
    insert: async () => ({ data: null, error: new Error('Supabase não configurado') }),
    update: () => ({
      eq: async () => ({ data: null, error: new Error('Supabase não configurado') }),
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: new Error('Supabase não configurado') }),
    }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: new Error('Supabase não configurado') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}

// Criar cliente apenas se configurado corretamente, senão usa mock
export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : mockSupabaseClient as any

// Helper para verificar se está configurado
export const isSupabaseConfigured = () => isConfigured

export type Database = {
  users: {
    id: string
    email: string
    plano_pro: boolean
    created_at: string
  }
  empresa_info: {
    id: string
    user_id: string
    nome: string
    logo: string | null
    telefone: string
    whatsapp: string
    cnpj: string
    endereco: string
    responsavel: string
    email: string
  }
  clientes: {
    id: string
    user_id: string
    nome: string
    telefone: string
    cnpj: string
    endereco: string
    created_at: string
  }
  itens: {
    id: string
    user_id: string
    nome: string
    descricao: string
    categoria: 'Produto' | 'Serviço'
    preco: number
    unidade: string
    foto: string | null
    created_at: string
  }
  orcamentos: {
    id: string
    user_id: string
    cliente_id: string
    itens: any
    total: number
    data: string
    observacoes: string
    assinatura: string | null
    status: string
    created_at: string
  }
}
