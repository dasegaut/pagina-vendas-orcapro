"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

interface Props {
  userId: string
}

export default function Clientes({ userId }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState<Cliente>({
    user_id: userId,
    nome: '',
    telefone: '',
    cnpj: '',
    endereco: ''
  })

  useEffect(() => {
    loadClientes()
  }, [userId])

  useEffect(() => {
    const filtered = clientes.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm)
    )
    setFilteredClientes(filtered)
  }, [searchTerm, clientes])

  async function loadClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setClientes(data)
      setFilteredClientes(data)
    }
  }

  async function handleSave() {
    if (!formData.nome || !formData.telefone) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    try {
      if (editingCliente) {
        await supabase
          .from('clientes')
          .update(formData)
          .eq('id', editingCliente.id)
        toast.success('Cliente atualizado!')
      } else {
        await supabase
          .from('clientes')
          .insert(formData)
        toast.success('Cliente adicionado!')
      }

      setDialogOpen(false)
      resetForm()
      loadClientes()
    } catch (error) {
      toast.error('Erro ao salvar cliente')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este cliente?')) return

    try {
      await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
      
      toast.success('Cliente excluído!')
      loadClientes()
    } catch (error) {
      toast.error('Erro ao excluir cliente')
    }
  }

  function handleEdit(cliente: Cliente) {
    setEditingCliente(cliente)
    setFormData(cliente)
    setDialogOpen(true)
  }

  function resetForm() {
    setEditingCliente(null)
    setFormData({
      user_id: userId,
      nome: '',
      telefone: '',
      cnpj: '',
      endereco: ''
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Gerencie seus clientes</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                <DialogDescription>Preencha os dados do cliente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ/CPF</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    placeholder="Rua, Número - Bairro, Cidade/UF"
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  Salvar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredClientes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum cliente cadastrado</p>
          ) : (
            filteredClientes.map((cliente) => (
              <div key={cliente.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                  <p className="text-sm text-gray-600">{cliente.telefone}</p>
                  {cliente.cnpj && <p className="text-sm text-gray-500">CNPJ/CPF: {cliente.cnpj}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(cliente.id!)}>
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
