'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  category: 'Sacos PE' | 'Zip Lock' | 'Sacos a Vácuo';
}

interface Order {
  id: string;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  shipping: number;
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'shipped' | 'delivered';
  date: string;
  nfe: boolean;
  label: boolean;
  paymentMethod: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1042',
    customer: 'João Silva',
    email: 'joao@email.com',
    items: [
      { name: 'Sacos PE 20x30cm', qty: 5, price: 29.90, category: 'Sacos PE' }
    ],
    total: 149.50,
    shipping: 18.90,
    status: 'shipped',
    date: '08/07/2026 às 16:30',
    nfe: true,
    label: true,
    paymentMethod: 'PIX'
  },
  {
    id: '1041',
    customer: 'Maria Santos',
    email: 'maria@email.com',
    items: [
      { name: 'Zip Lock N05 10x14cm (100un)', qty: 3, price: 34.90, category: 'Zip Lock' }
    ],
    total: 104.70,
    shipping: 14.20,
    status: 'pending',
    date: '08/07/2026 às 11:15',
    nfe: false,
    label: false,
    paymentMethod: 'PIX'
  },
  {
    id: '1040',
    customer: 'Carlos Oliveira',
    email: 'carlos@email.com',
    items: [
      { name: 'Saco PE Industrial 50x70cm', qty: 2, price: 53.91, category: 'Sacos PE' },
      { name: 'Saco Zip Lock N07 13x18cm', qty: 1, price: 46.80, category: 'Zip Lock' }
    ],
    total: 179.80,
    shipping: 34.50,
    status: 'approved',
    date: '07/07/2026 às 09:20',
    nfe: true,
    label: false,
    paymentMethod: 'Boleto Bancário'
  },
  {
    id: '1039',
    customer: 'Ana Costa',
    email: 'ana@email.com',
    items: [
      { name: 'Sacos PE 30x40cm (Grosso)', qty: 8, price: 29.90, category: 'Sacos PE' }
    ],
    total: 239.20,
    shipping: 18.90,
    status: 'in_process',
    date: '07/07/2026 às 15:45',
    nfe: false,
    label: false,
    paymentMethod: 'Cartão de Crédito'
  },
  {
    id: '1038',
    customer: 'Pedro Lima',
    email: 'pedro@email.com',
    items: [
      { name: 'Zip Lock Kit Variado', qty: 1, price: 45.70, category: 'Zip Lock' },
      { name: 'Sacos a Vácuo 20x30cm', qty: 2, price: 7.10, category: 'Sacos a Vácuo' }
    ],
    total: 59.90,
    shipping: 14.20,
    status: 'delivered',
    date: '06/07/2026 às 15:30',
    nfe: true,
    label: true,
    paymentMethod: 'Cartão de Crédito'
  },
  {
    id: '1037',
    customer: 'Marcos Souza',
    email: 'marcos@email.com',
    items: [
      { name: 'Sacos a Vácuo 15x20cm', qty: 10, price: 12.90, category: 'Sacos a Vácuo' }
    ],
    total: 129.00,
    shipping: 15.00,
    status: 'shipped',
    date: '05/07/2026 às 14:10',
    nfe: true,
    label: true,
    paymentMethod: 'Boleto Bancário'
  },
  {
    id: '1036',
    customer: 'Clínica Sorriso',
    email: 'sorriso@email.com',
    items: [
      { name: 'Saco Zip Lock N10 24x34cm', qty: 2, price: 49.90, category: 'Zip Lock' }
    ],
    total: 99.80,
    shipping: 12.00,
    status: 'delivered',
    date: '04/07/2026 às 10:00',
    nfe: true,
    label: true,
    paymentMethod: 'PIX'
  }
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const statusLabel: Record<string, string> = {
  approved: 'Aprovado (Aguardando Envio)',
  pending: 'Aguardando Pagamento',
  in_process: 'Em análise',
  rejected: 'Rejeitado',
  shipped: 'Enviado',
  delivered: 'Finalizado'
};

const statusBorderColors: Record<string, string> = {
  approved: '#3b82f6', // Azul (preparando)
  pending: '#F1A01F',  // Laranja (pendente)
  in_process: '#8B5CF6', // Roxo (análise)
  rejected: '#F23D4F',  // Vermelho
  shipped: '#0ea5e9', // Ciano (em trânsito)
  delivered: '#00A650' // Verde (entregue)
};

