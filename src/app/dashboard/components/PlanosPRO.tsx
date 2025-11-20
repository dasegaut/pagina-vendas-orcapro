"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Check, Sparkles } from 'lucide-react'

interface Props {
  userId: string
  isPro: boolean
}

export default function PlanosPRO({ userId, isPro }: Props) {
  function handleAssinar() {
    // Aqui você integrará com o sistema de pagamento
    window.open('https://pay.hotmart.com/seu-link-aqui', '_blank')
  }

  if (isPro) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <CardTitle>Plano PRO Ativo</CardTitle>
          </div>
          <CardDescription>Você está aproveitando todos os recursos premium</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500 p-3 rounded-full">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Plano PRO</h3>
                <p className="text-sm text-gray-600">Recursos ilimitados</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Inserir fotos nos itens</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Assinatura digital nos orçamentos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Remoção da propaganda</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Customização avançada</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Suporte prioritário</span>
              </div>
            </div>

            <p className="text-center text-gray-600 font-medium">
              Obrigado por ser um usuário PRO! 🎉
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plano PRO</CardTitle>
        <CardDescription>Desbloqueie recursos avançados para profissionalizar ainda mais seus orçamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Gratuito */}
          <div className="border rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plano Gratuito</h3>
              <p className="text-3xl font-bold text-gray-900">R$ 0</p>
              <p className="text-sm text-gray-600">Para sempre</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Orçamentos ilimitados</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Gerenciar produtos e serviços</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Banco de dados próprio</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Envio rápido via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>Geração de PDF</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" disabled>
              Plano Atual
            </Button>
          </div>

          {/* Plano PRO */}
          <div className="border-2 border-amber-500 rounded-lg p-6 bg-gradient-to-br from-amber-50 to-orange-50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                RECOMENDADO
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900">Plano PRO</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">R$ 29,90</p>
              <p className="text-sm text-gray-600">por mês</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-amber-600 font-bold" />
                <span className="font-medium">Tudo do plano gratuito +</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>🔥 Inserção de fotos nos itens</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>🔥 Assinatura digital</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>🔥 Remoção da propaganda</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>🔥 Configurações avançadas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                <span>🔥 Suporte prioritário</span>
              </div>
            </div>

            <Button 
              onClick={handleAssinar}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Assinar Plano PRO
            </Button>

            <p className="text-xs text-center text-gray-600 mt-3">
              Cancele quando quiser, sem multas
            </p>
          </div>
        </div>

        {/* Benefícios Extras */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Por que assinar o Plano PRO?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-1">📸 Orçamentos mais completos</p>
              <p className="text-gray-600">Adicione fotos dos produtos para impressionar seus clientes</p>
            </div>
            <div>
              <p className="font-medium mb-1">✍️ Mais profissionalismo</p>
              <p className="text-gray-600">Assinatura digital transmite confiança e credibilidade</p>
            </div>
            <div>
              <p className="font-medium mb-1">🎨 Marca própria</p>
              <p className="text-gray-600">Remova propagandas e deixe apenas sua marca</p>
            </div>
            <div>
              <p className="font-medium mb-1">💰 Mais vendas</p>
              <p className="text-gray-600">Orçamentos profissionais convertem mais clientes</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
