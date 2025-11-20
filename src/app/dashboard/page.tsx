"use client"

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { User } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building2, Users, Package, FileText, Crown, LogOut, LayoutDashboard, Plus, AlertCircle } from 'lucide-react'
import MinhaEmpresa from '@/app/dashboard/components/MinhaEmpresa'
import Clientes from '@/app/dashboard/components/Clientes'
import Itens from '@/app/dashboard/components/Itens'
import NovoOrcamento from '@/app/dashboard/components/NovoOrcamento'
import Orcamentos from '@/app/dashboard/components/Orcamentos'
import PlanosPRO from '@/app/dashboard/components/PlanosPRO'

type TabType = 'dashboard' | 'empresa' | 'clientes' | 'itens' | 'novo' | 'orcamentos' | 'pro'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [stats, setStats] = useState({
    orcamentosNoMes: 0,
    totalAprovado: 0,
    taxaAprovacao: 0
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  async function checkUser() {
    try {
      // Verificar se Supabase está configurado
      if (!isSupabaseConfigured()) {
        setError('Supabase não configurado')
        setLoading(false)
        return
      }

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        // Silenciar erros de rede quando Supabase não está configurado
        console.warn('Aviso: Não foi possível conectar ao Supabase')
        setError('Supabase não configurado')
        setLoading(false)
        return
      }
      
      if (!authUser) {
        router.push('/')
        return
      }

      // Buscar dados do usuário - com tratamento de erro silencioso
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userError) {
          // Se tabela não existe, criar usuário mock
          console.warn('Tabela users não encontrada, usando dados do auth')
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            nome_empresa: 'Minha Empresa',
            plano_pro: false,
            created_at: new Date().toISOString()
          })
        } else if (userData) {
          setUser(userData)
        }
      } catch (err) {
        // Erro ao buscar dados - usar dados básicos do auth
        console.warn('Erro ao buscar dados do usuário, usando dados básicos')
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          nome_empresa: 'Minha Empresa',
          plano_pro: false,
          created_at: new Date().toISOString()
        })
      }
      
      setLoading(false)
    } catch (err) {
      console.warn('Erro ao verificar usuário:', err)
      setError('Supabase não configurado')
      setLoading(false)
    }
  }

  async function loadStats() {
    if (!user || !isSupabaseConfigured()) return

    try {
      // Buscar orçamentos do mês atual
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const { data: orcamentos, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())

      if (error) {
        // Silenciar erro se tabela não existe
        console.warn('Tabela orcamentos não encontrada')
        return
      }

      if (orcamentos) {
        const total = orcamentos.reduce((sum, orc) => sum + (orc.total || 0), 0)
        const aprovados = orcamentos.filter(orc => orc.status === 'aprovado').length
        const taxa = orcamentos.length > 0 ? (aprovados / orcamentos.length) * 100 : 0

        setStats({
          orcamentosNoMes: orcamentos.length,
          totalAprovado: total,
          taxaAprovacao: Math.round(taxa)
        })
      }
    } catch (err) {
      // Silenciar erros de estatísticas
      console.warn('Não foi possível carregar estatísticas')
    }
  }

  async function handleLogout() {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.warn('Erro ao fazer logout:', err)
    }
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Configuração Necessária</h2>
          </div>
          <p className="text-gray-700 mb-4">
            O Supabase precisa ser configurado para o app funcionar.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 font-medium mb-2">
              📋 Como configurar:
            </p>
            <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside">
              <li>Vá em <strong>Configurações do Projeto</strong></li>
              <li>Clique em <strong>Integrações</strong></li>
              <li>Conecte sua conta <strong>Supabase</strong></li>
            </ol>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Recarregar Página
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full"
              variant="outline"
            >
              Voltar para Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'novo' as TabType, label: 'Novo Orçamento', icon: Plus },
    { id: 'orcamentos' as TabType, label: 'Orçamentos', icon: FileText },
    { id: 'clientes' as TabType, label: 'Clientes', icon: Users },
    { id: 'itens' as TabType, label: 'Produtos e Serviços', icon: Package },
    { id: 'empresa' as TabType, label: 'Minha Empresa', icon: Building2 },
    { id: 'pro' as TabType, label: 'Plano PRO', icon: Crown },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OrçaPro</h1>
              {user.plano_pro && (
                <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-0.5">
                  <Crown className="w-3 h-3" />
                  PRO
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-xs text-gray-500">Logado como</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full justify-start"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Dashboard Home */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
                <p className="text-gray-600">Visão geral dos seus orçamentos</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.orcamentosNoMes}
                  </h3>
                  <p className="text-sm text-gray-600">Orçamentos no Mês</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    R$ {stats.totalAprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-sm text-gray-600">Total Aprovado</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.taxaAprovacao}%
                  </h3>
                  <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab('novo')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Orçamento
                  </Button>
                  <Button
                    onClick={() => setActiveTab('clientes')}
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Clientes
                  </Button>
                  <Button
                    onClick={() => setActiveTab('itens')}
                    variant="outline"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Gerenciar Produtos
                  </Button>
                  <Button
                    onClick={() => setActiveTab('empresa')}
                    variant="outline"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Minha Empresa
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Content */}
          {activeTab === 'empresa' && <MinhaEmpresa userId={user.id} />}
          {activeTab === 'clientes' && <Clientes userId={user.id} />}
          {activeTab === 'itens' && <Itens userId={user.id} isPro={user.plano_pro} />}
          {activeTab === 'novo' && <NovoOrcamento userId={user.id} isPro={user.plano_pro} />}
          {activeTab === 'orcamentos' && <Orcamentos userId={user.id} isPro={user.plano_pro} />}
          {activeTab === 'pro' && <PlanosPRO userId={user.id} isPro={user.plano_pro} />}
        </div>
      </main>
    </div>
  )
}
