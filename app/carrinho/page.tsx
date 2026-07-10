'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

// Desenho flat de miniatura de produtos para o carrinho
const CartProductImageSvg = ({ blingId }: { blingId: string }) => {
  const isZip = blingId.includes('zip');
  const isVacuo = blingId.includes('vacuo');

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', border: '1px solid #eee', borderRadius: 4, background: '#fcfcfc' }}>
      <rect width="64" height="64" fill="#fcfcfc" />
      <rect x="18" y="14" width="28" height="36" rx="2" fill="#fff" stroke="#ccc" strokeWidth="1" />
      
      {isZip && (
        <line x1="18" y1="20" x2="46" y2="20" stroke="#FF6B00" strokeWidth="2" />
      )}
      
      {isVacuo && (
        <>
          <line x1="18" y1="22" x2="46" y2="22" stroke="#eee" strokeWidth="1" />
          <line x1="18" y1="28" x2="46" y2="28" stroke="#eee" strokeWidth="1" />
          <line x1="18" y1="34" x2="46" y2="34" stroke="#eee" strokeWidth="1" />
          <line x1="18" y1="40" x2="46" y2="40" stroke="#eee" strokeWidth="1" />
        </>
      )}

      {!isZip && !isVacuo && (
        <path d="M40 40H42V42" stroke="#FF6B00" strokeWidth="2" fill="none" />
      )}
    </svg>
  );
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

