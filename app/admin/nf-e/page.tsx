'use client';

import { useState } from 'react';

interface Invoice {
  id: string;
  nfeNumber: string;
  orderId: string;
  customerName: string;
  doc: string;
  docType: 'CPF' | 'CNPJ';
  total: number;
  status: 'autorizada' | 'pendente' | 'cancelada';
  issueDate?: string;
}

const INITIAL_INVOICES: Invoice[] = [
  { id: '1', nfeNumber: '000.001.042', orderId: '#1042', customerName: 'João Silva', doc: '123.456.789-00', docType: 'CPF', total: 149.50, status: 'autorizada', issueDate: '08/07/2026' },
  { id: '2', nfeNumber: 'Pendente', orderId: '#1041', customerName: 'Maria Santos', doc: '987.654.321-11', docType: 'CPF', total: 104.70, status: 'pendente' },
  { id: '3', nfeNumber: '000.001.040', orderId: '#1040', customerName: 'Embalagens Diadema Ltda', doc: '12.345.678/0001-99', docType: 'CNPJ', total: 179.80, status: 'autorizada', issueDate: '07/07/2026' },
  { id: '4', nfeNumber: 'Pendente', orderId: '#1039', customerName: 'Ana Costa', doc: '234.567.890-12', docType: 'CPF', total: 239.20, status: 'pendente' },
  { id: '5', nfeNumber: '000.001.038', orderId: '#1038', customerName: 'Pedro Lima', doc: '345.678.901-23', docType: 'CPF', total: 59.90, status: 'autorizada', issueDate: '06/07/2026' },
];

export default function NfePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const filtered = invoices.filter(n => {
    const matchesSearch = n.customerName.toLowerCase().includes(search.toLowerCase()) || n.orderId.includes(search) || n.nfeNumber.includes(search);
    const matchesStatus = filterStatus === 'Todos' || n.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleTransmit = async (id: string) => {
    setInvoices(prev => prev.map(n => {
      if (n.id === id) {
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const formattedNum = `000.001.${randomNum}`;
        const today = new Date().toLocaleDateString('pt-BR');
        return {
          ...n,
          status: 'autorizada',
          nfeNumber: formattedNum,
          issueDate: today
        };
      }
      return n;
    }));
    alert('NF-e transmitida com sucesso para a SEFAZ via Bling ERP! O e-mail de faturamento com o PDF e o XML foi enviado automaticamente ao cliente.');
  };

  const handleCancel = (id: string) => {
    if (confirm('Tem certeza de que deseja cancelar esta nota fiscal?')) {
      setInvoices(prev => prev.map(n => {
        if (n.id === id) {
          return { ...n, status: 'cancelada' };
        }
        return n;
      }));
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Notas Fiscais de Produto (NF-e)</h1>
        <div className="admin-topbar-actions">
          <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={() => {
            const pendings = invoices.filter(n => n.status === 'pendente');
            if (pendings.length === 0) {
              alert('Nenhuma nota fiscal pendente para transmissão.');
              return;
            }
            if (confirm(`Deseja transmitir as ${pendings.length} notas pendentes em lote?`)) {
              pendings.forEach(n => handleTransmit(n.id));
            }
          }}>
            ⚡ Transmitir Pendentes em Lote
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Filtros */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Todos', 'Autorizada', 'Pendente', 'Cancelada'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  background: filterStatus === status ? 'var(--primary)' : 'white',
                  color: filterStatus === status ? '#fff' : 'var(--text-medium)',
                  border: '1px solid var(--border)',
                  borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border)',
                  cursor: 'pointer',
                  borderRadius: 6,
                  fontWeight: 600
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="admin-search" style={{ width: 280 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              placeholder="Buscar Nota, Pedido ou Cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Notas Fiscais */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>Registros de NF-e ({filtered.length})</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Número NF-e</th>
                <th>Pedido</th>
                <th>Destinatário</th>
                <th>CPF / CNPJ</th>
                <th style={{ textAlign: 'right' }}>Valor Total</th>
                <th>Status</th>
                <th>Emissão</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => {
                return (
                  <tr key={n.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: n.status === 'pendente' ? 'var(--text-light)' : 'var(--text-dark)' }}>
                        {n.nfeNumber}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{n.orderId}</span>
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600 }}>{n.customerName}</p>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>
                          {n.docType}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-medium)' }}>
                      {n.doc}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {n.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td>
                      <span className={`status-pill ${n.status === 'autorizada' ? 'approved' : n.status === 'pendente' ? 'pending' : 'rejected'}`}>
                        {n.status === 'autorizada' ? '✓ Autorizada' : n.status === 'pendente' ? '⚡ Pendente' : '✕ Cancelada'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-medium)', fontSize: '0.85rem' }}>
                      {n.issueDate || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {n.status === 'pendente' && (
                          <button
                            onClick={() => handleTransmit(n.id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#22C55E', borderColor: '#22C55E', cursor: 'pointer' }}
                          >
                            Transmitir
                          </button>
                        )}
                        {n.status === 'autorizada' && (
                          <>
                            <button
                              onClick={() => alert('Abrindo PDF simulado da Danfe (Bling ERP)...')}
                              className="btn"
                              style={{ padding: '6px 10px', fontSize: '0.78rem', background: '#fff', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              📄 PDF
                            </button>
                            <button
                              onClick={() => alert('Download do XML simulado da NF-e realizado com sucesso!')}
                              className="btn"
                              style={{ padding: '6px 10px', fontSize: '0.78rem', background: '#fff', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              📥 XML
                            </button>
                            <button
                              onClick={() => handleCancel(n.id)}
                              className="btn"
                              style={{ padding: '6px 10px', fontSize: '0.78rem', background: '#FFF0F0', border: '1px solid #FCA5A5', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              ✕ Cancelar
                            </button>
                          </>
                        )}
                        {n.status === 'cancelada' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic', paddingRight: 10 }}>Inativada</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
