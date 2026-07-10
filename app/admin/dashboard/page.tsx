'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  customer: string;
  product: string;
  total: number;
  status: 'approved' | 'pending' | 'in_process' | 'rejected';
  date: string;
  category: 'Sacos PE' | 'Zip Lock' | 'Sacos a Vácuo';
}

const MOCK_ORDERS: Order[] = [
  // Pedidos nos últimos 7 dias (02/07 a 08/07/2026)
  { id: '#1042', customer: 'João Silva', product: 'Sacos PE 20x30 x5', total: 149.50, status: 'approved', date: '08/07/2026', category: 'Sacos PE' },
  { id: '#1041', customer: 'Maria Santos', product: 'Zip Lock N05 x3', total: 104.70, status: 'pending', date: '08/07/2026', category: 'Zip Lock' },
  { id: '#1040', customer: 'Carlos Oliveira', product: 'Kit PE Industrial x2', total: 179.80, status: 'approved', date: '07/07/2026', category: 'Sacos PE' },
  { id: '#1039', customer: 'Ana Costa', product: 'Sacos PE 30x40 x8', total: 239.20, status: 'in_process', date: '07/07/2026', category: 'Sacos PE' },
  { id: '#1038', customer: 'Pedro Lima', product: 'Zip Lock Kit Variado', total: 59.90, status: 'approved', date: '06/07/2026', category: 'Zip Lock' },
  
  // Pedidos de 8 a 15 dias atrás (24/06 a 01/07/2026)
  { id: '#1037', customer: 'Juliana Rocha', product: 'Sacos Zip Lock Stand-up', total: 329.90, status: 'approved', date: '01/07/2026', category: 'Zip Lock' },
  { id: '#1036', customer: 'Marcos Souza', product: 'Saco Canela 60x80 x2', total: 90.00, status: 'approved', date: '28/06/2026', category: 'Sacos PE' },
  { id: '#1035', customer: 'Fernanda Lima', product: 'Sacos a Vácuo Gofrados', total: 149.90, status: 'approved', date: '23/06/2026', category: 'Sacos a Vácuo' },
  
  // Pedidos de 16 a 30 dias atrás (09/06 a 23/06/2026)
  { id: '#1034', customer: 'Lucas Alves', product: 'Saco PE Grosso 50x70', total: 199.90, status: 'approved', date: '15/06/2026', category: 'Sacos PE' },
  { id: '#1033', customer: 'Beatriz Gomes', product: 'Bobina Fundo Estrela', total: 599.00, status: 'approved', date: '08/06/2026', category: 'Sacos PE' },
  
  // Pedidos de 31 a 60 dias atrás (10/05 a 08/06/2026)
  { id: '#1032', customer: 'Roberto Dias', product: 'Kit Zip Variado x2', total: 120.00, status: 'approved', date: '25/05/2026', category: 'Zip Lock' },
  { id: '#1031', customer: 'Camila Pires', product: 'Sacos a Vácuo Lisos', total: 450.00, status: 'approved', date: '10/05/2026', category: 'Sacos a Vácuo' },
  
  // Pedidos de 61 a 90 dias atrás (10/04 a 09/05/2026)
  { id: '#1030', customer: 'Diego Santos', product: 'Bobina Picotada PE', total: 310.00, status: 'approved', date: '20/04/2026', category: 'Sacos PE' },
  { id: '#1029', customer: 'Letícia Costa', product: 'Sacos PP Transparente', total: 89.90, status: 'approved', date: '10/04/2026', category: 'Sacos PE' },
];

const statusLabel: Record<string, string> = {
  approved: 'Aprovado',
  pending: 'Pendente',
  in_process: 'Em análise',
  rejected: 'Rejeitado'
};

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const SIMULATION_CURRENT_DATE = new Date(2026, 6, 8); // 08/07/2026