export default function CarrinhoPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map(i => [i.id, true]))
  );

  // Estados do Simulador de Frete
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<string>('');
  const [cepError, setCepError] = useState('');
  const [shippingOptions, setShippingOptions] = useState<{ id: string; label: string; price: number; days: number }[]>([]);

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedItems(Object.fromEntries(items.map(i => [i.id, checked])));
  };

  const selectedList = items.filter(i => selectedItems[i.id]);
  const activeSubtotal = selectedList.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const activeCount = selectedList.reduce((sum, i) => sum + i.quantity, 0);

  // Simulação de Desconto Fictício estilo Mercado Livre
  const originalSubtotal = activeSubtotal * 1.1; // 10% a mais simulado de preço cheio

  const handleCalculateShipping = () => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      setCepError('Digite um CEP válido (8 dígitos)');
      setShippingOptions([]);
      setShippingCost(null);
      setShippingMethod('');
      return;
    }
    setCepError('');
    
    // Simulação realista de frete integrada à faixa de preços do e-commerce
    const options = [
      { id: 'bling-envio-normal', label: 'Melhor Envios (PAC)', price: activeSubtotal >= 150 ? 0 : 18.90, days: 5 },
      { id: 'bling-envio-expresso', label: 'Melhor Envios (SEDEX)', price: activeSubtotal >= 300 ? 0 : 34.50, days: 2 },
      { id: 'jadlog', label: 'Jadlog Express', price: activeSubtotal >= 200 ? 0 : 22.10, days: 4 }
    ];
    
    setShippingOptions(options);
    setShippingMethod(options[0].id);
    setShippingCost(options[0].price);
  };

  // Valor Total com frete incluso
  const finalTotal = activeSubtotal + (shippingCost ?? 0);

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 145px)', padding: '60px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: '48px 32px', textAlign: 'center', maxWidth: 440, width: '100%' }}>
            <div style={{ color: '#FF6B00', marginBottom: 20 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#333', marginBottom: 12 }}>Seu carrinho está vazio</h1>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 24 }}>Adicione sacos plásticos PE, zip lock ou sacos a vácuo para continuar sua compra.</p>
            <Link href="/loja" style={{ background: '#FF6B00', color: '#fff', padding: '12px 24px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontSize: '0.9rem' }}>
              Voltar ao Catálogo
            </Link>
          </div>
        </main>
      </>
    );
  }

  const allChecked = items.every(i => selectedItems[i.id]);

  return (
    <>
      <Header />
      <main style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 145px)', padding: '32px 0', color: '#333' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
            
            {/* ── COLUNA DA ESQUERDA (LISTAGEM DOS ITENS NO CARRINHO) ── */}
            <div>
              <div style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 6, overflow: 'hidden' }}>
                
                {/* Cabeçalho da Listagem */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={e => handleToggleAll(e.target.checked)}
                    style={{ accentColor: '#FF6B00', cursor: 'pointer', width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Produtos <span style={{ background: '#22C55E', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.04em' }}>ESTOQUE GARANTIDO</span>
                  </span>
                </div>

                {/* Simulador de Frete no lugar do banner antigo */}
                <div style={{ background: '#FCFCFC', borderBottom: '1px solid #E6E6E6', padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#444' }}>Calcular Frete:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={e => setCep(e.target.value)}
                        maxLength={9}
                        style={{
                          padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4,
                          fontSize: '0.82rem', outline: 'none', width: 110, color: '#333'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleCalculateShipping}
                        style={{
                          background: '#fff', border: '1px solid #FF6B00', color: '#FF6B00',
                          padding: '8px 16px', borderRadius: 4, fontSize: '0.82rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FF6B00'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#FF6B00'; }}
                      >
                        Calcular
                      </button>
                    </div>
                    {cepError && (
                      <span style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 500 }}>{cepError}</span>
                    )}
                  </div>

                  {/* Opções de frete resultantes do cálculo */}
                  {shippingOptions.length > 0 && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px dashed #E6E6E6', paddingTop: 12 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#333', marginBottom: 4 }}>Selecione a opção de entrega:</p>
                      {shippingOptions.map(option => (
                        <label
                          key={option.id}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 14px', border: `1px solid ${shippingMethod === option.id ? '#FF6B00' : '#E6E6E6'}`,
                            borderRadius: 4, cursor: 'pointer', background: shippingMethod === option.id ? '#FFF8F4' : '#fff',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="radio"
                              name="shippingSelect"
                              checked={shippingMethod === option.id}
                              onChange={() => {
                                setShippingMethod(option.id);
                                setShippingCost(option.price);
                              }}
                              style={{ accentColor: '#FF6B00' }}
                            />
                            <div>
                              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#333' }}>{option.label}</span>
                              <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 8 }}>Chega em até {option.days} dias úteis</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: option.price === 0 ? '#00a650' : '#333' }}>
                            {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2)}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Itens */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {items.map((item, idx) => {
                    const integerPrice = Math.floor(item.unitPrice);
                    const centsPrice = Math.round((item.unitPrice - integerPrice) * 100).toString().padStart(2, '0');
                    const isChecked = !!selectedItems[item.id];

                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '24px', borderBottom: idx < items.length - 1 ? '1px solid #EDEDED' : 'none',
                          display: 'flex', gap: 16, alignItems: 'flex-start', opacity: isChecked ? 1 : 0.6, transition: 'opacity 0.2s'
                        }}
                      >
                        {/* Checkbox de Seleção do Item */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                          style={{ accentColor: '#FF6B00', cursor: 'pointer', width: 16, height: 16, marginTop: 24 }}
                        />

                        {/* Imagem do Produto */}
                        <div style={{ marginTop: 4 }}>
                          <CartProductImageSvg blingId={item.blingId} />
                        </div>

                        {/* Info e Ações */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                            <div>
                              <Link href={`/loja/${item.blingId}`} style={{ fontSize: '0.88rem', fontWeight: 600, color: '#333', textDecoration: 'none', lineHeight: 1.4 }}>
                                {item.name}
                              </Link>
                              <p style={{ fontSize: '0.76rem', color: '#999', marginTop: 4 }}>
                                Categoria: {item.blingId.includes('zip') ? 'Saco Zip Lock' : item.blingId.includes('vacuo') ? 'Saco a Vácuo' : 'Sacos Plásticos PE'}
                              </p>
                            </div>

                            {/* Lixeira de Remoção */}
                            <button
                              onClick={() => removeItem(item.id)}
                              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Remover produto"
                            >
                              <TrashIcon />
                            </button>
                          </div>

                          {/* Seletor de Quantidade e Disponibilidade */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DCDCDC', borderRadius: 4, overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{ background: '#F7F7F7', border: 'none', padding: '6px 12px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}
                              >
                                -
                              </button>
                              <span style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700, minWidth: 20, textAlign: 'center', background: '#fff' }}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ background: '#F7F7F7', border: 'none', padding: '6px 12px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}
                              >
                                +
                              </button>
                            </div>
                            <span style={{ fontSize: '0.76rem', color: '#999' }}>Disponível imediato</span>
                          </div>

                        </div>

                        {/* Preço Unitário e Total do Item à Direita */}
                        <div style={{ textAlign: 'right', minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%', marginTop: 8 }}>
                          <span style={{ fontSize: '0.72rem', color: '#00a650', fontWeight: 600, display: 'block', marginBottom: 2 }}>Preço justo</span>
                          <div style={{ display: 'flex', alignItems: 'flex-start', color: '#333' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600, lineHeight: 1 }}>R$ {integerPrice}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 1, marginLeft: 1 }}>{centsPrice}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* ── COLUNA DA DIREITA (RESUMO DA COMPRA) ── */}
            <aside style={{ background: '#fff', border: '1px solid #E6E6E6', borderRadius: 6, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333', margin: 0, paddingBottom: 14, borderBottom: '1px solid #EDEDED' }}>
                Resumo da compra
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.86rem' }}>
                
                {/* Linha de Produtos */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>Produtos ({activeCount})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {activeSubtotal > 0 && (
                      <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.78rem' }}>
                        R$ {originalSubtotal.toFixed(2)}
                      </span>
                    )}
                    <span style={{ fontWeight: 600 }}>R$ {activeSubtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Linha de Frete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>Frete</span>
                  <span style={{ color: shippingCost === 0 ? '#00a650' : '#333', fontWeight: 600 }}>
                    {shippingCost === null ? 'A calcular' : shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

              </div>

              {/* Total Destacado */}
              <div style={{ borderTop: '1px solid #EDEDED', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#333' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', color: '#333' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>R$ {Math.floor(finalTotal)}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 2, marginLeft: 1 }}>
                      {Math.round((finalTotal - Math.floor(finalTotal)) * 100).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#00a650', fontWeight: 600, display: 'block', marginTop: 4 }}>
                    Sem juros no cartão
                  </span>
                </div>
              </div>

              {/* Botão de Compra Laranja */}
              <Link
                href={selectedList.length > 0 ? '/checkout' : '#'}
                onClick={e => { if (selectedList.length === 0) e.preventDefault(); }}
                style={{
                  width: '100%', padding: '14px', borderRadius: 6, background: selectedList.length > 0 ? '#FF6B00' : '#ccc',
                  color: '#fff', fontSize: '0.92rem', fontWeight: 700, cursor: selectedList.length > 0 ? 'pointer' : 'default',
                  border: 'none', textAlign: 'center', textDecoration: 'none', transition: 'all 0.15s', display: 'block',
                  boxSizing: 'border-box'
                }}
              >
                Continuar a compra
              </Link>

              {/* Selo extra */}
              <p style={{ fontSize: '0.74rem', color: '#999', textAlign: 'center', lineHeight: 1.4, margin: 0 }}>
                Compre com total segurança na ABC Master. Seu pagamento é processado e garantido via Mercado Pago.
              </p>

            </aside>

          </div>

        </div>
      </main>
    </>
  );
}
