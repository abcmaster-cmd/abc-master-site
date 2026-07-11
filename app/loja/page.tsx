'use client';

import { useState, useEffect } from 'react';
import { getProducts, getInstallments } from '@/lib/productDatabase';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

// Produtos mock realistas baseados na imagem enviada pelo usuário
const MOCK_PRODUCTS = [
  {
    id: 'saco-pe-50x70',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 50 X 70 X 0,20 Transparente (grosso)',
    description: 'Espessura reforçada de 0,20mm. Ideal para proteção de produtos industriais e comerciais pesados.',
    originalPrice: 59.90,
    price: 53.91,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 120,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '2x R$ 26,96 sem juros',
    imageType: 'pe-grosso',
  },
  {
    id: 'saco-pe-22x32',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 22 X 32 X 0,06 Transparente (fino)',
    description: 'Espessura leve de 0,06mm. Excelente custo-benefício para peças leves e organizadores.',
    price: 59.90,
    discount: 0,
    badge: '',
    stock: 200,
    freeShipping: true,
    mercadoPagoPromo: false,
    installments: '2x R$ 29,95 sem juros',
    imageType: 'pe-fino',
  },
  {
    id: 'saco-pe-80x120',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 80 X 120 X 0,20 Transparente (grosso)',
    description: 'Saco plástico de grande porte para produtos volumosos e armazenamento industrial pesado.',
    originalPrice: 144.33,
    price: 129.90,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 45,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '4x R$ 32,47 sem juros',
    imageType: 'pe-grosso',
  },
  {
    id: 'saco-pe-35x55',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 35 X 55 X 0,20 Transparente (grosso)',
    description: 'Espessura grossa de 0,20mm. Perfeito para ferragens, autopeças e embalagens resistentes.',
    originalPrice: 59.90,
    price: 53.91,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 80,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '2x R$ 26,96 sem juros',
    imageType: 'pe-grosso',
  },
  {
    id: 'sacos-zip-n05',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N05 10x14cm (100 unidades)',
    description: 'Sacos herméticos com trilho deslizante. Excelente vedação para conservação e alimentos.',
    price: 34.90,
    discount: 0,
    badge: 'MAIS VENDIDO',
    stock: 350,
    freeShipping: false,
    mercadoPagoPromo: false,
    installments: '1x R$ 34,90 sem juros',
    imageType: 'zip',
  },
  {
    id: 'sacos-zip-n10',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N10 24x34cm (100 unidades)',
    description: 'Tamanho grande para documentos, roupas e organização geral com fechamento hermético.',
    originalPrice: 88.00,
    price: 79.20,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 90,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '3x R$ 26,40 sem juros',
    imageType: 'zip',
  },
  {
    id: 'saco-vacuo-20x30',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 20 X 30 cm (100 unidades)',
    description: 'Alta barreira contra oxigênio e umidade. Ideal para conservação de alimentos frios, carnes e queijos.',
    originalPrice: 59.90,
    price: 49.90,
    discount: 16,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 140,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '2x R$ 24,95 sem juros',
    imageType: 'vacuo',
  },
  {
    id: 'saco-vacuo-30x40',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 30 X 40 cm (100 unidades)',
    description: 'Tamanho médio-grande para porções maiores. Certificado livre de BPA para contato com alimentos.',
    price: 79.90,
    discount: 0,
    badge: 'NOVIDADE',
    stock: 95,
    freeShipping: true,
    mercadoPagoPromo: false,
    installments: '3x R$ 26,63 sem juros',
    imageType: 'vacuo',
  }
];

