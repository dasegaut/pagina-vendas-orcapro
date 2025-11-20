"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Item } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Search, TrendingUp, AlertCircle } from 'lucide-react'

interface Props {
  userId: string
  isPro: boolean
}

export default function Itens({ userId, isPro }: Props) {
  const [itens, setItens] = useState<Item[]>([])
  const [filteredItens, setFilteredItens] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reajusteDialogOpen, setReajusteDialogOpen] = useState(false)
  const [percentualReajuste, setPercentualReajuste] = useState('')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState<Item>({
    user_id: userId,
    nome: '',
    descricao: '',
    categoria: 'Produto',
    preco: 0,
    unidade: '',
    foto: null
  })

  useEffect(() => {
    loadItens()
  }, [userId])

  useEffect(() => {
    const filtered = itens.filter(i => 
      i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredItens(filtered)
  }, [searchTerm, itens])

  async function loadItens() {
    const { data } = await supabase
      .from('itens')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setItens(data)
      setFilteredItens(data)
    }
  }

  async function handleSave() {
    if (!formData.nome || !formData.preco) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    if (formData.foto && !isPro) {
      toast.error('Recurso disponível no plano PRO')
      return
    }

    try {
      if (editingItem) {
        await supabase
          .from('itens')
          .update(formData)
          .eq('id', editingItem.id)
        toast.success('Item atualizado!')
      } else {
        await supabase
          .from('itens')
          .insert(formData)
        toast.success('Item adicionado!')
      }

      setDialogOpen(false)
      resetForm()
      loadItens()
    } catch (error) {
      toast.error('Erro ao salvar item')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este item?')) return

    try {
      await supabase
        .from('itens')
        .delete()
        .eq('id', id)
      
      toast.success('Item excluído!')
      loadItens()
    } catch (error) {
      toast.error('Erro ao excluir item')
    }
  }

  async function handleReajuste() {
    const percentual = parseFloat(percentualReajuste)
    if (isNaN(percentual) || percentual === 0) {
      toast.error('Digite um percentual válido')
      return
    }

    try {
      const itensAtualizados = itens.map(item => ({
        ...item,
        preco: item.preco * (1 + percentual / 100)
      }))

      for (const item of itensAtualizados) {
        await supabase
          .from('itens')
          .update({ preco: item.preco })
          .eq('id', item.id)
      }

      toast.success(`Preços reajustados em ${percentual > 0 ? '+' : ''}${percentual}%`)
      setReajusteDialogOpen(false)
      setPercentualReajuste('')
      loadItens()
    } catch (error) {
      toast.error('Erro ao reajustar preços')
    }
  }

  function handleEdit(item: Item) {
    setEditingItem(item)
    setFormData(item)
    setDialogOpen(true)
  }

  function resetForm() {
    setEditingItem(null)
    setFormData({
      user_id: userId,
      nome: '',
      descricao: '',
      categoria: 'Produto',
      preco: 0,
      unidade: '',
      foto: null
    })
  }

  function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isPro) {
      toast.error('Recurso disponível no plano PRO')
      e.target.value = ''
      return
    }

    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Produtos e Serviços</CardTitle>
            <CardDescription>Gerencie seus itens</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={reajusteDialogOpen} onOpenChange={setReajusteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Reajustar Preços
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reajuste de Preços</DialogTitle>
                  <DialogDescription>Aplique um reajuste percentual em todos os itens</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentual">Percentual (%)</Label>
                    <Input
                      id="percentual"
                      type="number"
                      step="0.01"
                      value={percentualReajuste}
                      onChange={(e) => setPercentualReajuste(e.target.value)}
                      placeholder="Ex: 10 para +10% ou -5 para -5%"
                    />
                  </div>
                  <Button onClick={handleReajuste} className="w-full">
                    Aplicar Reajuste
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
                  <DialogDescription>Preencha os dados do produto ou serviço</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Nome do item"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value: 'Produto' | 'Serviço') => setFormData(prev => ({ ...prev, categoria: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Produto">Produto</SelectItem>
                          <SelectItem value="Serviço">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do item"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço (R$) *</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={formData.preco}
                        onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidade">Unidade/Medida</Label>
                      <Input
                        id="unidade"
                        value={formData.unidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
                        placeholder="Ex: UN, M², KG, HR"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto {!isPro && '(PRO)'}</Label>
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      disabled={!isPro}
                    />
                    {!isPro && (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Recurso disponível no plano PRO
                      </p>
                    )}
                    {formData.foto && (
                      <img src={formData.foto} alt="Preview" className="w-24 h-24 object-cover border rounded mt-2" />
                    )}
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    Salvar Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredItens.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum item cadastrado</p>
          ) : (
            filteredItens.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  {item.foto && (
                    <img src={item.foto} alt={item.nome} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{item.nome}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{item.categoria}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.descricao}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm font-semibold text-green-600">R$ {item.preco.toFixed(2)}</p>
                      {item.unidade && <p className="text-sm text-gray-500">{item.unidade}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id!)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
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
