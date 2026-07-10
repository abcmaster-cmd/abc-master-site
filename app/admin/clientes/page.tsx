'use client';

import { useState } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  type: 'CPF' | 'CNPJ';
  doc: string;
  city: string;
  state: string;
  purchasesCount: number;
  totalSpent: number;
  lastPurchaseDate: string;
  daysSinceLastPurchase: number;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    type: 'CPF',
    doc: '123.456.789-00',
    city: 'São Paulo',
    state: 'SP',
    purchasesCount: 5,
    totalSpent: 842.00,
    lastPurchaseDate: '08/07/2026',
    daysSinceLastPurchase: 1
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    type: 'CPF',
    doc: '987.654.321-11',
    city: 'São Bernardo do Campo',
    state: 'SP',
    purchasesCount: 3,
    totalSpent: 412.50,
    lastPurchaseDate: '08/07/2026',
    daysSinceLastPurchase: 1
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    type: 'CNPJ',
    doc: '12.345.678/0001-99',
    city: 'Diadema',
    state: 'SP',
    purchasesCount: 4,
    totalSpent: 739.20,
    lastPurchaseDate: '07/07/2026',
    daysSinceLastPurchase: 2
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@email.com',
    type: 'CPF',
    doc: '456.789.123-22',
    city: 'Guarulhos',
    state: 'SP',
    purchasesCount: 1,
    totalSpent: 239.20,
    lastPurchaseDate: '07/07/2026',
    daysSinceLastPurchase: 2
  },
  {
    id: '5',
    name: 'Pedro Lima',
    email: 'pedro@email.com',
    type: 'CPF',
    doc: '321.654.987-33',
    city: 'Santo André',
    state: 'SP',
    purchasesCount: 2,
    totalSpent: 120.40,
    lastPurchaseDate: '06/07/2026',
    daysSinceLastPurchase: 3
  },
  {
    id: '6',
    name: 'Distribuidora ABC Embalagens',
    email: 'comercial@abcembalagens.com.br',
    type: 'CNPJ',
    doc: '99.888.777/0001-66',
    city: 'Campinas',
    state: 'SP',
    purchasesCount: 6,
    totalSpent: 2450.00,
    lastPurchaseDate: '30/06/2026',
    daysSinceLastPurchase: 9
  },
  {
    id: '7',
    name: 'Lojas do Sul Ltda',
    email: 'financeiro@lojassul.com.br',
    type: 'CNPJ',
    doc: '88.777.666/0001-55',
    city: 'Porto Alegre',
    state: 'RS',
    purchasesCount: 1,
    totalSpent: 89.90,
    lastPurchaseDate: '10/04/2026',
    daysSinceLastPurchase: 90
  },
  {
    id: '8',
    name: 'Supermercado Central',
    email: 'compras@supercentral.com.br',
    type: 'CNPJ',
    doc: '77.666.555/0001-44',
    city: 'Curitiba',
    state: 'PR',
    purchasesCount: 2,
    totalSpent: 310.00,
    lastPurchaseDate: '15/03/2026',
    daysSinceLastPurchase: 116
  }
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState('Todos');

  // Obter classificação de cliente
  const getClientClassification = (client: Client) => {
    if (client.daysSinceLastPurchase >= 60) {
      return { label: 'Inativo / Churn', color: '#EF4444', bg: '#FEE2E2', priority: 4 };
    }
    if (client.purchasesCount >= 4) {
      return { label: 'VIP / Recorrente', color: '#10B981', bg: '#D1FAE5', priority: 1 };
    }
    if (client.purchasesCount >= 2) {
      return { label: 'Frequente', color: '#3B82F6', bg: '#DBEAFE', priority: 2 };
    }
    return { label: 'Esporádico / Novo', color: '#6B7280', bg: '#F3F4F6', priority: 3 };
  };

  // Sugerir ação de negócio
  const getActionRecommendation = (classificationLabel: string) => {
    if (classificationLabel.includes('Inativo')) {
      return { text: 'Disparar Cupom de Reativação (VOLTEJA15)', color: '#EF4444', bg: '#FEE2E2', action: 'reativar' };
    }
    if (classificationLabel.includes('VIP')) {
      return { text: 'Oferecer Frete Grátis B2B e Atendimento VIP', color: '#10B981', bg: '#D1FAE5', action: 'vip' };
    }
    if (classificationLabel.includes('Frequente')) {
      return { text: 'Propor Faturamento Especial no Boleto 30d', color: '#3B82F6', bg: '#DBEAFE', action: 'faturar' };
    }
    return { text: 'Enviar E-mail de Boas-Vindas com 10% OFF', color: '#6B7280', bg: '#F3F4F6', action: 'boas-vindas' };
  };

  // Filtragem dos clientes
  const filteredClients = clients.filter(c => {
    const classif = getClientClassification(c);
    const matchesProfile =
      profileFilter === 'Todos' ||
      (profileFilter === 'VIP' && classif.label.includes('VIP')) ||
      (profileFilter === 'Frequente' && classif.label.includes('Frequente')) ||
      (profileFilter === 'Esporádico' && classif.label.includes('Esporádico')) ||
      (profileFilter === 'Inativo' && classif.label.includes('Inativo'));

    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.doc.includes(searchQuery);

    return matchesProfile && matchesSearch;
  });

  // KPIs
  const totalClients = clients.length;
  const recurringClientsCount = clients.filter(c => c.purchasesCount >= 2).length;
  const recurrenceRate = ((recurringClientsCount / totalClients) * 100).toFixed(1);
  const avgLtv = clients.reduce((sum, c) => sum + c.totalSpent, 0) / totalClients;
  const vipClientsCount = clients.filter(c => getClientClassification(c).label.includes('VIP')).length;

  // Ações Comerciais em Lote (Simulador)
  const handleBatchMarketing = (actionType: string) => {
    if (actionType === 'reactivate') {
      const inactiveCount = clients.filter(c => getClientClassification(c).label.includes('Inativo')).length;
      alert(`Campanha iniciada com sucesso! \nDisparando e-mail marketing automático com o cupom de reativação "VOLTEJA15" para os ${inactiveCount} clientes inativos da base.`);
    } else if (actionType === 'vip') {
      alert(`Lista de mailing dos ${vipClientsCount} clientes VIPs exportada para o CRM de Vendas WhatsApp!\nProposta de faturamento B2B personalizado ativada.`);
    } else {
      alert('Campanha de nutrição por e-mail enviada para os clientes cadastrados!');
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Análise de Clientes (CRM)</h1>
        <div className="admin-topbar-actions">
          <button
            onClick={() => handleBatchMarketing('reactivate')}
            className="action-btn"
            style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
          >
            🚨 Reativar Inativos
          </button>
          <button
            onClick={() => handleBatchMarketing('vip')}
            className="action-btn"
            style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
          >
            👑 Ações VIP B2B
          </button>
        </div>
      </div>

      <div className="admin-content">
        
        {/* Painel de KPIs Gerenciais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total de Clientes', value: totalClients, color: '#334155', icon: '👥', desc: 'Cadastrados na base' },
            { label: 'Taxa de Recorrência', value: `${recurrenceRate}%`, color: '#3B82F6', icon: '🔄', desc: 'Com 2 ou mais compras' },
            { label: 'LTV / Gasto Médio', value: formatCurrency(avgLtv), color: '#10B981', icon: '💰', desc: 'Valor total por cliente' },
            { label: 'Clientes VIP', value: vipClientsCount, color: '#8B5CF6', icon: '👑', desc: 'Faturamento alto (4+ compras)' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-medium)', fontWeight: 600 }}>{k.label}</span>
                <span style={{ fontSize: '1.2rem' }}>{k.icon}</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color, margin: '4px 0' }}>{k.value}</p>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{k.desc}</p>
            </div>
          ))}
        </div>


        {/* Filtros e Busca */}
        <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Perfil Comportamental:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Todos', 'VIP', 'Frequente', 'Esporádico', 'Inativo'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setProfileFilter(opt)}
                  style={{
                    background: profileFilter === opt ? '#FF6B00' : '#f1f5f9',
                    color: profileFilter === opt ? '#fff' : '#475569',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          
          <div className="admin-search" style={{ margin: 0, width: 300 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              placeholder="Buscar por nome, e-mail ou estado..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="admin-table-card">
          <div className="admin-table-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Listagem de CRM e Indicadores de LTV</h3>
          </div>
          <table style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 16px' }}>Cliente</th>
                <th style={{ padding: '14px 16px' }}>Compras Realizadas</th>
                <th style={{ padding: '14px 16px' }}>Total Faturado (LTV)</th>
                <th style={{ padding: '14px 16px' }}>Última Compra</th>
                <th style={{ padding: '14px 16px' }}>Classificação</th>
                <th style={{ padding: '14px 16px' }}>Decisão de Negócio Recomendada</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                    Nenhum cliente correspondente na pesquisa.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const classif = getClientClassification(client);
                  const recom = getActionRecommendation(classif.label);
                  const firstLetter = client.name.charAt(0).toUpperCase();

                  return (
                    <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Coluna 1: Dados do Cliente */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', background: '#ff8a00', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem'
                          }}>
                            {firstLetter}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{client.name}</strong>
                            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0' }}>
                              {client.email} | <span style={{ fontWeight: 600 }}>{client.type}:</span> {client.doc}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              📍 {client.city} - {client.state}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Contagem de Compras */}
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: '#f1f5f9', color: '#334155', padding: '4px 10px',
                          borderRadius: 20, fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {client.purchasesCount} {client.purchasesCount === 1 ? 'compra' : 'compras'}
                        </span>
                      </td>

                      {/* Coluna 3: LTV */}
                      <td style={{ padding: '16px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                          {formatCurrency(client.totalSpent)}
                        </strong>
                      </td>

                      {/* Coluna 4: Última Compra */}
                      <td style={{ padding: '16px', color: '#475569', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{client.lastPurchaseDate}</strong>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                            Há {client.daysSinceLastPurchase} {client.daysSinceLastPurchase === 1 ? 'dia' : 'dias'}
                          </p>
                        </div>
                      </td>

                      {/* Coluna 5: Classificação */}
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: classif.bg,
                          color: classif.color,
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          display: 'inline-block',
                          border: `1px solid ${classif.color}33`
                        }}>
                          {classif.label}
                        </span>
                      </td>

                      {/* Coluna 6: Sugestão de Decisão Comercial */}
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => alert(`Simulação Comercial ativada!\nAção: "${recom.text}" para o cliente ${client.name}.`)}
                          style={{
                            background: recom.bg,
                            color: recom.color,
                            border: `1px solid ${recom.color}55`,
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = recom.color;
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = recom.bg;
                            e.currentTarget.style.color = recom.color;
                          }}
                        >
                          👉 {recom.text}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