// Desenho flat de simulação de produtos (sacos plásticos transparente)
const ProductImageSvg = ({ type }: { type: string }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      {/* Fundo do card da imagem */}
      <rect width="240" height="200" fill="#F8F8F8" rx="4"/>
      
      {/* Saco Plástico Traseiro */}
      <rect x="65" y="45" width="110" height="120" rx="3" fill="#EAEAEA" stroke="#D0D0D0" strokeWidth="1" opacity="0.6"/>
      
      {/* Saco Plástico do Meio */}
      <rect x="60" y="40" width="110" height="120" rx="3" fill="#F0F0F0" stroke="#CCCCCC" strokeWidth="1"/>
      
      {/* Saco Plástico Frontal Principal */}
      <rect x="55" y="35" width="110" height="120" rx="3" fill="#FFFFFF" stroke="#BBBBBB" strokeWidth="1.5"/>
      
      {/* Texturas de Plástico Trasparente / Brilho do Saco */}
      <path d="M65 45L155 135" stroke="#EAEAEA" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M85 35L165 115" stroke="#F5F5F5" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      
      {/* Detalhes específicos de tipo de produto */}
      {type === 'zip' && (
        <>
          {/* Trilho do Zip Lock */}
          <line x1="55" y1="48" x2="165" y2="48" stroke="#FF6B00" strokeWidth="3"/>
          <line x1="55" y1="52" x2="165" y2="52" stroke="#FF6B00" strokeWidth="1" opacity="0.7"/>
        </>
      )}

      {type === 'pe-grosso' && (
        <>
          {/* Indicador de Espessura Grossa */}
          <path d="M145 145H155V155" stroke="#FF6B00" strokeWidth="3" fill="none"/>
          <text x="75" y="145" fill="#888" fontSize="10" fontWeight="bold">0,20 mm</text>
        </>
      )}

      {type === 'pe-fino' && (
        <>
          {/* Indicador de Espessura Fina */}
          <text x="75" y="145" fill="#aaa" fontSize="10" fontWeight="bold">0,06 mm</text>
        </>
      )}

      {type === 'vacuo' && (
        <>
          {/* Saco a vácuo com ranhuras texturizadas */}
          <path d="M55 55L165 55" stroke="#EAEAEA" strokeWidth="1"/>
          <path d="M55 75L165 75" stroke="#EEEEEE" strokeWidth="0.5"/>
          <path d="M55 95L165 95" stroke="#EEEEEE" strokeWidth="0.5"/>
          <path d="M55 115L165 115" stroke="#EEEEEE" strokeWidth="0.5"/>
          <path d="M55 135L165 135" stroke="#EEEEEE" strokeWidth="0.5"/>
          <text x="75" y="145" fill="#FF6B00" fontSize="9" fontWeight="bold">VÁCUO GOFRADO</text>
        </>
      )}
      {type === 'kit' && (
        <>
          {/* Ícones extras simulando múltiplos sacos empilhados */}
          <rect x="110" y="80" width="50" height="60" rx="2" fill="#FFFFFF" stroke="#FF6B00" strokeWidth="1" opacity="0.9"/>
          <line x1="110" y1="88" x2="160" y2="88" stroke="#FF6B00" strokeWidth="2"/>
        </>
      )}
    </svg>
  );
};

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

