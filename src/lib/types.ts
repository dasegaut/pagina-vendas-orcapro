export interface User {
  id: string
  email: string
  plano_pro: boolean
}

export interface EmpresaInfo {
  id?: string
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

export interface Cliente {
  id?: string
  user_id: string
  nome: string
  telefone: string
  cnpj: string
  endereco: string
  created_at?: string
}

export interface Item {
  id?: string
  user_id: string
  nome: string
  descricao: string
  categoria: 'Produto' | 'Serviço'
  preco: number
  unidade: string
  foto: string | null
  created_at?: string
}

export interface OrcamentoItem {
  item_id: string
  nome: string
  descricao: string
  quantidade: number
  preco: number
  subtotal: number
}

export interface Orcamento {
  id?: string
  user_id: string
  cliente_id: string
  cliente_nome?: string
  itens: OrcamentoItem[]
  total: number
  status: 'pendente' | 'aprovado' | 'rejeitado'
  observacoes: string
  assinatura: string | null
  created_at: string
}
