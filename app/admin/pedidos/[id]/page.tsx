'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  imageColor: string;
}

interface OrderDetails {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  doc: string;
  docType: 'CPF' | 'CNPJ';
  ie?: string;
  status: 'approved' | 'pending' | 'in_process' | 'rejected';
  paymentMethod: string;
  paymentDetails: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  carrier: string;
  address: string;
  date: string;
  nfeEmitida: boolean;
  nfeNumber?: string;
  etiquetaGerada: boolean;
  trackingCode?: string;
  items: OrderItem[];
  timeline: { time: string; text: string; desc?: string }[];
  blingOrderId?: string;
  blingError?: any;
}

const MOCK_ORDERS_DETAILS: Record<string, OrderDetails> = {
  '1042': {
    id: '1042',
    customerName: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98888-7777',
    doc: '123.456.789-00',
    docType: 'CPF',
    status: 'approved',
    paymentMethod: 'PIX',
    paymentDetails: 'Transação Mercado Pago #938502938',
    subtotal: 130.60,
    shippingCost: 18.90,
    discount: 0,
    total: 149.50,
    carrier: 'Correios SEDEX',
    address: 'Rua das Flores, 123, São Paulo - SP, CEP 01234-567',
    date: '08/07/2026 às 14:32',
    nfeEmitida: true,
    nfeNumber: '000.001.042',
    etiquetaGerada: true,
    trackingCode: 'QB123456789BR',
    items: [
      { id: '1', name: '1 Kg Saco Plástico PE 20 X 30 X 0,15 Médio', sku: 'PE-015-20x30', price: 26.12, qty: 5, imageColor: '#E5E7EB' },
    ],
    timeline: [
      { time: '08/07/2026 15:10', text: 'Objeto postado na transportadora', desc: 'Postagem realizada em Diadema/SP' },
      { time: '08/07/2026 14:50', text: 'Etiqueta de postagem impressa', desc: 'Preparado para coleta Correios' },
      { time: '08/07/2026 14:42', text: 'Nota Fiscal emitida (NF-e 000.001.042)', desc: 'Transmitida com sucesso via Bling ERP' },
      { time: '08/07/2026 14:35', text: 'Pagamento aprovado', desc: 'Aprovado instantaneamente via Mercado Pago' },
      { time: '08/07/2026 14:32', text: 'Pedido realizado', desc: 'Realizado na loja online como cliente logado' },
    ]
  },
  '1041': {
    id: '1041',
    customerName: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 97777-6666',
    doc: '987.654.321-11',
    docType: 'CPF',
    status: 'pending',
    paymentMethod: 'PIX (Aguardando)',
    paymentDetails: 'PIX gerado. Vencimento em 24h.',
    subtotal: 90.50,
    shippingCost: 14.20,
    discount: 0,
    total: 104.70,
    carrier: 'Melhor Envio PAC',
    address: 'Av. Paulista, 900, Ap 52, São Paulo - SP, CEP 01310-100',
    date: '08/07/2026 às 11:15',
    nfeEmitida: false,
    etiquetaGerada: false,
    items: [
      { id: '2', name: 'Saco Plástico Zip Lock N05 10x14cm (100un)', sku: 'ZIP-N05-10x14', price: 30.16, qty: 3, imageColor: '#F3F4F6' },
    ],
    timeline: [
      { time: '08/07/2026 11:15', text: 'Aguardando confirmação de pagamento', desc: 'Código PIX Copia e Cola gerado para o cliente' },
      { time: '08/07/2026 11:15', text: 'Pedido realizado', desc: 'Checkout finalizado' },
    ]
  },
  '1040': {
    id: '1040',
    customerName: 'Embalagens Diadema Ltda',
    email: 'compras@embalagensdiadema.com.br',
    phone: '(11) 4004-9000',
    doc: '12.345.678/0001-99',
    docType: 'CNPJ',
    ie: '123.456.789.110',
    status: 'approved',
    paymentMethod: 'Boleto Bancário',
    paymentDetails: 'Faturado 15 dias - Faturamento interno ERP Bling',
    subtotal: 145.30,
    shippingCost: 34.50,
    discount: 0,
    total: 179.80,
    carrier: 'Jadlog .Package',
    address: 'Rua Pastor Rubens Lopes, 55, Piraporinha, Diadema - SP, CEP 09950-190',
    date: '07/07/2026 às 16:45',
    nfeEmitida: true,
    nfeNumber: '000.001.040',
    etiquetaGerada: false,
    items: [
      { id: '3', name: 'Sacos PE Industrial Canela 40x60cm (100un)', sku: 'PE-IND-40x60', price: 72.65, qty: 2, imageColor: '#D1D5DB' },
    ],
    timeline: [
      { time: '07/07/2026 17:10', text: 'Nota Fiscal emitida (NF-e 000.001.040)', desc: 'Registrada no CNPJ da empresa destinatária' },
      { time: '07/07/2026 17:05', text: 'Pagamento aprovado / Faturamento autorizado', desc: 'Crédito aprovado pelo gestor comercial B2B' },
      { time: '07/07/2026 16:45', text: 'Pedido realizado', desc: 'Realizado via checkout PJ com CNPJ e I.E.' },
    ]
  },
  '1039': {
    id: '1039',
    customerName: 'Ana Costa',
    email: 'ana.costa@hotmail.com',
    phone: '(11) 96666-5555',
    doc: '234.567.890-12',
    docType: 'CPF',
    status: 'in_process',
    paymentMethod: 'Cartão de Crédito',
    paymentDetails: 'Mercado Pago - Analisando risco anti-fraude',
    subtotal: 220.30,
    shippingCost: 18.90,
    discount: 0,
    total: 239.20,
    carrier: 'Correios SEDEX',
    address: 'Rua Getúlio Vargas, 456, Diadema - SP, CEP 09910-000',
    date: '07/07/2026 às 09:20',
    nfeEmitida: false,
    etiquetaGerada: false,
    items: [
      { id: '4', name: '1 Kg Saco Plástico PE 30 X 40 X 0,10 Fino', sku: 'PE-010-30x40', price: 27.53, qty: 8, imageColor: '#E5E7EB' },
    ],
    timeline: [
      { time: '07/07/2026 09:22', text: 'Pagamento em análise de risco', desc: 'Análise anti-fraude do gateway Mercado Pago em processamento' },
      { time: '07/07/2026 09:20', text: 'Pedido realizado', desc: 'Transação enviada para o gateway' },
    ]
  },
  '1038': {
    id: '1038',
    customerName: 'Pedro Lima',
    email: 'pedro.lima@gmail.com',
    phone: '(11) 95555-4444',
    doc: '345.678.901-23',
    docType: 'CPF',
    status: 'approved',
    paymentMethod: 'Cartão de Crédito',
    paymentDetails: 'Mercado Pago - Parcelado 2x s/ juros',
    subtotal: 45.70,
    shippingCost: 14.20,
    discount: 0,
    total: 59.90,
    carrier: 'Melhor Envio PAC',
    address: 'Rua Vergueiro, 3200, São Paulo - SP, CEP 04102-000',
    date: '06/07/2026 às 15:30',
    nfeEmitida: true,
    nfeNumber: '000.001.038',
    etiquetaGerada: true,
    trackingCode: 'QB987654321BR',
    items: [
      { id: '5', name: 'Zip Lock Kit Variado (P, M e G)', sku: 'ZIP-KIT-VAR', price: 45.70, qty: 1, imageColor: '#BFDBFE' },
    ],
    timeline: [
      { time: '06/07/2026 16:30', text: 'Objeto postado na transportadora', desc: 'Coleta PAC concluída' },
      { time: '06/07/2026 16:00', text: 'Etiqueta impressa e fixada', desc: 'Embalado para entrega' },
      { time: '06/07/2026 15:45', text: 'Nota Fiscal emitida (NF-e 000.001.038)', desc: 'Sucesso' },
      { time: '06/07/2026 15:32', text: 'Pagamento aprovado', desc: 'Autorizado' },
      { time: '06/07/2026 15:30', text: 'Pedido realizado', desc: 'Finalizado' },
    ]
  }
};