function ProductCard({ product }: { product: typeof MOCK_PRODUCTS[0] }) {
  // Separação dos reais e centavos para visualização idêntica ao Mercado Livre
  const integerPart = Math.floor(product.price);
  const centsPart = Math.round((product.price - integerPart) * 100).toString().padStart(2, '0');

  return (
    <div className="shop-product-card" style={{ 
      border: '1px solid #dcdcdc', 
      borderRadius: 6, 
      background: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'all 0.2s', 
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#FF6B00';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
      e.currentTarget.style.transform = 'translateY(-3px)';
      const img = e.currentTarget.querySelector('.product-card-image-hover') as HTMLImageElement;
      if (img) img.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#dcdcdc';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
      e.currentTarget.style.transform = 'translateY(0)';
      const img = e.currentTarget.querySelector('.product-card-image-hover') as HTMLImageElement;
      if (img) img.style.transform = 'scale(1)';
    }}
    >
      <Link href={`/loja/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Imagem do Produto Real (PNG) */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', background: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <img
            src={
              product.image
                ? product.image
                : product.name.toLowerCase().includes('canela')
                ? '/saco_canela.png'
                : product.imageType === 'pe-grosso' || product.imageType === 'pe-fino' || product.category === 'pe'
                ? '/saco_pe.png'
                : product.imageType === 'zip' || product.category === 'zip'
                ? '/saco_zip.png'
                : product.imageType === 'vacuo' || product.category === 'vacuo'
                ? '/saco_vacuo.png'
                : '/saco_pe.png'
            }
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px', transition: 'transform 0.3s' }}
            className="product-card-image-hover"
          />
        </div>

        {/* Conteúdo Informativo */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid #F0F0F0' }}>
          
          {/* Badge de Destaque / Oferta */}
          {product.badge ? (
            <span style={{ background: '#FF6B00', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 2, display: 'inline-block', width: 'fit-content', marginBottom: 8, letterSpacing: '0.04em' }}>
              {product.badge}
            </span>
          ) : (
            <div style={{ height: 19 }} /> // Manter alinhamento
          )}

          {/* Nome do Produto */}
          <h3 style={{ fontSize: '0.86rem', fontWeight: 500, color: '#333', marginBottom: 8, lineHeight: '1.4', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </h3>

          {/* Desconto Original Riscado */}
          {product.discount > 0 && product.originalPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#999', marginBottom: 2 }}>
              <span style={{ textDecoration: 'line-through' }}>R$ {product.originalPrice.toFixed(2)}</span>
              <span style={{ color: '#00a650', fontWeight: 600 }}>{product.discount}% OFF</span>
            </div>
          ) : (
            <div style={{ height: 17 }} /> // Manter alinhamento
          )}

          {/* Preço Principal (Exponencial no Centavo) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', color: '#333', marginBottom: 4 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 400, lineHeight: 1 }}>R$ {integerPart}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 400, marginTop: 2, marginLeft: 1 }}>{centsPart}</span>
          </div>

          {/* Parcelamento */}
          <p style={{ fontSize: '0.76rem', color: '#00a650', marginBottom: 6, fontWeight: 500 }}>
            {getInstallments(product.price)}
          </p>



          {/* Envio / Frete a Calcular */}
          <p style={{ fontSize: '0.78rem', color: '#777', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto', marginBottom: 6 }}>
            Frete a calcular
          </p>

        </div>
      </Link>
    </div>
  );
}

export default function LojaPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  
  // Filtros Avançados estilo Mercado Livre
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [activePriceRange, setActivePriceRange] = useState({ min: 0, max: Infinity });
  
  // Tratar filtros de query params da url se existirem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      const q = params.get('q');
      if (cat) setSelectedCat(cat);
      if (q) setSearch(q);
      
      setProducts(getProducts());

      // Sincroniza catálogo atualizado com o servidor (ex: estoques sincronizados por webhook)
      fetch('/api/produtos')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.products) {
            setProducts(data.products);
            localStorage.setItem('abc_products', JSON.stringify(data.products));
          }
        })
        .catch(err => console.warn('Erro ao atualizar vitrine com o servidor:', err));
    }
  }, []);

  const filtered = products.filter(p => {
    // Busca por texto
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
    // Filtro por Categoria
    const matchCat = selectedCat === 'all' || p.category === selectedCat;
    // Filtro por Faixa de Preço Manual
    const matchPrice = p.price >= activePriceRange.min && p.price <= activePriceRange.max;

    return matchSearch && matchCat && matchPrice;
  });

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = priceRange.min ? parseFloat(priceRange.min) : 0;
    const maxVal = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    setActivePriceRange({ min: minVal, max: maxVal });
  };

  const selectPredefinedPrice = (min: number, max: number) => {
    setPriceRange({ min: min ? min.toString() : '', max: max !== Infinity ? max.toString() : '' });
    setActivePriceRange({ min, max });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setPriceRange({ min: '', max: '' });
    setActivePriceRange({ min: 0, max: Infinity });
  };

  return (
    <>
      <Header />
      <main style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 145px)', padding: '40px 0' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 40, alignItems: 'start' }}>
            
            {/* ── SIDEBAR DE FILTROS (ESTILO MERCADO LIVRE) ── */}
            <aside style={{ color: '#333' }}>
              
              {/* Título Principal */}
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', textTransform: 'capitalize', margin: 0, lineHeight: 1.2 }}>
                  {selectedCat === 'all' ? 'Todos os anúncios' : selectedCat === 'pe' ? 'Sacos Plásticos PE' : selectedCat === 'zip' ? 'Sacos Zip Lock' : 'Sacos a Vácuo'}
                </h1>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{filtered.length} resultados</span>
              </div>



              {/* Seção Categorias */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#333', marginBottom: 12 }}>Categorias</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'all', label: 'Todos os anúncios' },
                    { id: 'pe', label: 'Sacos Plásticos PE' },
                    { id: 'zip', label: 'Sacos Zip Lock' },
                    { id: 'vacuo', label: 'Sacos a Vácuo' },
                  ].map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCat(cat.id)}
                        style={{
                          background: 'none', border: 'none', padding: 0, fontSize: '0.82rem',
                          color: selectedCat === cat.id ? '#FF6B00' : '#334155',
                          fontWeight: selectedCat === cat.id ? 700 : 500,
                          textAlign: 'left', cursor: 'pointer', outline: 'none'
                        }}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Seção Preço */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#333', marginBottom: 12 }}>Preço</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  <li>
                    <button onClick={() => selectPredefinedPrice(0, 55)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.82rem', color: '#334155', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
                      Até R$ 55
                    </button>
                  </li>
                  <li>
                    <button onClick={() => selectPredefinedPrice(55, 90)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.82rem', color: '#334155', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
                      R$ 55 a R$ 90
                    </button>
                  </li>
                  <li>
                    <button onClick={() => selectPredefinedPrice(90, Infinity)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.82rem', color: '#334155', cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
                      Mais de R$ 90
                    </button>
                  </li>
                </ul>

                {/* Form de preço manual */}
                <form onSubmit={handleApplyPrice} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={priceRange.min}
                    onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    style={{
                      width: 75, padding: '6px 8px', fontSize: '0.8rem', border: '1px solid #94a3b8', borderRadius: 4,
                      background: '#fff', color: '#333', outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#FF6B00'}
                    onBlur={e => e.target.style.borderColor = '#94a3b8'}
                  />
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>—</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={priceRange.max}
                    onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    style={{
                      width: 75, padding: '6px 8px', fontSize: '0.8rem', border: '1px solid #94a3b8', borderRadius: 4,
                      background: '#fff', color: '#333', outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#FF6B00'}
                    onBlur={e => e.target.style.borderColor = '#94a3b8'}
                  />
                  <button
                    type="submit"
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #94a3b8',
                      color: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.background = '#FFF8F4'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#fff'; }}
                  >
                    ›
                  </button>
                </form>
              </div>

              {/* Botão de Redefinir Filtros */}
              {(search || selectedCat !== 'all' || priceRange.min || priceRange.max) && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'none', border: 'none', color: '#FF6B00', fontSize: '0.82rem',
                    fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  ✕ Limpar filtros
                </button>
              )}

            </aside>

            {/* ── LISTAGEM DE PRODUTOS (DIREITA) ── */}
            <div>
              {/* Barra superior de Ordenação (Estilo Mercado Livre) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20, fontSize: '0.84rem' }}>
                <span style={{ color: '#333' }}>
                  Ordenar por <strong style={{ color: '#FF6B00', cursor: 'pointer' }}>Mais relevantes ▾</strong>
                </span>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed #ccc', borderRadius: 6, background: '#fff' }}>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 14 }}>Nenhum produto encontrado para estes filtros.</p>
                  <button className="btn btn-secondary" onClick={clearFilters} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Limpar Filtros</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {filtered.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
