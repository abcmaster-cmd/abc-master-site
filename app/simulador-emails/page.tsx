'use client';

import { useState } from 'react';
import Header from '@/components/Header';

export default function SimuladorEmailsPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ id: string, message: string, type: 'success' | 'info' | 'error' }>>([]);

  const addLog = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setLogs(prev => [
      { id: Math.random().toString(), message, type },
      ...prev
    ]);
  };

  const handleSendEmail = async (type: string, title: string) => {
    if (!email) {
      addLog('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }

    setLoading(type);
    addLog(`Iniciando simulação de e-mail: ${title}...`, 'info');

    try {
      const response = await fetch('/api/emails/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type,
          customerName: name || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.mode === 'resend_api') {
          addLog(`✓ E-mail "${title}" enviado com sucesso via Resend API para ${email}!`, 'success');
        } else {
          addLog(`💡 E-mail "${title}" processado em MODO SIMULAÇÃO (chave não definida). Verifique os logs do console.`, 'success');
        }
      } else {
        addLog(`✗ Erro ao enviar e-mail: ${data.error || 'Erro desconhecido.'}`, 'error');
      }

    } catch (err: any) {
      addLog(`✗ Erro de rede ou servidor: ${err.message || err}`, 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleSendAll = async () => {
    if (!email) {
      addLog('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }

    setLoading('all');
    addLog('🚀 Disparando simulação de JORNADA COMPLETA (5 e-mails)...', 'info');

    try {
      const response = await fetch('/api/emails/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: 'all',
          customerName: name || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.mode === 'resend_api') {
          addLog(`✓ Todos os 5 e-mails da jornada foram enviados via Resend API para ${email}!`, 'success');
        } else {
          addLog(`💡 Todos os 5 e-mails foram processados em MODO SIMULAÇÃO (chave não definida). Verifique os logs do console.`, 'success');
        }
      } else {
        addLog(`✗ Erro ao simular jornada completa: ${data.error || 'Erro desconhecido.'}`, 'error');
      }

    } catch (err: any) {
      addLog(`✗ Erro de rede ou servidor: ${err.message || err}`, 'error');
    } finally {
      setLoading(null);
    }
  };

  const emailSteps = [
    {
      id: 'abandoned',
      title: '🛒 Carrinho Abandonado',
      description: 'Lembrete contendo os produtos pendentes, cupom promocional (VOLTEI5) e link de retorno para incentivar o cliente a concluir a compra.',
      badge: 'Fase 1'
    },
    {
      id: 'awaiting_payment',
      title: '🕒 Aguardando Pagamento',
      description: 'Emitido logo após a finalização do pedido, contendo o resumo financeiro detalhado, chaves PIX copia e cola e link para meios de pagamento.',
      badge: 'Fase 2'
    },
    {
      id: 'payment_approved',
      title: '🎉 Pagamento Aprovado',
      description: 'Enviado instantaneamente após a confirmação financeira, confirmando a separação imediata e início do processo de embalagem protetora.',
      badge: 'Fase 3'
    },
    {
      id: 'invoice_issued',
      title: '📑 Nota Fiscal Emitida',
      description: 'Informa que o lote foi faturado com sucesso no ERP Bling v3, contendo link simulado para a Danfe (PDF) e preparação para despacho.',
      badge: 'Fase 4'
    },
    {
      id: 'shipped',
      title: '🚚 Pedido Despachado',
      description: 'Notifica que o pacote foi coletado pela transportadora, informando o código de rastreamento exclusivo e link de acompanhamento.',
      badge: 'Fase 5'
    }
  ];

  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 145px)', background: '#F8F9FA', padding: '40px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          
          {/* Cabeçalho do Painel */}
          <div style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: 32, marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111', margin: '0 0 10px 0' }}>
              Simulador de E-mails Transacionais
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, margin: 0 }}>
              Use esta ferramenta administrativa para validar os templates responsivos das 5 etapas da jornada de compra da <span style={{ fontWeight: 600, color: '#FF6B00' }}>NZB Embalagens</span>.
              Se você configurar a chave do Resend no arquivo <code style={{ background: '#F5F5F5', padding: '2px 4px', borderRadius: 3 }}>.env</code>, receberá os e-mails reais na sua própria caixa de entrada!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            
            {/* Coluna Esquerda: Listagem de Etapas de Compra */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {emailSteps.map(step => (
                <div key={step.id} style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.72rem', background: '#FFF0E6', color: '#FF6B00', fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>
                        {step.badge}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>
                        {step.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.5, margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendEmail(step.id, step.title)}
                    disabled={loading !== null}
                    style={{
                      padding: '8px 16px', borderRadius: 4, border: `1.5px solid #FF6B00`,
                      background: loading === step.id ? '#FFF0E6' : '#fff',
                      color: '#FF6B00', fontSize: '0.8rem', fontWeight: 700,
                      cursor: loading !== null ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                      whiteSpace: 'nowrap', alignSelf: 'center'
                    }}
                    onMouseEnter={e => { if(loading === null) e.currentTarget.style.background = '#FFF0E6' }}
                    onMouseLeave={e => { if(loading === null) e.currentTarget.style.background = '#fff' }}
                  >
                    {loading === step.id ? 'Enviando...' : 'Testar Envio'}
                  </button>
                </div>
              ))}
            </div>

            {/* Coluna Direita: Dados de Entrada & Logs */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Form de Destinatário */}
              <div style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: 24 }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111', margin: '0 0 16px 0' }}>
                  Dados do Destinatário
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>
                      E-mail de Destino
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc',
                        fontSize: '0.84rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>
                      Nome do Comprador
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Vinícius"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc',
                        fontSize: '0.84rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSendAll}
                    disabled={loading !== null}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 6, border: 'none',
                      background: '#FF6B00', color: '#fff', fontSize: '0.86rem', fontWeight: 700,
                      cursor: loading !== null ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                      marginTop: 6
                    }}
                    onMouseEnter={e => { if(loading === null) e.currentTarget.style.background = '#e05e00' }}
                    onMouseLeave={e => { if(loading === null) e.currentTarget.style.background = '#FF6B00' }}
                  >
                    {loading === 'all' ? 'Processando jornada...' : 'Jornada Completa (5 E-mails)'}
                  </button>
                </div>
              </div>

              {/* Logs do Console local do Simulador */}
              <div style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', height: 260 }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111', margin: '0 0 12px 0' }}>
                  Logs de Disparo
                </h3>
                
                <div style={{
                  flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
                  fontSize: '0.74rem', fontFamily: 'monospace', padding: '10px', background: '#FAFAFA',
                  borderRadius: 4, border: '1px solid #EDEDED', maxHeight: 180
                }}>
                  {logs.length === 0 ? (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Os logs dos disparos aparecerão aqui...</span>
                  ) : (
                    logs.map(log => (
                      <div
                        key={log.id}
                        style={{
                          color: log.type === 'success' ? '#00a650' : log.type === 'error' ? '#D32F2F' : '#666',
                          borderBottom: '1px solid #F0F0F0', paddingBottom: 4, lineHeight: 1.4
                        }}
                      >
                        {log.message}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </aside>

          </div>

        </div>
      </main>
    </>
  );
}