const statusLabels: Record<string, string> = {
  approved: 'Aprovado',
  pending: 'Pendente',
  in_process: 'Em análise',
  rejected: 'Cancelado/Rejeitado'
};

const statusColors: Record<string, string> = {
  approved: 'var(--success)',
  pending: 'var(--warning)',
  in_process: '#8B5CF6',
  rejected: 'var(--danger)'
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // 1. Tentar ler do localStorage (abc_orders)
      const localOrdersStr = localStorage.getItem('abc_orders');
      if (localOrdersStr) {
        try {
          const localOrders = JSON.parse(localOrdersStr);
          const found = localOrders.find((o: any) => o.id === orderId);
          if (found) {
            const mapped: OrderDetails = {
              id: found.id,
              customerName: found.customer,
              email: found.email,
              phone: found.phone || '(11) 99999-9999',
              doc: found.cpf || '',
              docType: (found.cpf || '').replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF',
              status: found.status || 'approved',
              paymentMethod: found.paymentMethod || 'PIX',
              paymentDetails: `Transação simulada do gateway de pagamento para o pedido #${found.id}`,
              subtotal: found.total - (found.shipping || 0),
              shippingCost: found.shipping || 0,
              discount: 0,
              total: found.total,
              carrier: 'Correios Express',
              address: 'Endereço fornecido no checkout',
              date: found.date || new Date().toLocaleString('pt-BR'),
              nfeEmitida: found.nfe || false,
              etiquetaGerada: found.label || false,
              blingOrderId: found.blingOrderId,
              blingError: found.blingError,
              items: found.items ? found.items.map((item: any, idx: number) => ({
                id: String(idx + 1),
                name: item.name,
                sku: item.sku || 'SKU-PROD',
                price: item.price,
                qty: item.qty,
                imageColor: '#E5E7EB'
              })) : [],
              timeline: [
                { time: found.date || new Date().toLocaleString('pt-BR'), text: 'Pedido finalizado e registrado', desc: 'Realizado na loja online' }
              ]
            };
            setOrder(mapped);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Erro ao ler ordem local:', err);
        }
      }

      // 2. Fallback para os MOCK_ORDERS_DETAILS
      const details = MOCK_ORDERS_DETAILS[orderId];
      if (details) {
        setOrder(details);
      }
      setLoading(false);
    }
  }, [orderId]);

  const handleEmitNfe = () => {
    if (!order) return;
    const nfeNum = `000.001.${Math.floor(Math.random() * 900) + 100}`;
    const today = new Date().toLocaleString('pt-BR');
    
    setOrder(prev => {
      if (!prev) return null;
      return {
        ...prev,
        nfeEmitida: true,
        nfeNumber: nfeNum,
        timeline: [
          { time: today, text: `Nota Fiscal emitida (NF-e ${nfeNum})`, desc: 'Transmitida com sucesso via Bling ERP' },
          ...prev.timeline
        ]
      };
    });
    alert(`Nota Fiscal ${nfeNum} emitida com sucesso e vinculada ao pedido!`);
  };

  const handleGenerateLabel = () => {
    if (!order) return;
    const tracking = `QB${Math.floor(Math.random() * 900000000) + 100000000}BR`;
    const today = new Date().toLocaleString('pt-BR');

    setOrder(prev => {
      if (!prev) return null;
      return {
        ...prev,
        etiquetaGerada: true,
        trackingCode: tracking,
        timeline: [
          { time: today, text: 'Etiqueta de postagem impressa', desc: `Etiqueta gerada para postagem via ${prev.carrier}` },
          ...prev.timeline
        ]
      };
    });
    alert(`Etiqueta gerada com sucesso! Código de Rastreamento: ${tracking}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-medium)' }}>
        <p>Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h2>Pedido não encontrado</h2>
        <p style={{ color: 'var(--text-light)' }}>O pedido #{orderId} não existe no sistema.</p>
        <button onClick={() => router.push('/admin/pedidos')} className="btn btn-primary">
          Voltar para Pedidos
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Top Header */}
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/admin/pedidos')} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#fff', border: '1px solid var(--border)' }}>
            ← Pedidos
          </button>
          <div>
            <h1 className="admin-topbar-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Pedido #{order.id}
              <span className={`status-pill ${order.status}`} style={{ display: 'inline-block', fontSize: '0.72rem', verticalAlign: 'middle', padding: '3px 10px', background: statusColors[order.status], color: '#fff' }}>
                {statusLabels[order.status]}
              </span>
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>Realizado em {order.date}</p>
          </div>
        </div>

        <div className="admin-topbar-actions" style={{ display: 'flex', gap: 8 }}>
          {!order.nfeEmitida && order.status === 'approved' && (
            <button onClick={handleEmitNfe} className="btn btn-primary" style={{ padding: '10px 18px', background: 'var(--primary)', borderColor: 'var(--primary)', borderRadius: 4, fontWeight: 600, fontSize: '0.82rem' }}>
              ⚡ Emitir NF-e (Bling)
            </button>
          )}
          {!order.etiquetaGerada && order.status === 'approved' && (
            <button onClick={handleGenerateLabel} className="btn btn-primary" style={{ padding: '10px 18px', background: '#8B5CF6', borderColor: '#8B5CF6', borderRadius: 4, fontWeight: 600, fontSize: '0.82rem' }}>
              📦 Gerar Etiqueta Envio
            </button>
          )}
          {order.nfeEmitida && (
            <span style={{ fontSize: '0.78rem', background: '#E8F5E9', color: 'var(--success)', fontWeight: 700, padding: '8px 12px', borderRadius: 4, border: '1px solid #C8E6C9' }}>
              ✓ NF-e {order.nfeNumber} Emitida
            </span>
          )}
          {order.etiquetaGerada && (
            <span style={{ fontSize: '0.78rem', background: '#F3E8FF', color: '#8B5CF6', fontWeight: 700, padding: '8px 12px', borderRadius: 4, border: '1px solid #E9D5FF' }}>
              ✓ Rastreio {order.trackingCode} Gerado
            </span>
          )}
        </div>
      </div>

      <div className="admin-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, background: '#f0f4f8', minHeight: 'calc(100vh - 72px)' }}>
        {order.blingError && !order.blingOrderId && (
          <div style={{
            gridColumn: '1 / -1',
            background: '#FDF2F2',
            border: '1px solid #F8B4B4',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '1.5rem', marginTop: -2 }}>⚠️</div>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#9B1C1C', fontSize: '0.9rem', fontWeight: 700 }}>Falha na Integração Automática com o Bling ERP</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#7F1D1D', lineHeight: 1.4 }}>
                O pedido foi registrado localmente no site, mas a API v3 do Bling rejeitou a criação do Pedido de Venda com os detalhes abaixo:
              </p>
              <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 4, padding: '8px 12px', fontSize: '0.76rem', color: '#374151', fontFamily: 'monospace', whiteSpace: 'pre-wrap', width: '100%', boxSizing: 'border-box' }}>
                {JSON.stringify(order.blingError, null, 2)}
              </div>
            </div>
          </div>
        )}
        
        {/* Lado Esquerdo - Detalhes do Pedido & Produtos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Tabela de Produtos Comprados */}
          <div className="admin-table-card" style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <div className="admin-table-header">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Itens do Pedido</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600 }}>Item</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600 }}>SKU</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600 }}>Preço Unitário</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600 }}>Qtd.</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 4, border: '1px solid #e5e5e5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', background: '#f9f9f9'
                        }}>
                          <img
                            src={
                              item.name.toLowerCase().includes('canela') || item.sku.toLowerCase().includes('can')
                                ? '/saco_canela.png'
                                : item.name.toLowerCase().includes('zip') || item.sku.toLowerCase().includes('zip')
                                ? '/saco_zip.png'
                                : item.name.toLowerCase().includes('vácuo') || item.sku.toLowerCase().includes('vac')
                                ? '/saco_vacuo.png'
                                : '/saco_pe.png'
                            }
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-medium)' }}>
                      {item.sku}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600 }}>
                      {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 700, color: 'var(--text-medium)' }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {(item.price * item.qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totais do Pedido */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Pagamento */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Financeiro & Pagamento</h3>
              <p style={{ fontSize: '0.85rem', marginBottom: 8 }}><strong>Método:</strong> {order.paymentMethod}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', fontFamily: 'monospace' }}>{order.paymentDetails}</p>
            </div>

            {/* Resumo Financeiro */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Resumo de Valores</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Subtotal dos itens</span>
                <span>{order.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Frete ({order.carrier})</span>
                <span>{order.shippingCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
                  <span>Desconto aplicado</span>
                  <span>-{order.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4, color: 'var(--text-dark)' }}>
                <span>Total Geral</span>
                <span style={{ color: 'var(--primary)' }}>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </div>

          {/* Histórico / Timeline do Pedido */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Histórico do Pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', paddingLeft: 20 }}>
              {/* Linha vertical */}
              <div style={{ position: 'absolute', top: 8, bottom: 8, left: 6, width: 2, background: 'var(--border)' }} />
              
              {order.timeline.map((event, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Ponto na timeline */}
                  <div style={{
                    position: 'absolute', top: 4, left: -20, width: 10, height: 10, borderRadius: '50%',
                    background: idx === 0 ? 'var(--primary)' : '#cbd5e1',
                    border: idx === 0 ? '4px solid #FFE2D1' : '2px solid #fff',
                    transform: idx === 0 ? 'translate(-3px, -3px)' : 'none'
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: idx === 0 ? 700 : 600, color: idx === 0 ? 'var(--text-dark)' : 'var(--text-medium)' }}>
                        {event.text}
                      </p>
                      {event.desc && <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 2 }}>{event.desc}</p>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Lado Direito - Dados do Cliente & Endereço de Entrega */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Card do Cliente */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Dados do Comprador</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Nome Completo</span>
                <strong>{order.customerName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>E-mail</span>
                <span style={{ color: 'var(--primary)' }}>{order.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Telefone</span>
                <span>{order.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{order.docType}</span>
                <span style={{ fontFamily: 'monospace' }}>{order.doc}</span>
              </div>
              {order.ie && (
                <div>
                  <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Inscrição Estadual</span>
                  <span style={{ fontFamily: 'monospace' }}>{order.ie}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card de Entrega */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Dados de Logística</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Transportadora</span>
                <strong>{order.carrier}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Endereço de Entrega</span>
                <p style={{ margin: 0, lineHeight: 1.4, color: 'var(--text-medium)', fontWeight: 500 }}>{order.address}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)', display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Código de Rastreamento</span>
                {order.trackingCode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', padding: '4px 8px', borderRadius: 4 }}>{order.trackingCode}</span>
                    <button
                      onClick={() => alert(`Rastreando objeto ${order.trackingCode}: Objeto em trânsito.`)}
                      className="btn"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#fff', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      🔍 Rastrear
                    </button>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Etiqueta de postagem não gerada</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