export default function DashboardMercadoLivre() {
  const [period, setPeriod] = useState<7 | 15 | 30 | 60 | 90>(7);
  const [activeTab, setActiveTab] = useState<'resumo' | 'anuncios' | 'vendas' | 'metricas' | 'preferencias'>('resumo');
  
  // Estados para o Filtro Avançado (Drawer Lateral)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterMinVal, setFilterMinVal] = useState<string>('');

  // Metas do mês (Preferências)
  const [salesGoal, setSalesGoal] = useState<number>(35000);
  const [tempSalesGoal, setTempSalesGoal] = useState<string>('35000');
  const [criticalEmail, setCriticalEmail] = useState<string>('estoque@abcmaster.com.br');

  // Estado para recolher/expandir métricas
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

  // Estado para Tooltip de Gráficos
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // Helper para filtrar pedidos em um intervalo de dias relativos com filtros avançados aplicados
  const getFilteredOrdersInInterval = (startDays: number, endDays: number): Order[] => {
    return MOCK_ORDERS.filter(o => {
      const [d, m, y] = o.date.split('/').map(Number);
      const orderDate = new Date(y, m - 1, d);
      const diffTime = SIMULATION_CURRENT_DATE.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const inInterval = diffDays >= startDays && diffDays <= endDays;
      const matchesCategory = filterCategory === 'Todos' || o.category === filterCategory;
      const matchesStatus = filterStatus === 'Todos' || o.status === filterStatus;
      const matchesMinVal = filterMinVal === '' || o.total >= parseFloat(filterMinVal);

      return inInterval && matchesCategory && matchesStatus && matchesMinVal;
    });
  };

  // 1. Dados do Período Atual Filtrado
  const currentOrders = getFilteredOrdersInInterval(0, period);
  const approvedCurrent = currentOrders.filter(o => o.status === 'approved' || o.status === 'in_process');
  
  const salesBrutas = approvedCurrent.reduce((sum, o) => sum + o.total, 0);
  const qtySales = approvedCurrent.length;
  const visits = currentOrders.length * 48 + 143;
  const buyers = Array.from(new Set(approvedCurrent.map(o => o.customer))).length;
  const unitsSold = Math.round(qtySales * 3.2);
  
  const avgUnitPrice = unitsSold > 0 ? salesBrutas / unitsSold : 0;
  const conversao = visits > 0 ? (qtySales / visits) * 100 : 0;
  const avgTicket = qtySales > 0 ? salesBrutas / qtySales : 0;

  // 2. Dados do Período Anterior (Comparação)
  const prevOrders = getFilteredOrdersInInterval(period + 1, 2 * period);
  const approvedPrev = prevOrders.filter(o => o.status === 'approved' || o.status === 'in_process');
  
  const salesBrutasPrev = approvedPrev.reduce((sum, o) => sum + o.total, 0);
  const qtySalesPrev = approvedPrev.length;
  const visitsPrev = prevOrders.length * 48 + 143;
  const buyersPrev = Array.from(new Set(approvedPrev.map(o => o.customer))).length;
  const unitsSoldPrev = Math.round(qtySalesPrev * 3.2);
  
  const avgUnitPricePrev = unitsSoldPrev > 0 ? salesBrutasPrev / unitsSoldPrev : 0;
  const conversaoPrev = visitsPrev > 0 ? (qtySalesPrev / visitsPrev) * 100 : 0;
  const avgTicketPrev = qtySalesPrev > 0 ? salesBrutasPrev / qtySalesPrev : 0;

  // Função de variação
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const trend = (value: number) => {
    if (value > 0) return { text: `▲ ${value.toFixed(1)}%`, type: 'up' };
    if (value < 0) return { text: `▼ ${Math.abs(value).toFixed(1)}%`, type: 'down' };
    return { text: '0%', type: 'flat' };
  };

  // 8 Métricas do Mercado Livre
  const metrics = [
    { title: 'Vendas brutas', value: salesBrutas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), trend: trend(calculateChange(salesBrutas, salesBrutasPrev)) },
    { title: 'Unidades vendidas', value: `${unitsSold} u.`, trend: trend(calculateChange(unitsSold, unitsSoldPrev)) },
    { title: 'Preço médio por unidade', value: avgUnitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), trend: trend(calculateChange(avgUnitPrice, avgUnitPricePrev)) },
    { title: 'Visitas', value: visits.toLocaleString('pt-BR'), trend: trend(calculateChange(visits, visitsPrev)) },
    { title: 'Compradores', value: buyers.toString(), trend: trend(calculateChange(buyers, buyersPrev)) },
    { title: 'Quantidade de vendas', value: qtySales.toString(), trend: trend(calculateChange(qtySales, qtySalesPrev)) },
    { title: 'Conversão', value: `${conversao.toFixed(2)}%`, trend: trend(calculateChange(conversao, conversaoPrev)) },
    { title: 'Preço médio por venda', value: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), trend: trend(calculateChange(avgTicket, avgTicketPrev)) }
  ];

  // Geração real de Download de Relatório (CSV)
  const handleDownloadReport = () => {
    if (currentOrders.length === 0) {
      alert('Nenhum dado encontrado para exportar.');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Pedido,Cliente,Produto Principal,Valor,Status,Data,Categoria\n';

    currentOrders.forEach(o => {
      csvContent += `"${o.id}","${o.customer}","${o.product}",${o.total},"${statusLabel[o.status] || o.status}","${o.date}","${o.category}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-desempenho-${period}-dias.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distribuição de faturamento ao longo do dia para o gráfico
  const timeLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00'];
  const hourlyPercentages = [0.08, 0.12, 0.09, 0.23, 0.17, 0.21, 0.10];
  const hourlyPrevPercentages = [0.07, 0.14, 0.11, 0.19, 0.22, 0.16, 0.11];

  const hourlyData = timeLabels.map((time, idx) => {
    const currVal = salesBrutas * hourlyPercentages[idx];
    const prevVal = salesBrutasPrev * hourlyPrevPercentages[idx];
    return { time, currVal, prevVal };
  });

  // Mapeamento dinâmico de SVG Paths reativos baseados na escala de valores
  const maxVal = Math.max(...hourlyData.map(d => Math.max(d.currVal, d.prevVal))) || 1;
  const getSvgCoordinates = (val: number, xIdx: number) => {
    const x = 50 + xIdx * 150;
    const y = 210 - (val / maxVal) * 160; // limites Y entre 50 e 210
    return { x, y };
  };

  const currPoints = hourlyData.map((d, i) => getSvgCoordinates(d.currVal, i));
  const prevPoints = hourlyData.map((d, i) => getSvgCoordinates(d.prevVal, i));

  const makeBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cpX1 = points[i].x + 50;
      const cpY1 = points[i].y;
      const cpX2 = points[i + 1].x - 50;
      const cpY2 = points[i + 1].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
    }
    return path;
  };

  const currPath = makeBezierPath(currPoints);
  const prevPath = makeBezierPath(prevPoints);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>
      
      {/* Abas Superiores Estilo Mercado Livre */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e6e6e6', padding: '0 24px', display: 'flex', gap: 24 }}>
        {[
          { id: 'resumo', label: 'Resumo de Desempenho' },
          { id: 'anuncios', label: 'Anúncios Vendidos' },
          { id: 'vendas', label: 'Pedidos do Período' },
          { id: 'metricas', label: 'Funil de Métricas' },
          { id: 'preferencias', label: 'Preferências de Painel' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 4px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#3483fa' : '#666',
                borderBottom: isActive ? '3px solid #3483fa' : '3px solid transparent',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto' }}>
        
        {/* Barra de Filtros e Seletores */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Período principal */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>Período principal</label>
              <select
                value={period}
                onChange={e => setPeriod(Number(e.target.value) as any)}
                style={{
                  padding: '8px 36px 8px 12px',
                  fontSize: '0.88rem',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  background: '#fff',
                  outline: 'none',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: '#333'
                }}
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={15}>Últimos 15 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={60}>Últimos 60 dias</option>
                <option value={90}>Últimos 90 dias</option>
              </select>
            </div>

            {/* Comparar com */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.72rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>Comparar com</label>
              <select
                style={{
                  padding: '8px 36px 8px 12px',
                  fontSize: '0.88rem',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  background: '#f9f9f9',
                  outline: 'none',
                  fontWeight: 500,
                  color: '#666'
                }}
                disabled
              >
                <option>Período anterior</option>
              </select>
            </div>

            {/* Filtrar */}
            <button
              onClick={() => setIsFilterOpen(true)}
              style={{
                alignSelf: 'flex-end',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: filterCategory !== 'Todos' || filterStatus !== 'Todos' || filterMinVal !== '' ? '#E6F0FD' : '#fff',
                border: filterCategory !== 'Todos' || filterStatus !== 'Todos' || filterMinVal !== '' ? '1px solid #3483fa' : '1px solid #ccc',
                borderRadius: 4,
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: filterCategory !== 'Todos' || filterStatus !== 'Todos' || filterMinVal !== '' ? '#3483fa' : '#333',
                cursor: 'pointer',
                height: 36
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>
              Filtrar {filterCategory !== 'Todos' || filterStatus !== 'Todos' ? '•' : ''}
            </button>
          </div>

          {/* Baixar relatório */}
          <button style={{
            background: 'rgba(52, 131, 250, 0.15)',
            border: 'none',
            color: '#3483fa',
            borderRadius: 4,
            padding: '10px 20px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(52, 131, 250, 0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(52, 131, 250, 0.15)'}
            onClick={handleDownloadReport}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Baixar relatório
          </button>

        </div>

        {/* ----------------- ABA 1: RESUMO DE DESEMPENHO ----------------- */}
        {activeTab === 'resumo' && (
          <>
            {/* Metas Atuais (Alinhadas com Preferências) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 18, border: '1px solid #e6e6e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Progresso da Meta Mensal</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', color: '#333' }}>
                    {salesBrutas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>de {salesGoal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </h3>
                </div>
                <div style={{ width: 80, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${Math.min(100, (salesBrutas / salesGoal) * 100)}%`, height: '100%', background: '#3483fa' }} />
                </div>
              </div>
              
              <div style={{ background: '#FFFDF0', borderRadius: 8, padding: 18, border: '1px solid #FFEAA7', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>💡</span>
                <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.4, margin: 0 }}>
                  <strong>Filtros Ativos:</strong> Categoria: <strong>{filterCategory}</strong> | Status: <strong>{filterStatus === 'Todos' ? 'Todos' : statusLabel[filterStatus] || filterStatus}</strong>. Exibindo {currentOrders.length} pedido(s) no período de {period} dias.
                </p>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: 20 }}>Resumo de desempenho</h2>
              
              {/* Grid de 8 Métricas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 12,
                marginBottom: 20
              }}>
                {metrics.slice(0, isMetricsExpanded ? 8 : 4).map((metric, idx) => {
                  const isFirst = idx === 0;
                  const isUp = metric.trend.type === 'up';
                  const isDown = metric.trend.type === 'down';

                  return (
                    <div
                      key={metric.title}
                      style={{
                        background: '#fff',
                        border: '1px solid #e6e6e6',
                        borderRadius: 6,
                        padding: '16px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 110,
                        position: 'relative',
                        borderTop: isFirst ? '3px solid #E5127F' : '1px solid #e6e6e6',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666' }}>{metric.title}</span>
                        <span style={{ fontSize: '0.78rem', color: '#c0c0c0', cursor: 'pointer' }} onClick={() => alert(`Métrica: ${metric.title}. Variação em relação ao período correspondente anterior.`)}>❓</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
                        <strong style={{ fontSize: '1.4rem', fontWeight: 700, color: '#333' }}>{metric.value}</strong>
                        
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isUp ? '#00A650' : isDown ? '#F23D4F' : '#999',
                            background: isUp ? '#E6F6EC' : isDown ? '#FEECEE' : '#f1f1f1',
                            padding: '3px 8px',
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          {metric.trend.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão de Expandir/Recolher */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                  style={{
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    padding: '6px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#3483fa',
                    cursor: 'pointer'
                  }}
                >
                  {isMetricsExpanded ? 'Ver menos ▴' : 'Ver mais ▾'}
                </button>
              </div>

            </div>

            {/* Gráfico de Linhas Dinâmico em SVG com Tooltip */}
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 24, marginBottom: 24, position: 'relative' }}>
              
              <div style={{ position: 'relative', width: '100%', height: 320 }}>
                {/* Grid Lines Horizontais */}
                <div style={{ position: 'absolute', top: 50, left: 50, right: 20, height: 1, borderTop: '1px dashed #e2e8f0' }} />
                <div style={{ position: 'absolute', top: 125, left: 50, right: 20, height: 1, borderTop: '1px dashed #e2e8f0' }} />
                <div style={{ position: 'absolute', top: 200, left: 50, right: 20, height: 1, borderTop: '1px dashed #e2e8f0' }} />
                
                {/* Linha vertical de hover */}
                {hoveredPointIdx !== null && (
                  <div style={{
                    position: 'absolute',
                    left: `${50 + hoveredPointIdx * 150}px`,
                    top: 50,
                    bottom: 40,
                    width: 1,
                    borderLeft: '1px dotted #E5127F',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }} />
                )}

                <svg
                  viewBox="0 0 1000 250"
                  style={{ width: '100%', height: 260, position: 'absolute', left: 0, top: 0 }}
                  preserveAspectRatio="none"
                >
                  {/* Curva Cinza - Período Anterior */}
                  <path
                    d={prevPath}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Curva Rosa - Vendas Brutas Atual */}
                  <path
                    d={currPath}
                    fill="none"
                    stroke="#E5127F"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Círculos dos Pontos de Dados */}
                  {currPoints.map((pt, idx) => (
                    <circle
                      key={`curr-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIdx === idx ? 7 : 4}
                      fill="#E5127F"
                      stroke="#fff"
                      strokeWidth={hoveredPointIdx === idx ? 3 : 1.5}
                      style={{ cursor: 'pointer', transition: 'r 0.1s, strokeWidth 0.1s' }}
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />
                  ))}
                  {prevPoints.map((pt, idx) => (
                    <circle
                      key={`prev-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIdx === idx ? 6 : 3}
                      fill="#94a3b8"
                      stroke="#fff"
                      strokeWidth={hoveredPointIdx === idx ? 2 : 1}
                      style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />
                  ))}

                  {/* Zonas Invisíveis Grandes para Facilitar o Hover das Colunas */}
                  {currPoints.map((pt, idx) => (
                    <rect
                      key={`zone-${idx}`}
                      x={pt.x - 40}
                      y={0}
                      width={80}
                      height={250}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />
                  ))}

                </svg>

                {/* Marcadores Eixo Y */}
                <div style={{ position: 'absolute', left: 10, top: 42, fontSize: '0.7rem', color: '#999', fontFamily: 'monospace' }}>
                  {formatCurrency(maxVal)}
                </div>
                <div style={{ position: 'absolute', left: 10, top: 117, fontSize: '0.7rem', color: '#999', fontFamily: 'monospace' }}>
                  {formatCurrency(maxVal / 2)}
                </div>
                <div style={{ position: 'absolute', left: 10, top: 192, fontSize: '0.7rem', color: '#999', fontFamily: 'monospace' }}>
                  R$ 0,00
                </div>

                {/* Marcadores Eixo X */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 50, paddingRight: 50, paddingTop: 265, fontSize: '0.72rem', color: '#888', fontWeight: 500 }}>
                  {timeLabels.map(t => <span key={t}>{t}</span>)}
                </div>

                {/* Tooltip Flutuante Reativo */}
                {hoveredPointIdx !== null && (
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min(800, 50 + hoveredPointIdx * 150 + 15)}px`,
                    top: '60px',
                    background: 'rgba(33, 37, 41, 0.95)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '0.75rem',
                    zIndex: 10,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <strong style={{ borderBottom: '1px solid #444', paddingBottom: 4, display: 'block', color: '#ddd' }}>
                      Faturamento estimado às {hourlyData[hoveredPointIdx].time}
                    </strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                      <span style={{ color: '#F472B6' }}>Periodo Atual:</span>
                      <strong>{formatCurrency(hourlyData[hoveredPointIdx].currVal)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                      <span style={{ color: '#cbd5e1' }}>Período Anterior:</span>
                      <strong style={{ color: '#bbb' }}>{formatCurrency(hourlyData[hoveredPointIdx].prevVal)}</strong>
                    </div>
                    {hourlyData[hoveredPointIdx].prevVal > 0 && (
                      <div style={{
                        marginTop: 2,
                        fontSize: '0.7rem',
                        color: hourlyData[hoveredPointIdx].currVal >= hourlyData[hoveredPointIdx].prevVal ? '#4ADE80' : '#F87171'
                      }}>
                        Diferença: {hourlyData[hoveredPointIdx].currVal >= hourlyData[hoveredPointIdx].prevVal ? '▲' : '▼'}{' '}
                        {calculateChange(hourlyData[hoveredPointIdx].currVal, hourlyData[hoveredPointIdx].prevVal).toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Legenda do Gráfico */}
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28, fontSize: '0.78rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5127F', display: 'inline-block' }} />
                  <span style={{ color: '#E5127F' }}>Vendas brutas (Período Atual)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#b0b0b0', display: 'inline-block' }} />
                  <span style={{ color: '#777' }}>Período anterior</span>
                </div>
              </div>

            </div>

            {/* Últimos Pedidos e Ações Rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              
              {/* Tabela de Pedidos Recentes */}
              <div className="admin-table-card" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', boxShadow: 'none', margin: 0 }}>
                <div className="admin-table-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Últimos Pedidos no Período</h3>
                  <Link href="/admin/pedidos" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#3483fa', borderColor: '#3483fa' }}>
                    Ver Todos
                  </Link>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Pedido</th>
                      <th style={{ textAlign: 'left', color: '#666', fontWeight: 600 }}>Cliente</th>
                      <th style={{ textAlign: 'left', color: '#666', fontWeight: 600 }}>Total</th>
                      <th style={{ textAlign: 'left', color: '#666', fontWeight: 600 }}>Status</th>
                      <th style={{ textAlign: 'left', color: '#666', fontWeight: 600 }}>Data</th>
                      <th style={{ textAlign: 'right', paddingRight: 20, color: '#666', fontWeight: 600 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#999', fontSize: '0.82rem' }}>
                          Nenhum pedido faturado correspondente neste período.
                        </td>
                      </tr>
                    ) : (
                      currentOrders.slice(0, 5).map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '14px 20px' }}><strong>{order.id}</strong></td>
                          <td>{order.customer}</td>
                          <td><strong>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
                          <td><span className={`status-pill ${order.status}`}>{statusLabel[order.status]}</span></td>
                          <td style={{ color: '#888' }}>{order.date}</td>
                          <td style={{ textAlign: 'right', paddingRight: 20 }}>
                            <Link href={`/admin/pedidos/${order.id.replace('#', '')}`} style={{ color: '#3483fa', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                              Ver Detalhes →
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards de Ações Rápidas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 20 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#333', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Ações Rápidas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link href="/admin/anuncios/novo" style={{ background: '#3483fa', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                      ➕ Criar Novo Anúncio
                    </Link>
                    <Link href="/admin/pedidos" style={{ background: '#f5f5f5', color: '#333', textAlign: 'center', padding: '10px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', border: '1px solid #ccc' }}>
                      📋 Gerenciar Pedidos
                    </Link>
                    <Link href="/admin/config" style={{ background: '#f5f5f5', color: '#333', textAlign: 'center', padding: '10px', borderRadius: 4, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', border: '1px solid #ccc' }}>
                      ⚙️ Configurações do ERP
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* ----------------- ABA 2: ANÚNCIOS VENDIDOS ----------------- */}
        {activeTab === 'anuncios' && (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 24 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#333', marginBottom: 16 }}>Desempenho por Produto</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e6e6e6', textAlign: 'left' }}>
                  <th style={{ padding: '12px 20px', color: '#666' }}>Produto</th>
                  <th style={{ color: '#666' }}>Categoria</th>
                  <th style={{ color: '#666', textAlign: 'center' }}>Unidades Vendidas (Sim.)</th>
                  <th style={{ color: '#666', textAlign: 'right' }}>Receita Estimada</th>
                  <th style={{ color: '#666', textAlign: 'right', paddingRight: 20 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sacos Plásticos PE (Polietileno)', cat: 'Sacos PE', qty: Math.round(qtySales * 2.1), rev: salesBrutas * 0.45 },
                  { name: 'Sacos Plásticos Zip Lock', cat: 'Zip Lock', qty: Math.round(qtySales * 1.2), rev: salesBrutas * 0.35 },
                  { name: 'Sacos a Vácuo Termoencolhível', cat: 'Sacos a Vácuo', qty: Math.round(qtySales * 0.8), rev: salesBrutas * 0.20 },
                ].map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{item.name}</td>
                    <td>{item.cat}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#555' }}>{item.qty} u.</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.rev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <Link href="/admin/anuncios" style={{ color: '#3483fa', textDecoration: 'none', fontWeight: 600 }}>
                        Gerenciar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ----------------- ABA 3: PEDIDOS DO PERÍODO ----------------- */}
        {activeTab === 'vendas' && (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#333', margin: 0 }}>Pedidos no Intervalo ({period} dias)</h2>
              <span style={{ fontSize: '0.8rem', color: '#666', background: '#f0f0f0', padding: '4px 10px', borderRadius: 20 }}>
                Total faturado: <strong>{salesBrutas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #e6e6e6', textAlign: 'left' }}>
                  <th style={{ padding: '12px 20px', color: '#666' }}>ID</th>
                  <th style={{ color: '#666' }}>Cliente</th>
                  <th style={{ color: '#666' }}>Produto Principal</th>
                  <th style={{ color: '#666', textAlign: 'right' }}>Total</th>
                  <th style={{ color: '#666', textAlign: 'center' }}>Status</th>
                  <th style={{ color: '#666' }}>Data</th>
                  <th style={{ color: '#666', textAlign: 'right', paddingRight: 20 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 20px' }}><strong>{order.id}</strong></td>
                    <td>{order.customer}</td>
                    <td>{order.product}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-pill ${order.status}`}>{statusLabel[order.status]}</span>
                    </td>
                    <td style={{ color: '#666' }}>{order.date}</td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <Link href={`/admin/pedidos/${order.id.replace('#', '')}`} style={{ color: '#3483fa', textDecoration: 'none', fontWeight: 600 }}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ----------------- ABA 4: FUNIL DE MÉTRICAS ----------------- */}
        {activeTab === 'metricas' && (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 28 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#333', marginBottom: 20 }}>Funil de Vendas & Conversão</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 650, margin: '0 auto' }}>
              {[
                { stage: 'Acessos / Visitas', val: visits, pct: 100, color: '#3b82f6', desc: 'Sessões totais de usuários no e-commerce' },
                { stage: 'Carrinho Iniciado', val: Math.round(visits * 0.42), pct: 42, color: '#60a5fa', desc: 'Usuários que colocaram itens no carrinho' },
                { stage: 'Checkout Iniciado', val: Math.round(visits * 0.18), pct: 18, color: '#93c5fd', desc: 'Preenchimento de dados de entrega e pagamento' },
                { stage: 'Pedidos Faturados', val: qtySales, pct: Number(conversao.toFixed(2)), color: '#E5127F', desc: 'Transações de vendas pagas e confirmadas' }
              ].map((funnel, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 140, fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>{funnel.stage}</div>
                  <div style={{ flex: 1, background: '#f1f5f9', height: 44, borderRadius: 6, overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                    <div style={{
                      width: `${funnel.pct}%`,
                      background: funnel.color,
                      height: '100%',
                      transition: 'width 0.4s ease-out'
                    }} />
                    <span style={{
                      position: 'absolute',
                      right: 12,
                      top: 13,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: funnel.pct > 70 ? '#fff' : '#333'
                    }}>
                      {funnel.val.toLocaleString('pt-BR')} ({funnel.pct}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 32, fontSize: '0.82rem', color: '#666', borderTop: '1px solid #eee', paddingTop: 20 }}>
              <p>Métricas consolidadas estimadas com base no tráfego orgânico do mix de embalagens da loja.</p>
            </div>
          </div>
        )}

        {/* ----------------- ABA 5: PREFERÊNCIAS ----------------- */}
        {activeTab === 'preferencias' && (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e6e6e6', padding: 24, maxWidth: 650, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#333', marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>Configurações do Dashboard</h2>
            
            <form onSubmit={e => {
              e.preventDefault();
              const val = parseFloat(tempSalesGoal);
              if (!isNaN(val) && val > 0) {
                setSalesGoal(val);
                alert('Configurações salvas com sucesso!');
              } else {
                alert('Por favor, insira um valor válido de faturamento.');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: 8 }}>Meta de Faturamento Mensal (R$)</label>
                <input
                  type="number"
                  value={tempSalesGoal}
                  onChange={e => setTempSalesGoal(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.88rem', outline: 'none' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#777', marginTop: 4, display: 'block' }}>A meta é mostrada como indicador de progresso no faturamento do dashboard resumo.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: 8 }}>E-mail para Alertas de Estoque Crítico</label>
                <input
                  type="email"
                  value={criticalEmail}
                  onChange={e => setCriticalEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.88rem', outline: 'none' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#3483fa',
                  border: 'none',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 4,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#2b6cb0'}
                onMouseLeave={e => e.currentTarget.style.background = '#3483fa'}
              >
                Salvar Configurações
              </button>

            </form>
          </div>
        )}

      </div>

      {/* ----------------- DRAWER LATERAL DE FILTRO ----------------- */}
      {isFilterOpen && (
        <>
          {/* Overlay de fundo */}
          <div
            onClick={() => setIsFilterOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 998,
              transition: 'opacity 0.2s'
            }}
          />

          {/* Painel lateral */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 320,
              background: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              zIndex: 999,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#333', fontWeight: 700 }}>Filtros de Desempenho</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#888' }}
                >
                  ✕
                </button>
              </div>

              {/* Filtro de Categoria */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>Categoria do Produto</label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="Todos">Todas as categorias</option>
                  <option value="Sacos PE">Sacos PE</option>
                  <option value="Zip Lock">Zip Lock</option>
                  <option value="Sacos a Vácuo">Sacos a Vácuo</option>
                </select>
              </div>

              {/* Filtro de Status */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>Status do Pedido</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="Todos">Todos os status</option>
                  <option value="approved">Aprovados</option>
                  <option value="pending">Pendentes</option>
                  <option value="in_process">Em análise</option>
                </select>
              </div>

              {/* Valor Mínimo do Pedido */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>Valor Mínimo do Pedido (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={filterMinVal}
                  onChange={e => setFilterMinVal(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setFilterCategory('Todos');
                  setFilterStatus('Todos');
                  setFilterMinVal('');
                  setIsFilterOpen(false);
                }}
                style={{
                  flex: 1,
                  background: '#f5f5f5',
                  border: '1px solid #ccc',
                  color: '#555',
                  padding: '10px',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Limpar
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                style={{
                  flex: 1,
                  background: '#3483fa',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Aplicar
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