const getProductImageUrl = (name: string, category: string) => {
  if (name.toLowerCase().includes('canela')) return '/saco_canela.png';
  if (category === 'Sacos PE') return '/saco_pe.png';
  if (category === 'Zip Lock') return '/saco_zip.png';
  if (category === 'Sacos a Vácuo') return '/saco_vacuo.png';
  return '/saco_pe.png';
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('Aprovados');
  const [searchQuery, setSearchQuery] = useState('');

  // Carregar do localStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem('abc_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        const hasRichStructure = parsed.some((o: any) => o.items && o.total !== undefined);
        if (hasRichStructure) {
          const validOrders = parsed.filter((o: any) => o.items && o.total !== undefined);
          const merged = [...validOrders];
          MOCK_ORDERS.forEach(mo => {
            if (!merged.some(o => o.id === mo.id)) {
              merged.push(mo);
            }
          });
          merged.sort((a, b) => Number(b.id) - Number(a.id));
          setOrders(merged);
          return;
        }
      }
      localStorage.setItem('abc_orders', JSON.stringify(MOCK_ORDERS));
      setOrders(MOCK_ORDERS);
    } catch (e) {
      console.error(e);
      setOrders(MOCK_ORDERS);
    }
  }, []);

  // Salvar no localStorage sempre que as ordens mudarem
  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem('abc_orders', JSON.stringify(orders));
      } catch (e) {
        console.error(e);
      }
    }
  }, [orders]);

  // Simular Emissão de NF-e
  const handleEmitNfeTable = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, nfe: true } : o));
    alert(`Nota Fiscal emitida com sucesso para o Pedido #${id}!`);
  };

  // Simular Geração de Etiqueta
  const handleGenerateLabelTable = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, label: true, status: 'shipped' } : o));
    alert(`Etiqueta de postagem gerada! O Pedido #${id} foi movido para o grupo 'Enviados'.`);
  };

  // Filtragem dos Pedidos
  const filteredOrders = orders.filter(o => {
    const matchesStatus =
      statusFilter === 'Todos os status' ||
      (statusFilter === 'Aguardando Pagamento' && (o.status === 'pending' || o.status === 'in_process')) ||
      (statusFilter === 'Aprovados' && o.status === 'approved') ||
      (statusFilter === 'Enviados' && o.status === 'shipped') ||
      (statusFilter === 'Finalizados' && (o.status === 'delivered' || o.status === 'rejected')) ||
      (statusFilter === 'Pendentes' && o.status === 'pending') ||
      (statusFilter === 'Em análise' && o.status === 'in_process');

    const matchesSearch =
      o.id.includes(searchQuery) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Dividir pedidos por estágios de atendimento
  const pendingOrAnalysisOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'in_process');
  const approvedOrders = filteredOrders.filter(o => o.status === 'approved');
  const shippedOrders = filteredOrders.filter(o => o.status === 'shipped');
  const finalizedOrders = filteredOrders.filter(o => o.status === 'delivered' || o.status === 'rejected');

  const renderOrderCard = (order: Order) => {
    const accentColor = statusBorderColors[order.status] || '#ccc';
    const subtotal = order.items.reduce((sum, o) => sum + (o.price * o.qty), 0);
    const totalPayable = subtotal + order.shipping;
    return (
      <div
        key={order.id}
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          borderLeft: `5px solid ${accentColor}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          overflow: 'hidden',
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        {/* Cabeçalho do Cartão */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>Pedido #{order.id}</strong>
            <span style={{ height: 14, width: 1, background: '#cbd5e1' }} />
            <span className={`status-pill ${order.status}`} style={{ margin: 0, fontWeight: 700 }}>
              {statusLabel[order.status]}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500 }}>
              Realizado em: <strong>{order.date}</strong>
            </span>
          </div>
        </div>

        {/* Corpo do Cartão - Grid */}
        <div style={{
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1fr 1fr',
          gap: 20,
          alignItems: 'center'
        }}>
          {/* Coluna 1: Cliente */}
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>Cliente</span>
            <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{order.customer}</strong>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden' }}>{order.email}</p>
          </div>

          {/* Coluna 2: Itens Comprados */}
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 8 }}>Itens do Pedido</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 4, border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', background: '#f8fafc'
                  }}>
                    <img
                      src={getProductImageUrl(item.name, item.category)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', lineHeight: 1.2 }}>
                      {item.name}
                    </span>
                    <span style={{
                      color: '#FF6B00', background: '#FFF0E6', padding: '2px 6px',
                      borderRadius: 4, fontWeight: 800, fontSize: '0.7rem', display: 'inline-block'
                    }}>
                      x{item.qty}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                      ({formatCurrency(item.price)}/un)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Finanças */}
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 4 }}>Total Geral</span>
            <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>{formatCurrency(totalPayable)}</strong>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span>Itens: {formatCurrency(subtotal)}</span>
              <span>Frete: +{formatCurrency(order.shipping)}</span>
              <span style={{ marginTop: 4, color: '#475569', fontWeight: 600, fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, alignSelf: 'flex-start', display: 'inline-block' }}>
                💳 {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Coluna 4: NF-e */}
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 6 }}>Faturamento (NF-e)</span>
            {order.nfe ? (
              <span style={{ color: '#00A650', fontWeight: 600, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                ✓ Emitida
              </span>
            ) : order.status === 'approved' ? (
              <button
                onClick={() => handleEmitNfeTable(order.id)}
                className="action-btn"
                style={{ background: 'rgba(255,107,0,0.08)', color: 'var(--primary)', border: '1px solid rgba(255,107,0,0.2)', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Emitir NF-e
              </button>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
            )}
          </div>

          {/* Coluna 5: Etiqueta */}
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: 6 }}>Envio (Etiqueta)</span>
            {order.label ? (
              <button
                onClick={() => alert('Fazendo download do PDF da etiqueta...')}
                className="action-btn"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                📄 Baixar PDF
              </button>
            ) : order.status === 'approved' ? (
              <button
                onClick={() => handleGenerateLabelTable(order.id)}
                className="action-btn"
                style={{ background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Gerar
              </button>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
            )}
          </div>

          {/* Coluna 6: Ações */}
          <div style={{ textAlign: 'right' }}>
            <Link
              href={`/admin/pedidos/${order.id}`}
              className="action-btn"
              style={{
                background: '#3483fa',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 4,
                display: 'inline-block',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                textAlign: 'center',
                boxShadow: '0 1px 2px rgba(52,131,250,0.2)'
              }}
            >
              Ver Detalhes
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Pedidos</h1>
      </div>

      <div className="admin-content">
        {/* Stats rápidas (Filtros interativos) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { filter: 'Aguardando Pagamento', label: 'Aguardando Pgto', value: orders.filter(o => o.status === 'pending' || o.status === 'in_process').length, color: '#F1A01F' },
            { filter: 'Aprovados', label: 'A Preparar (Pago)', value: orders.filter(o => o.status === 'approved').length, color: '#3b82f6' },
            { filter: 'Enviados', label: 'Enviados', value: orders.filter(o => o.status === 'shipped').length, color: '#0ea5e9' },
            { filter: 'Finalizados', label: 'Finalizados', value: orders.filter(o => o.status === 'delivered' || o.status === 'rejected').length, color: 'var(--success)' },
          ].map(s => {
            const isSelected = statusFilter === s.filter;
            return (
              <button
                key={s.label}
                onClick={() => setStatusFilter(isSelected ? 'Todos os status' : s.filter)}
                style={{
                  background: '#fff',
                  border: isSelected ? '2px solid #FF6B00' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                  display: 'block',
                  width: '100%',
                  outline: 'none'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = '#FF6B00';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
              >
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-medium)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.label} {isSelected && <span style={{ color: '#FF6B00', fontWeight: 'bold' }}>● Ativo</span>}
                </p>
              </button>
            );
          })}
        </div>

        {/* Barra de Pesquisa */}
        <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#333' }}>Filtro de Busca</h3>
          <div className="admin-search" style={{ margin: 0, width: 320 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              placeholder="Buscar por ID, cliente ou produto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Fluxo Separado de Atendimento */}
        {filteredOrders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: '48px 0', textAlign: 'center', color: '#999', fontSize: '0.88rem' }}>
            Nenhum pedido correspondente encontrado com os filtros ativos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* GRUPO 1:🕒 Aguardando Pagamento / Em Análise */}
            {(statusFilter === 'Todos os status' || statusFilter === 'Aguardando Pagamento') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 18, background: '#F1A01F', borderRadius: 2 }} />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    🕒 Aguardando Pagamento / Em Análise ({pendingOrAnalysisOrders.length})
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pendingOrAnalysisOrders.length === 0 ? (
                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: '#f8fafc' }}>
                      Nenhum pedido aguardando pagamento ou em análise.
                    </div>
                  ) : (
                    pendingOrAnalysisOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            )}

            {/* GRUPO 2:📦 A Preparar (Apenas Aprovados) */}
            {(statusFilter === 'Todos os status' || statusFilter === 'Aprovados') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 18, background: '#3b82f6', borderRadius: 2 }} />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    📦 Prontos para Preparação / Pago ({approvedOrders.length})
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {approvedOrders.length === 0 ? (
                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: '#f8fafc' }}>
                      Nenhum pedido pago e pronto para preparação.
                    </div>
                  ) : (
                    approvedOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            )}

            {/* GRUPO 3:🚚 Enviados / Em Trânsito */}
            {(statusFilter === 'Todos os status' || statusFilter === 'Enviados') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 18, background: '#0ea5e9', borderRadius: 2 }} />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    🚚 Enviados / Em Trânsito ({shippedOrders.length})
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {shippedOrders.length === 0 ? (
                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: '#f8fafc' }}>
                      Nenhum pedido enviado em trânsito no momento.
                    </div>
                  ) : (
                    shippedOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            )}

            {/* GRUPO 4:✅ Finalizados / Concluídos */}
            {(statusFilter === 'Todos os status' || statusFilter === 'Finalizados') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 18, background: '#00A650', borderRadius: 2 }} />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    ✅ Finalizados / Concluídos ({finalizedOrders.length})
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {finalizedOrders.length === 0 ? (
                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', background: '#f8fafc' }}>
                      Nenhum pedido finalizado na base de dados.
                    </div>
                  ) : (
                    finalizedOrders.map(renderOrderCard)
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}
