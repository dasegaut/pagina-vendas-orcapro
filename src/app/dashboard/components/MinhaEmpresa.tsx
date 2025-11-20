"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { EmpresaInfo } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Save, Upload } from 'lucide-react'

interface Props {
  userId: string
}

export default function MinhaEmpresa({ userId }: Props) {
  const [empresa, setEmpresa] = useState<EmpresaInfo>({
    user_id: userId,
    nome: '',
    logo: null,
    telefone: '',
    whatsapp: '',
    cnpj: '',
    endereco: '',
    responsavel: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingCNPJ, setLoadingCNPJ] = useState(false)

  useEffect(() => {
    loadEmpresa()
  }, [userId])

  async function loadEmpresa() {
    const { data } = await supabase
      .from('empresa_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      setEmpresa(data)
    }
  }

  async function buscarCNPJ() {
    if (empresa.cnpj.length < 14) {
      toast.error('CNPJ inválido')
      return
    }

    setLoadingCNPJ(true)
    try {
      const cnpjLimpo = empresa.cnpj.replace(/\D/g, '')
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`)
      const data = await response.json()

      if (data.status === 'ERROR') {
        toast.error('CNPJ não encontrado')
        return
      }

      setEmpresa(prev => ({
        ...prev,
        nome: data.nome || prev.nome,
        telefone: data.telefone || prev.telefone,
        endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}` || prev.endereco,
        email: data.email || prev.email
      }))

      toast.success('Dados carregados com sucesso!')
    } catch (error) {
      toast.error('Erro ao buscar CNPJ')
    } finally {
      setLoadingCNPJ(false)
    }
  }

  async function handleSave() {
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from('empresa_info')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        await supabase
          .from('empresa_info')
          .update(empresa)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('empresa_info')
          .insert(empresa)
      }

      toast.success('Dados salvos com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar dados')
    } finally {
      setLoading(false)
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEmpresa(prev => ({ ...prev, logo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minha Empresa</CardTitle>
        <CardDescription>Configure os dados da sua empresa que aparecerão nos orçamentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Empresa *</Label>
            <Input
              id="nome"
              value={empresa.nome}
              onChange={(e) => setEmpresa(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Minha Empresa Ltda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <div className="flex gap-2">
              <Input
                id="cnpj"
                value={empresa.cnpj}
                onChange={(e) => setEmpresa(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              <Button onClick={buscarCNPJ} disabled={loadingCNPJ} variant="outline">
                {loadingCNPJ ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={empresa.telefone}
              onChange={(e) => setEmpresa(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(00) 0000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              value={empresa.whatsapp}
              onChange={(e) => setEmpresa(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={empresa.endereco}
              onChange={(e) => setEmpresa(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, Número - Bairro, Cidade/UF"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={empresa.responsavel}
              onChange={(e) => setEmpresa(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={empresa.email}
              onChange={(e) => setEmpresa(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contato@empresa.com"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logo">Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
              {empresa.logo && (
                <img src={empresa.logo} alt="Logo" className="w-16 h-16 object-contain border rounded" />
              )}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Dados'}
        </Button>
      </CardContent>
    </Card>
  )
}
