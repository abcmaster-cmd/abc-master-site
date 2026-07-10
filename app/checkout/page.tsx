'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);

const SHIPPING_MOCK = [
  { id: 'pac', name: 'PAC (Correios)', deadline: '5-8 dias úteis', price: 18.90 },
  { id: 'sedex', name: 'SEDEX (Correios)', deadline: '1-3 dias úteis', price: 34.50 },
  { id: 'melhor', name: 'Melhor Envios — Econômico', deadline: '4-6 dias úteis', price: 14.20 },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Preenche os dados pessoais se o cliente já estiver logado
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone || '',
      }));
    }
  }, [user]);
  const [isCorporate, setIsCorporate] = useState(false);
  const [cep, setCep] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<typeof SHIPPING_MOCK>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', cpf: '', email: '', phone: '',
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    cnpj: '', ie: '', isIeExempt: false,
  });

  const selectedShippingObj = shippingOptions.find(s => s.id === selectedShipping);
  const total = subtotal + (selectedShippingObj?.price ?? 0);

  // 1. Carregar rascunho do localStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem('abc_checkout_draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.form) {
          setForm(prev => ({ ...prev, ...parsed.form }));
        }
        if (parsed.cep) {
          setCep(parsed.cep);
        }
        if (parsed.isCorporate !== undefined) {
          setIsCorporate(parsed.isCorporate);
        }
        if (parsed.selectedShipping) {
          setSelectedShipping(parsed.selectedShipping);
        }
      }
    } catch (e) {
      console.warn('Erro ao ler rascunho de checkout:', e);
    }
  }, []);

  // 2. Salvar rascunho no localStorage conforme preenche
  useEffect(() => {
    try {
      localStorage.setItem('abc_checkout_draft', JSON.stringify({
        form,
        cep,
        isCorporate,
        selectedShipping
      }));
    } catch (e) {
      console.warn('Erro ao salvar rascunho de checkout:', e);
    }
  }, [form, cep, isCorporate, selectedShipping]);

  // 3. Disparar a consulta de frete automaticamente se o CEP estiver preenchido e não houver opções carregadas
  useEffect(() => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8 && shippingOptions.length === 0) {
      handleCepBlur();
    }
  }, [cep, shippingOptions]);

  const handleCepBlur = async () => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }));
        
        // Simulação baseada nas regras de negócios da ABC Master Embalagens
        const firstTwo = cleaned.substring(0, 2);
        const isSpMetropolitan = ['01', '02', '03', '04', '05', '06', '07', '08', '09'].includes(firstTwo);

        const now = new Date();
        const isBefore11 = now.getHours() < 11;

        const options = [];

        if (isSpMetropolitan) {
          options.push({
            id: 'flex',
            name: 'ABC Master Flex (Motoboy)',
            deadline: isBefore11 ? 'Chega HOJE (se comprado até 11h)' : 'Chega AMANHÃ (compras após as 11h)',
            price: 12.90
          });

          options.push({
            id: 'jadlog_express',
            name: 'Jadlog Express',
            deadline: '2 dias úteis',
            price: 18.50
          });

          options.push({
            id: 'sedex',
            name: 'SEDEX (Correios)',
            deadline: '2 dias úteis',
            price: 21.40
          });

          options.push({
            id: 'pac',
            name: 'PAC (Correios)',
            deadline: '4 dias úteis',
            price: 14.90
          });
        } else {
          options.push({
            id: 'sedex',
            name: 'SEDEX (Correios)',
            deadline: '3 dias úteis',
            price: 38.10
          });

          options.push({
            id: 'jadlog_std',
            name: 'Jadlog Standard',
            deadline: '5 dias úteis',
            price: 24.90
          });

          options.push({
            id: 'pac',
            name: 'PAC (Correios)',
            deadline: '7 dias úteis',
            price: 21.50
          });
        }

        setShippingOptions(options);
        setSelectedShipping(options[0].id);
      }
    } catch {}
    setCepLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: { ...form, cep, isCorporate },
          shipping: selectedShippingObj,
          total,
        }),
      });
      const data = await res.json();
      if (data.initPoint) {
        // Salva localmente as informações da compra para fins de simulação de Comprador Verificado nas avaliações e central do usuário
        try {
          const purchasedIds = items.map(item => item.id || item.blingId);
          const customerEmail = form.email.toLowerCase().trim();
          const customerCpf = isCorporate ? form.cnpj : form.cpf;
          
          const localOrders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
          const newOrderId = Math.floor(1043 + Math.random() * 1000).toString();
          const paymentMethodName = isCorporate ? 'Boleto Bancário' : 'Cartão de Crédito';

          localOrders.push({
            id: newOrderId,
            customer: form.name,
            email: customerEmail,
            cpf: customerCpf,
            products: purchasedIds, // Mantido para compatibilidade com verificação de reviews
            items: items.map(item => ({
              name: item.name,
              qty: item.quantity,
              price: item.price,
              category: item.category || 'Sacos PE'
            })),
            total: total,
            shipping: selectedShippingObj?.price || 0,
            status: 'approved', // Aprovado por padrão
            date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            nfe: false,
            label: false,
            paymentMethod: paymentMethodName
          });
          localStorage.setItem('abc_orders', JSON.stringify(localOrders));
        } catch (storageErr) {
          console.error('Erro ao registrar ordem local:', storageErr);
        }

        localStorage.removeItem('abc_checkout_draft');
        clearCart();
        window.location.href = data.initPoint;
      } else {
        setError(data.error || 'Erro ao criar pagamento. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setLoading(false);
  };

  const validateStep1 = () => {
    if (isCorporate) {
      if (!form.name || !form.cnpj || !form.phone || !form.email) {
        setError('Por favor, preencha todos os campos da empresa.');
        return false;
      }
      if (!form.ie && !form.isIeExempt) {
        setError('Por favor, informe a Inscrição Estadual ou marque como Isento.');
        return false;
      }
    } else {
      if (!form.name || !form.cpf || !form.phone || !form.email) {
        setError('Por favor, preencha todos os campos dos dados pessoais.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!cep || !form.street || !form.number || !form.neighborhood || !form.city || !form.state) {
      setError('Por favor, preencha todos os campos do endereço de entrega.');
      return false;
    }
    setError('');
    return true;
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="result-page">
          <div className="result-card">
            <div className="result-icon pending">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <h1>Carrinho vazio</h1>
            <p>Adicione produtos ao carrinho antes de finalizar a compra.</p>
            <Link href="/loja" className="btn btn-primary">Ver Produtos</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="checkout-page">
        <div className="container">
          <div style={{ marginBottom: 12 }}>
            <Link href="/loja" style={{ color: 'var(--text-medium)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Continuar Comprando
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid checkout-grid">
              {/* Formulário */}
              <div>
                <div className="checkout-form-section">
                  <h2>Finalizar Compra</h2>

                  {/* Progresso visual flat */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#eee', zIndex: 1 }} />
                    <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((step - 1) / 2) * 100}%`, height: 2, background: '#FF6B00', zIndex: 2, transition: 'width 0.25s' }} />
                    {[1, 2, 3].map(s => (
                      <div key={s} style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: step >= s ? '#FF6B00' : '#fff',
                          color: step >= s ? '#fff' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.85rem', border: `2px solid ${step >= s ? '#FF6B00' : '#eee'}`,
                          transition: 'all 0.25s',
                        }}>
                          {s}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: step >= s ? '#FF6B00' : '#aaa', marginTop: 4, background: '#fff', padding: '0 4px' }}>
                          {s === 1 ? 'Identificação' : s === 2 ? 'Entrega' : 'Pagamento'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {step === 1 && (
                    /* Passo 1: Dados Pessoais / Jurídicos */
                    <div className="checkout-step" style={{ border: 'none', padding: 0 }}>
                      
                      {user ? (
                        /* Confirmação simples para usuário logado */
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', marginBottom: 12 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Identificação Confirmada (Minha Conta)</span>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: '0.84rem' }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Nome Completo</span>
                              <strong style={{ color: '#1e293b' }}>{user.name}</strong>
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>E-mail</span>
                              <strong style={{ color: '#1e293b', wordBreak: 'break-all' }}>{user.email}</strong>
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>CPF</span>
                              <strong style={{ color: '#1e293b' }}>{user.cpf}</strong>
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>WhatsApp / Telefone</span>
                              <strong style={{ color: '#1e293b' }}>{user.phone || 'Não cadastrado'}</strong>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: 14, paddingTop: 12, fontSize: '0.74rem', color: '#64748b' }}>
                            Quer faturar para outra pessoa/empresa? <Link href="/login" style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'underline' }}>Trocar de conta</Link>
                          </div>
                        </div>
                      ) : (
                        /* Formulário original com inputs */
                        <>
                          {/* Seleção de Tipo de Cadastro */}
                          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                            <button
                              type="button"
                              onClick={() => { setIsCorporate(false); setError(''); }}
                              style={{
                                flex: 1, padding: '10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700,
                                background: !isCorporate ? '#FF6B00' : '#f5f5f5', color: !isCorporate ? '#fff' : '#666',
                                border: `1px solid ${!isCorporate ? '#FF6B00' : '#ddd'}`, transition: 'all 0.2s',
                              }}
                            >
                              Pessoa Física (CPF)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsCorporate(true); setError(''); }}
                              style={{
                                flex: 1, padding: '10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700,
                                background: isCorporate ? '#FF6B00' : '#f5f5f5', color: isCorporate ? '#fff' : '#666',
                                border: `1px solid ${isCorporate ? '#FF6B00' : '#ddd'}`, transition: 'all 0.2s',
                              }}
                            >
                              Pessoa Jurídica (CNPJ)
                            </button>
                          </div>

                          <div className="checkout-step-title" style={{ marginBottom: 16 }}>
                            <span className="step-num">1</span>
                            {isCorporate ? 'Dados da Empresa' : 'Dados Pessoais'}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}>
                              <label>{isCorporate ? 'Razão Social' : 'Nome Completo'}</label>
                              <input type="text" placeholder={isCorporate ? 'Razão Social da empresa' : 'Seu nome completo'} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            
                            {!isCorporate ? (
                              <div className="form-group">
                                <label>CPF</label>
                                <input type="text" placeholder="000.000.000-00" required value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} />
                              </div>
                            ) : (
                              <div className="form-group">
                                <label>CNPJ</label>
                                <input type="text" placeholder="00.000.000/0001-00" required value={form.cnpj} onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))} />
                              </div>
                            )}

                            <div className="form-group">
                              <label>Telefone / WhatsApp</label>
                              <input type="tel" placeholder="(11) 99999-9999" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>

                            {isCorporate && (
                              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                <label>Inscrição Estadual (I.E.)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                  <input
                                    type="text"
                                    placeholder="Número da I.E."
                                    disabled={form.isIeExempt}
                                    required={!form.isIeExempt}
                                    value={form.ie}
                                    onChange={e => setForm(p => ({ ...p, ie: e.target.value }))}
                                    style={{ flex: 1, margin: 0 }}
                                  />
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: 0, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                    <input
                                      type="checkbox"
                                      checked={form.isIeExempt}
                                      onChange={e => setForm(p => ({ ...p, isIeExempt: e.target.checked, ie: e.target.checked ? '' : p.ie }))}
                                      style={{ width: 'auto', margin: 0 }}
                                    />
                                    Isento
                                  </label>
                                </div>
                              </div>
                            )}

                            <div className="form-group" style={{ gridColumn: '1/-1' }}>
                              <label>E-mail</label>
                              <input type="email" placeholder="seu@email.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                          </div>
                        </>
                      )}

                      <button
                        type="button"
                        className="btn btn-primary btn-full btn-large"
                        style={{ marginTop: 24 }}
                        onClick={() => {
                          if (validateStep1()) setStep(2);
                        }}
                      >
                        Confirmar e Continuar para Entrega →
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    /* Passo 2: Endereço */
                    <div className="checkout-step" style={{ border: 'none', padding: 0 }}>
                      <div className="checkout-step-title" style={{ marginBottom: 16 }}>
                        <span className="step-num">2</span>
                        Endereço de Entrega
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                        <div className="form-group">
                          <label>CEP</label>
                          <input
                            type="text"
                            placeholder="00000-000"
                            required
                            value={cep}
                            onChange={e => setCep(e.target.value)}
                            onBlur={handleCepBlur}
                            maxLength={9}
                          />
                          {cepLoading && <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Buscando endereço...</span>}
                        </div>
                        <div className="form-group">
                          <label>Rua / Logradouro</label>
                          <input type="text" placeholder="Nome da rua" required value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Número</label>
                          <input type="text" placeholder="Nº" required value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Complemento</label>
                          <input type="text" placeholder="Apto, bloco..." value={form.complement} onChange={e => setForm(p => ({ ...p, complement: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Bairro</label>
                          <input type="text" placeholder="Bairro" required value={form.neighborhood} onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Cidade</label>
                          <input type="text" placeholder="Cidade" required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                        </div>
                        <div className="form-group">
                          <label>Estado (UF)</label>
                          <input type="text" placeholder="SP" maxLength={2} required value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value.toUpperCase() }))} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 24 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setStep(1)}
                        >
                          ← Voltar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-large"
                          onClick={() => {
                            if (validateStep2()) {
                              if (shippingOptions.length === 0) {
                                handleCepBlur();
                              }
                              setStep(3);
                            }
                          }}
                        >
                          Ir para o Frete →
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    /* Passo 3: Frete e Pagamento */
                    <div className="checkout-step" style={{ border: 'none', padding: 0 }}>
                      <div className="checkout-step-title" style={{ marginBottom: 16 }}>
                        <span className="step-num">3</span>
                        Opção de Frete
                      </div>
                      <div className="shipping-options" style={{ marginBottom: 20 }}>
                        {shippingOptions.length > 0 ? (
                          shippingOptions.map(opt => (
                            <label key={opt.id} className={`shipping-option ${selectedShipping === opt.id ? 'selected' : ''}`}>
                              <div className="shipping-option-left">
                                <input type="radio" name="shipping" value={opt.id} checked={selectedShipping === opt.id} onChange={() => setSelectedShipping(opt.id)} />
                                <div>
                                  <p className="shipping-name">{opt.name}</p>
                                  <p className="shipping-deadline">⏱ {opt.deadline}</p>
                                </div>
                              </div>
                              <span className="shipping-price">{formatCurrency(opt.price)}</span>
                            </label>
                          ))
                        ) : (
                          <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>Informe um CEP válido no passo anterior para calcular o frete.</p>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 24 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setStep(2)}
                        >
                          ← Voltar
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-large"
                          disabled={loading || !selectedShipping}
                        >
                          {loading ? (
                            <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Processando...</>
                          ) : (
                            <>🔒 Pagar com Mercado Pago</>
                          )}
                        </button>
                      </div>

                      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: 10 }}>
                        Pagamento 100% seguro. Você será redirecionado para o Mercado Pago.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="alert error" style={{ marginTop: 16 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
                      {error}
                    </div>
                  )}

                </div>
              </div>

              {/* Resumo do Pedido */}
              <div className="order-summary">
                <h3>Resumo do Pedido</h3>
                <div className="summary-items">
                  {items.map(item => (
                    <div key={item.id} className="summary-item">
                      <span className="summary-item-name">
                        {item.name} x{item.quantity}
                        <br />
                        <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                          {Object.entries(item.variation).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </small>
                      </span>
                      <span className="summary-item-price">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-divider" />
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Frete</span>
                  <span>{selectedShippingObj ? formatCurrency(selectedShippingObj.price) : '—'}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-light)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-medium)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Compra Protegida</span>
                  </div>
                  <p>Pagamento processado com segurança pelo Mercado Pago. NF-e emitida automaticamente.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
