import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { EmpresaInfo, Orcamento, Cliente } from './types'

export function generateOrcamentoPDF(
  orcamento: Orcamento,
  empresa: EmpresaInfo,
  cliente: Cliente,
  isPro: boolean
) {
  const doc = new jsPDF()
  
  // Cabeçalho com logo e dados da empresa
  if (empresa.logo) {
    try {
      doc.addImage(empresa.logo, 'PNG', 15, 10, 30, 30)
    } catch (e) {
      console.log('Erro ao adicionar logo')
    }
  }
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(empresa.nome, 50, 20)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`CNPJ: ${empresa.cnpj}`, 50, 27)
  doc.text(`${empresa.endereco}`, 50, 32)
  doc.text(`Tel: ${empresa.telefone} | WhatsApp: ${empresa.whatsapp}`, 50, 37)
  doc.text(`E-mail: ${empresa.email}`, 50, 42)
  
  // Linha separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(15, 48, 195, 48)
  
  // Título do orçamento
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ORÇAMENTO', 105, 58, { align: 'center' })
  
  // Dados do cliente
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE:', 15, 70)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(cliente.nome, 15, 76)
  doc.text(`CNPJ/CPF: ${cliente.cnpj}`, 15, 82)
  doc.text(`Telefone: ${cliente.telefone}`, 15, 88)
  doc.text(`Endereço: ${cliente.endereco}`, 15, 94)
  
  // Data
  doc.setFont('helvetica', 'bold')
  doc.text('DATA:', 150, 70)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(orcamento.data).toLocaleDateString('pt-BR'), 150, 76)
  
  // Tabela de itens
  const tableData = orcamento.itens.map(item => [
    item.nome,
    item.descricao,
    item.quantidade.toString(),
    `R$ ${item.preco.toFixed(2)}`,
    `R$ ${item.subtotal.toFixed(2)}`
  ])
  
  autoTable(doc, {
    startY: 105,
    head: [['Item', 'Descrição', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    }
  })
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 105
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VALOR TOTAL:', 130, finalY + 15)
  doc.setFontSize(14)
  doc.text(`R$ ${orcamento.total.toFixed(2)}`, 175, finalY + 15, { align: 'right' })
  
  // Observações
  if (orcamento.observacoes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('OBSERVAÇÕES:', 15, finalY + 30)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitObs = doc.splitTextToSize(orcamento.observacoes, 180)
    doc.text(splitObs, 15, finalY + 36)
  }
  
  // Assinatura (PRO)
  if (isPro && orcamento.assinatura) {
    const signY = finalY + (orcamento.observacoes ? 60 : 45)
    doc.line(15, signY, 85, signY)
    doc.setFontSize(9)
    doc.text('Assinatura do Responsável', 15, signY + 5)
  }
  
  // Rodapé
  if (!isPro) {
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Criado com OrçaPro', 105, 285, { align: 'center' })
  }
  
  return doc
}
