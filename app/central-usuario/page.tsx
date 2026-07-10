'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Header from '@/components/Header';
import Link from 'next/link';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  category: string;
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

// Mapeamento visual amigável do status para o cliente
const statusLabels: Record<string, string> = {
  pending: 'Aguardando Pagamento',
  in_process: 'Pagamento em Análise',
  approved: 'Pago (Preparando Envio)',
  shipped: 'Enviado (Em Trânsito)',
  delivered: 'Entregue',
  rejected: 'Cancelado'
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: '#FFF9E6', text: '#D97706', dot: '#F59E0B' },
  in_process: { bg: '#F3E8FF', text: '#7C3AED', dot: '#8B5CF6' },
  approved: { bg: '#EBF5FF', text: '#1E40AF', dot: '#3B82F6' },
  shipped: { bg: '#ECFDF5', text: '#047857', dot: '#10B981' },
  delivered: { bg: '#F0FDF4', text: '#166534', dot: '#22C55E' },
  rejected: { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' }
};

const getProductImage = (name: string, category: string = '') => {
  const n = name.toLowerCase();
  if (n.includes('canela')) return '/saco_canela.png';
  if (category.toLowerCase().includes('pe') || n.includes('saco pe') || n.includes('saco plástico pe')) return '/saco_pe.png';
  if (category.toLowerCase().includes('zip') || n.includes('zip lock') || n.includes('saco plástico zip')) return '/saco_zip.png';
  if (category.toLowerCase().includes('vácuo') || category.toLowerCase().includes('vacuo') || n.includes('vácuo')) return '/saco_vacuo.png';
  return '/saco_pe.png';
};

function formatCurrency(v: number) {
  if (v === undefined || v === null || isNaN(v)) return 'R$ 0,00';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CentralUsuarioPage() {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    try {
      const stored = localStorage.getItem('abc_orders');
      if (stored) {
        const parsed: Order[] = JSON.parse(stored);
        if (user) {
          // Filtrar os pedidos do usuário autenticado por e-mail
          const userMail = user.email.toLowerCase().trim();
          
          const filtered = parsed.filter(o => 
            (o.email && o.email.toLowerCase().trim() === userMail)
          );
          
          // Ordenar pelo ID mais recente
          filtered.sort((a, b) => Number(b.id) - Number(a.id));
          setOrders(filtered);
        }
      }
    } catch (err) {
      console.error('Erro ao ler pedidos do localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, [user, userLoading]);

  // Se o contexto do usuário ainda estiver carregando, exibe skeleton
  if (userLoading || (loading && user)) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 600 }}>Carregando dados da sua conta...</p>
        </div>
      </>
    );
  }

  // Se não estiver logado, pede login
  if (!user) {
    return (
      <>
        <Header />
        <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '40px', maxWidth: 460, width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', background: '#FFF0E6', borderRadius: '50%', padding: '16px', color: '#FF6B00', marginBottom: 24 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Central do Cliente</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: 30 }}>
              Faça login para acompanhar o andamento dos seus pedidos, notas fiscais e histórico de compras na ABC Master.
            </p>
            <Link href="/login" style={{ display: 'block', background: '#FF6B00', color: '#fff', padding: '14px 24px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(255,107,0,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e66000'} onMouseLeave={e => e.currentTarget.style.background = '#FF6B00'}>
              Acessar Minha Conta
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          
          {/* Cabeçalho da Central */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#FF6B00', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Área do Cliente</span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>Olá, {user.name}!</h1>
            </div>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '12px 20px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(37,211,102,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              Precisa de ajuda? WhatsApp
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 30, alignItems: 'start' }}>
            
            {/* Sidebar de Informações do Perfil */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 16 }}>
                Dados Cadastrados
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Nome Completo</span>
                  <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600, margin: '2px 0 0 0' }}>{user.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>E-mail</span>
                  <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600, margin: '2px 0 0 0', wordBreak: 'break-all' }}>{user.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>CPF / CNPJ</span>
                  <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600, margin: '2px 0 0 0' }}>{user.cpf}</p>
                </div>
                {user.phone && (
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Telefone</span>
                    <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600, margin: '2px 0 0 0' }}>{user.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico de Pedidos */}
            <div>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 30, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                  📦 Seus Pedidos ({orders.length})
                </h2>

                {orders.length === 0 ? (
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: '48px 20px', textAlign: 'center', background: '#f8fafc' }}>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 16px 0' }}>Você ainda não realizou nenhum pedido em nossa loja.</p>
                    <Link href="/loja" style={{ display: 'inline-block', background: '#FF6B00', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                      Ir para a Loja
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {orders.map(order => {
                      const statusStyle = statusColors[order.status] || { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };
                      
                      return (
                        <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                          
                          {/* Cabeçalho do Pedido */}
                          <div style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>Pedido #{order.id}</strong>
                              <span style={{ width: 1, height: 14, background: '#cbd5e1' }} />
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Realizado em: <strong>{order.date}</strong></span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '0.72rem', color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                                💳 {order.paymentMethod}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: statusStyle.bg, color: statusStyle.text, padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 800 }}>
                                <span style={{ width: 6, height: 6, background: statusStyle.dot, borderRadius: '50%', display: 'inline-block' }} />
                                {statusLabels[order.status] || order.status}
                              </div>
                            </div>
                          </div>

                          {/* Itens do Pedido */}
                          <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {order.items && order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <img src={getProductImage(item.name, item.category)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                                    </div>
                                    <div>
                                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: '1.3' }}>{item.name}</p>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Qtd: <strong>{item.qty}</strong></span>
                                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>•</span>
                                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Valor unitário: {formatCurrency(item.price)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(item.price * item.qty)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Detalhes de Faturamento e Envio */}
                            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                              
                              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                {order.nfe && (
                                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    🧾 Nota Fiscal Emitida
                                  </span>
                                )}
                                {order.status === 'shipped' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                                      🚚 Pedido Despachado
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Código de rastreamento: <strong style={{ color: '#0f172a' }}>AB{order.id}BR</strong></span>
                                  </div>
                                )}
                              </div>

                              <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  Frete: <strong style={{ color: '#1e293b' }}>{order.shipping > 0 ? formatCurrency(order.shipping) : 'Grátis'}</strong>
                                </div>
                                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800, marginTop: 2 }}>
                                  Total Pago: <span style={{ color: '#FF6B00', fontSize: '1.05rem' }}>{formatCurrency(order.total)}</span>
                                </div>
                              </div>

                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
