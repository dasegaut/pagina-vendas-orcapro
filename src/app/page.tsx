"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { FileText, CheckCircle, Users, Package, Zap, Crown, TrendingUp, Shield, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/dashboard')
    }
  }

  async function handleLogin() {
    if (!loginData.email || !loginData.password) {
      toast.error('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      })

      if (error) throw error

      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup() {
    if (!signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast.error('Preencha todos os campos')
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (signupData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password
      })

      if (error) throw error

      // Criar registro na tabela users
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          plano_pro: false
        })
      }

      toast.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-pink-400/10 to-red-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                OrçaPro
              </h1>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Transforme Orçamentos Demorados<br />em Vendas Rápidas
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Crie orçamentos profissionais em segundos, envie pelo WhatsApp e feche mais negócios
            </p>
          </div>

          {/* Login/Signup Card */}
          <Card className="max-w-md mx-auto shadow-2xl">
            <CardHeader>
              <CardTitle>Comece Agora - É Grátis</CardTitle>
              <CardDescription>Crie sua conta e envie seu primeiro orçamento em minutos</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <Button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    />
                  </div>
                  <Button onClick={handleSignup} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problemas Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Se você trabalha com serviços, sabe como é:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Levar tempo demais pra montar orçamentos',
              'Perder vendas por estar "devagar demais"',
              'Ter que digitar tudo de novo toda vez',
              'Mandar orçamento desorganizado',
              'Não parecer profissional na frente do cliente',
              'Perder vendas por falta de agilidade'
            ].map((problema, i) => (
              <div key={i} className="p-6 border-2 border-red-200 rounded-lg bg-red-50">
                <p className="text-lg text-gray-800 font-medium">⛔ {problema}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-2xl font-bold text-gray-900 mt-12">
            Agora, tudo isso acabou.
          </p>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Principais Funcionalidades
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Tudo que você precisa para criar orçamentos profissionais
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: 'PDFs Profissionais', desc: 'Layout limpo e organizado, pronto para enviar' },
              { icon: Users, title: 'Gestão de Clientes', desc: 'Cadastre e organize todos seus clientes' },
              { icon: Package, title: 'Produtos e Serviços', desc: 'Banco completo com preços e descrições' },
              { icon: Zap, title: 'Envio Rápido', desc: 'WhatsApp com 1 clique direto do app' },
              { icon: TrendingUp, title: 'Reajuste Automático', desc: 'Atualize todos os preços de uma vez' },
              { icon: Shield, title: 'Dados Seguros', desc: 'Banco individual e protegido por usuário' }
            ].map((feature, i) => (
              <Card key={i} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Planos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Gratuito</CardTitle>
                <CardDescription>Para começar</CardDescription>
                <p className="text-4xl font-bold text-gray-900 mt-4">R$ 0<span className="text-lg font-normal text-gray-600">/mês</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Orçamentos ilimitados',
                    'Gerenciar produtos e serviços',
                    'Banco de dados próprio',
                    'Envio via WhatsApp'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-400 relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                RECOMENDADO
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-600" />
                  <CardTitle>PRO</CardTitle>
                </div>
                <CardDescription>Para profissionais</CardDescription>
                <p className="text-4xl font-bold text-gray-900 mt-4">R$ 29,90<span className="text-lg font-normal text-gray-600">/mês</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="w-5 h-5 text-amber-600" />
                    <span>Tudo do plano gratuito +</span>
                  </li>
                  {[
                    'Inserir fotos nos itens',
                    'Assinatura digital',
                    'Remover propaganda',
                    'Customização avançada',
                    'Suporte prioritário'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-pink-500 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Comece Agora - É Grátis
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Sem cartão. Sem burocracia. Só criar conta e usar.
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6">
            Quero Usar o OrçaPro Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 OrçaPro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
