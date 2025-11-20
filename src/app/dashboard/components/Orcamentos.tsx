"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Orcamento, Cliente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Eye, Edit, Copy, Trash2, FileText, Send } from 'lucide-react'

interface Props {
  userId: string
  isPro: boolean
}

export default function Orcamentos({ userId, isPro }: Props) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadOrcamentos()
    loadClientes()
  }, [userId])

  useEffect(() => {
    const filtered = orcamentos.filter(orc => {
      const cliente = clientes.find(c => c.id === orc.cliente_id)
      return cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    })
    setFilteredOrcamentos(filtered)
  }, [searchTerm, orcamentos, clientes])

  async function loadOrcamentos() {
    const { data } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setOrcamentos(data)
      setFilteredOrcamentos(data)
    }
  }

  async function loadClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)

    if (data) setClientes(data)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este orçamento?')) return

    try {
      await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id)
      
      toast.success('Orçamento excluído!')
      loadOrcamentos()
    } catch (error) {
      toast.error('Erro ao excluir orçamento')
    }
  }

  async function handleDuplicate(orcamento: Orcamento) {
    try {
      const { id, created_at, ...orcamentoData } = orcamento
      
      await supabase
        .from('orcamentos')
        .insert(orcamentoData)
      
      toast.success('Orçamento duplicado!')
      loadOrcamentos()
    } catch (error) {
      toast.error('Erro ao duplicar orçamento')
    }
  }

  function handleVisualizarPDF(orcamento: Orcamento) {
    toast.success('Visualizando PDF...')
    // Aqui você implementaria a visualização real do PDF
  }

  function handleEnviarWhatsApp(orcamento: Orcamento) {
    const cliente = clientes.find(c => c.id === orcamento.cliente_id)
    if (!cliente) return

    const mensagem = `Olá ${cliente.nome}! Segue o orçamento.\n\nTotal: R$ ${orcamento.total.toFixed(2)}`
    const whatsapp = cliente.telefone.replace(/\D/g, '')
    const url = `https://wa.me/55${whatsapp}?text=${encodeURIComponent(mensagem)}`
    
    window.open(url, '_blank')
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; className: string }> = {
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      aprovado: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      rejeitado: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' }
    }

    const variant = variants[status] || variants.pendente

    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  function getClienteNome(clienteId: string) {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Cliente não encontrado'
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamentos Salvos</CardTitle>
        <CardDescription>Gerencie todos os seus orçamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredOrcamentos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum orçamento encontrado</p>
          ) : (
            filteredOrcamentos.map((orcamento) => (
              <div key={orcamento.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {getClienteNome(orcamento.cliente_id)}
                      </h3>
                      {getStatusBadge(orcamento.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Data: {formatDate(orcamento.created_at)}
                    </p>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                      R$ {orcamento.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Itens do Orçamento */}
                <div className="mb-3 p-3 bg-gray-50 rounded border">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Itens:</p>
                  <div className="space-y-1">
                    {orcamento.itens.map((item: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.nome} x{item.quantidade}</span>
                        <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVisualizarPDF(orcamento)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnviarWhatsApp(orcamento)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(orcamento)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(orcamento.id!)}
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
