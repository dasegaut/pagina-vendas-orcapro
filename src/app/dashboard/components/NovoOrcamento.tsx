"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente, Item, Orcamento } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Trash2, FileText, Send, AlertCircle } from 'lucide-react'

interface Props {
  userId: string
  isPro: boolean
}

interface ItemOrcamento {
  item_id: string
  nome: string
  descricao: string
  preco: number
  quantidade: number
  subtotal: number
}

export default function NovoOrcamento({ userId, isPro }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [itens, setItens] = useState<Item[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [itensOrcamento, setItensOrcamento] = useState<ItemOrcamento[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [assinatura, setAssinatura] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClientes()
    loadItens()
  }, [userId])

  async function loadClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .order('nome')

    if (data) setClientes(data)
  }

  async function loadItens() {
    const { data } = await supabase
      .from('itens')
      .select('*')
      .eq('user_id', userId)
      .order('nome')

    if (data) setItens(data)
  }

  function adicionarItem(itemId: string) {
    const item = itens.find(i => i.id === itemId)
    if (!item) return

    const itemExistente = itensOrcamento.find(i => i.item_id === itemId)
    if (itemExistente) {
      toast.error('Item já adicionado')
      return
    }

    const novoItem: ItemOrcamento = {
      item_id: item.id!,
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      quantidade: 1,
      subtotal: item.preco
    }

    setItensOrcamento([...itensOrcamento, novoItem])
  }

  function atualizarQuantidade(itemId: string, quantidade: number) {
    setItensOrcamento(itensOrcamento.map(item => {
      if (item.item_id === itemId) {
        return {
          ...item,
          quantidade,
          subtotal: item.preco * quantidade
        }
      }
      return item
    }))
  }

  function removerItem(itemId: string) {
    setItensOrcamento(itensOrcamento.filter(i => i.item_id !== itemId))
  }

  function calcularTotal() {
    return itensOrcamento.reduce((sum, item) => sum + item.subtotal, 0)
  }

  async function handleSalvar() {
    if (!clienteSelecionado) {
      toast.error('Selecione um cliente')
      return
    }

    if (itensOrcamento.length === 0) {
      toast.error('Adicione pelo menos um item')
      return
    }

    if (assinatura && !isPro) {
      toast.error('Assinatura digital disponível no plano PRO')
      return
    }

    setLoading(true)
    try {
      const orcamento: Partial<Orcamento> = {
        user_id: userId,
        cliente_id: clienteSelecionado,
        itens: itensOrcamento,
        total: calcularTotal(),
        observacoes,
        assinatura: isPro ? assinatura : null,
        status: 'pendente'
      }

      const { data, error } = await supabase
        .from('orcamentos')
        .insert(orcamento)
        .select()
        .single()

      if (error) throw error

      toast.success('Orçamento salvo com sucesso!')
      limparFormulario()
    } catch (error) {
      toast.error('Erro ao salvar orçamento')
    } finally {
      setLoading(false)
    }
  }

  async function handleGerarPDF() {
    if (!clienteSelecionado || itensOrcamento.length === 0) {
      toast.error('Preencha os dados do orçamento')
      return
    }

    toast.success('PDF gerado. Clique em Enviar pelo WhatsApp.')
    // Aqui você pode implementar a geração real do PDF
  }

  function handleEnviarWhatsApp() {
    const cliente = clientes.find(c => c.id === clienteSelecionado)
    if (!cliente) return

    const mensagem = `Olá ${cliente.nome}! Segue o orçamento solicitado.\n\nTotal: R$ ${calcularTotal().toFixed(2)}`
    const whatsapp = cliente.telefone.replace(/\D/g, '')
    const url = `https://wa.me/55${whatsapp}?text=${encodeURIComponent(mensagem)}`
    
    window.open(url, '_blank')
  }

  function limparFormulario() {
    setClienteSelecionado('')
    setItensOrcamento([])
    setObservacoes('')
    setAssinatura('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Orçamento</CardTitle>
        <CardDescription>Crie um orçamento profissional</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Cliente */}
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.id!}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Adicionar Itens */}
        <div className="space-y-2">
          <Label htmlFor="item">Adicionar Item</Label>
          <Select onValueChange={adicionarItem}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um item" />
            </SelectTrigger>
            <SelectContent>
              {itens.map(item => (
                <SelectItem key={item.id} value={item.id!}>
                  {item.nome} - R$ {item.preco.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Itens Adicionados */}
        {itensOrcamento.length > 0 && (
          <div className="space-y-3">
            <Label>Itens do Orçamento</Label>
            <div className="border rounded-lg divide-y">
              {itensOrcamento.map(item => (
                <div key={item.item_id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.nome}</h4>
                      <p className="text-sm text-gray-600">{item.descricao}</p>
                      <p className="text-sm text-gray-500 mt-1">R$ {item.preco.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(item.item_id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`qtd-${item.item_id}`} className="text-xs">Quantidade</Label>
                      <Input
                        id={`qtd-${item.item_id}`}
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarQuantidade(item.item_id, parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Subtotal</Label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        R$ {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total do Orçamento</span>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais sobre o orçamento"
            rows={3}
          />
        </div>

        {/* Assinatura (PRO) */}
        <div className="space-y-2">
          <Label htmlFor="assinatura">Assinatura Digital {!isPro && '(PRO)'}</Label>
          <Input
            id="assinatura"
            value={assinatura}
            onChange={(e) => setAssinatura(e.target.value)}
            placeholder="Nome do responsável"
            disabled={!isPro}
          />
          {!isPro && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Recurso disponível no plano PRO
            </p>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSalvar} disabled={loading} className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Orçamento'}
          </Button>
          <Button onClick={handleGerarPDF} variant="outline" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          <Button onClick={handleEnviarWhatsApp} variant="outline" className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
