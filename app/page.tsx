'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import CartDrawer from '@/components/CartDrawer';

/* ─── MOCK PRODUTOS REALISTAS ─── */
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
    id: 'saco-pe-30x50',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 30 X 50 X 0,10 Transparente (médio)',
    description: 'Espessura intermediária ideal para embalagem de roupas, peças e produtos variados.',
    originalPrice: 72.00,
    price: 64.80,
    discount: 10,
    badge: 'MAIS VENDIDO',
    stock: 180,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '2x R$ 32,40 sem juros',
    imageType: 'pe-fino',
  },
  {
    id: 'saco-pe-40x60',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 40 X 60 X 0,06 Transparente (fino)',
    description: 'Filme fino e resistente, excelente para embalar produtos leves em grande volume.',
    price: 55.00,
    discount: 0,
    badge: 'NOVIDADE',
    stock: 210,
    freeShipping: true,
    mercadoPagoPromo: false,
    installments: '2x R$ 27,50 sem juros',
    imageType: 'pe-fino',
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
    id: 'sacos-zip-n07',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N07 13x18cm (100 unidades)',
    description: 'Tamanho versátil para joias, eletrônicos e cosméticos. Vedação hermética garantida.',
    originalPrice: 52.00,
    price: 46.80,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 120,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '2x R$ 23,40 sem juros',
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
  },
  {
    id: 'saco-vacuo-15x25',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 15 X 25 cm (100 unidades)',
    description: 'Tamanho compacto para porções individuais. Livre de BPA, ideal para alimentos e medicamentos.',
    originalPrice: 44.90,
    price: 37.90,
    discount: 15,
    badge: 'MAIS VENDIDO',
    stock: 200,
    freeShipping: true,
    mercadoPagoPromo: true,
    installments: '2x R$ 18,95 sem juros',
    imageType: 'vacuo',
  }
];

const CATEGORIES = [
  { key: 'pe', label: 'Sacos Plásticos PE', href: '/loja?cat=pe' },
  { key: 'zip', label: 'Sacos Zip Lock', href: '/loja?cat=zip' },
  { key: 'vacuo', label: 'Sacos a Vácuo', href: '/loja?cat=vacuo' },
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ─── ÍCONES ─── */
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const WhatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.53 2 2 0 0 1 3.62 1.35h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const PackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;

/* ─── DESENHO FLAT DE SACULA PLÁSTICA SVG ─── */
const ProductImageSvg = ({ type }: { type: string }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      <rect width="240" height="200" fill="#F8F8F8" rx="4"/>
      <rect x="65" y="45" width="110" height="120" rx="3" fill="#EAEAEA" stroke="#D0D0D0" strokeWidth="1" opacity="0.6"/>
      <rect x="60" y="40" width="110" height="120" rx="3" fill="#F0F0F0" stroke="#CCCCCC" strokeWidth="1"/>
      <rect x="55" y="35" width="110" height="120" rx="3" fill="#FFFFFF" stroke="#BBBBBB" strokeWidth="1.5"/>
      <path d="M65 45L155 135" stroke="#EAEAEA" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M85 35L165 115" stroke="#F5F5F5" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      
      {type === 'zip' && (
        <>
          <line x1="55" y1="48" x2="165" y2="48" stroke="#FF6B00" strokeWidth="3"/>
          <line x1="55" y1="52" x2="165" y2="52" stroke="#FF6B00" strokeWidth="1" opacity="0.7"/>
        </>
      )}

      {type === 'pe-grosso' && (
        <>
          <path d="M145 145H155V155" stroke="#FF6B00" strokeWidth="3" fill="none"/>
          <text x="75" y="145" fill="#888" fontSize="10" fontWeight="bold">0,20 mm</text>
        </>
      )}

      {type === 'pe-fino' && (
        <>
          <text x="75" y="145" fill="#aaa" fontSize="10" fontWeight="bold">0,06 mm</text>
        </>
      )}

      {type === 'vacuo' && (
        <>
          <path d="M55 55L165 55" stroke="#EAEAEA" strokeWidth="1"/>
          <path d="M55 75L165 75" stroke="#EEEEEE" strokeWidth="0.5"/>
          <path d="M55 95L165 95" stroke="#EEEEEE" strokeWidth="0.5"/>
          <path d="M55 115L165 115" stroke="#EEEEEE" strokeWidth="0.5"/>
          <path d="M55 135L165 135" stroke="#EEEEEE" strokeWidth="0.5"/>
          <text x="75" y="145" fill="#FF6B00" fontSize="9" fontWeight="bold">VÁCUO GOFRADO</text>
        </>
      )}
    </svg>
  );
};

function ProductCard({ product }: { product: typeof MOCK_PRODUCTS[0] }) {
  const integerPart = Math.floor(product.price);
  const centsPart = Math.round((product.price - integerPart) * 100).toString().padStart(2, '0');

  return (
    <div style={{ border: '1px solid #E6E6E6', borderRadius: 4, background: '#fff', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s', overflow: 'hidden' }}>
      <Link href={`/loja/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', background: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={
              product.name.toLowerCase().includes('canela')
                ? '/saco_canela.png'
                : product.imageType === 'pe-grosso' || product.imageType === 'pe-fino'
                ? '/saco_pe.png'
                : product.imageType === 'zip'
                ? '/saco_zip.png'
                : product.imageType === 'vacuo'
                ? '/saco_vacuo.png'
                : '/saco_pe.png'
            }
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, borderTop: '1px solid #F0F0F0' }}>
          {product.badge ? (
            <span style={{ background: '#FF6B00', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 2, display: 'inline-block', width: 'fit-content', marginBottom: 8, letterSpacing: '0.04em' }}>
              {product.badge}
            </span>
          ) : (
            <div style={{ height: 19 }} />
          )}

          <h3 style={{ fontSize: '0.86rem', fontWeight: 500, color: '#333', marginBottom: 8, lineHeight: '1.4', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </h3>

          {product.discount > 0 && product.originalPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#999', marginBottom: 2 }}>
              <span style={{ textDecoration: 'line-through' }}>R$ {product.originalPrice.toFixed(2)}</span>
              <span style={{ color: '#00a650', fontWeight: 600 }}>{product.discount}% OFF</span>
            </div>
          ) : (
            <div style={{ height: 17 }} />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', color: '#333', marginBottom: 4 }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 400, lineHeight: 1 }}>R$ {integerPart}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 400, marginTop: 2, marginLeft: 1 }}>{centsPart}</span>
          </div>

          <p style={{ fontSize: '0.76rem', color: '#00a650', marginBottom: 6, fontWeight: 500 }}>
            {product.installments}
          </p>

          {product.mercadoPagoPromo ? (
            <span style={{ color: '#2962FF', background: '#E8EAF6', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 3, width: 'fit-content', marginBottom: 8 }}>
              20% OFF Saldo no Mercado Pago
            </span>
          ) : (
            <div style={{ height: 20 }} />
          )}

          <p style={{ fontSize: '0.78rem', color: '#00a650', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto', marginBottom: 6 }}>
            {product.freeShipping ? 'Frete grátis' : <span style={{ color: '#777', fontWeight: 500 }}>Frete a calcular</span>}
          </p>
        </div>
      </Link>
    </div>
  );
}

function BestSellersCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const bestSellers = MOCK_PRODUCTS.filter(p => p.badge).slice(0, 10);
  const scroll = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
  };
  const btnBase: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 44, height: 44, borderRadius: '50%',
    background: '#fff', border: '2px solid #ddd',
    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 2, transition: 'all 0.2s',
    fontSize: '1.4rem', lineHeight: 1, color: '#555', padding: 0,
  };
  return (
    <section style={{ background: '#f7f7f7', padding: '40px 0', borderBottom: '1px solid #eee' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>DESTAQUE</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111' }}>Mais Vendidos</h2>
          </div>
          <Link href="/loja" style={{ color: '#FF6B00', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}>
            Ver tudo →
          </Link>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Seta esquerda */}
          <button onClick={() => scroll('left')} aria-label="Anterior"
            style={{ ...btnBase, left: -22 }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#FF6B00'; b.style.color = '#fff'; b.style.borderColor = '#FF6B00'; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = '#fff'; b.style.color = '#555'; b.style.borderColor = '#ddd'; }}>
            ‹
          </button>

          {/* Trilha */}
          <div ref={carouselRef} style={{
            display: 'flex', gap: 16, overflowX: 'auto',
            scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
            paddingBottom: 4,
          }}>
            {bestSellers.map(product => (
              <div key={product.id} style={{ flex: '0 0 240px', scrollSnapAlign: 'start' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Seta direita */}
          <button onClick={() => scroll('right')} aria-label="Próximo"
            style={{ ...btnBase, right: -22 }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#FF6B00'; b.style.color = '#fff'; b.style.borderColor = '#FF6B00'; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = '#fff'; b.style.color = '#555'; b.style.borderColor = '#ddd'; }}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { totalItems } = useCart();
  const { user, logoutClient } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      {/* ═══ BARRA SUPERIOR ═══ */}
      <div style={{ background: '#111', color: '#ccc', fontSize: '0.78rem', padding: '7px 0', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#aaa', transition: 'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='#FF6B00')} onMouseLeave={e=>(e.currentTarget.style.color='#aaa')}>Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#aaa', transition: 'color 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.color='#FF6B00')} onMouseLeave={e=>(e.currentTarget.style.color='#aaa')}>Instagram</a>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PhoneIcon />(11) 99999-9999</span>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#22C55E', fontWeight: 600 }}><WhatsIcon />WhatsApp</a>
            <span>Seg–Sex: 08h–18h</span>
          </div>
        </div>
      </div>

      {/* ═══ HEADER ═══ */}
      <header style={{
        background: '#fff', borderBottom: '2px solid #FF6B00',
        position: 'sticky', top: 0, zIndex: 1000,
        borderBottomWidth: scrolled ? '2px' : '1px',
        transition: 'all 0.2s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0 }}>
            <Image src="/logo-branco.svg" alt="ABC Master" width={210} height={62} style={{ height: 'auto' }} />
          </Link>

          {/* Busca */}
          <form style={{ flex: 1, display: 'flex', maxWidth: 520 }} onSubmit={e => { e.preventDefault(); if (search) window.location.href = `/loja?q=${search}`; }}>
            <input
              type="text"
              placeholder="O que você procura?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: '2px solid #eee', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '10px 16px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => (e.target.style.borderColor = '#FF6B00')}
              onBlur={e => (e.target.style.borderColor = '#eee')}
            />
            <button type="submit" style={{ background: '#FF6B00', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '0 6px 6px 0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <SearchIcon />
            </button>
          </form>

          {/* Ações do header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <a href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento." target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', padding: '10px 16px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', height: 44, boxSizing: 'border-box' }}>
              <WhatsIcon /> Orçamento
            </a>

            {/* Login / Cadastro */}
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '2px solid #eee', borderRadius: 6, padding: '5px 12px', height: 44, boxSizing: 'border-box', background: '#fff' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111' }}>Olá, {user.name.split(' ')[0]}</span>
                <button onClick={logoutClient} style={{ background: 'none', border: 'none', color: '#FF6B00', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, padding: 0, outline: 'none', textAlign: 'left', textDecoration: 'underline' }}>Sair</button>
              </div>
            ) : (
              <Link href="/login"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, border: '2px solid #eee', borderRadius: 6, padding: '10px 14px', height: 44, boxSizing: 'border-box', color: '#111', fontSize: '0.82rem', fontWeight: 700 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#FF6B00'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.color = '#111'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Entrar / Cadastrar
              </Link>
            )}

            <Link href="/carrinho"
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: '2px solid #eee', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', position: 'relative', height: 44, boxSizing: 'border-box' }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = '#FF6B00'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = '#eee'; }}>
              <CartIcon />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#111', marginTop: 1 }}>Carrinho</span>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, background: '#FF6B00', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ─ Menu de Categorias ─ */}
        <div style={{ background: '#FF6B00' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', position: 'relative' }}>
            
            {/* Dropdown Todos os Produtos */}
            <div
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              style={{ position: 'relative', flexShrink: 0 }}
            >
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', color: '#fff', padding: '12px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: 'none' }}
              >
                ☰ Todos os Produtos <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, width: 220, background: '#fff',
                  border: '1px solid #eee', borderTop: 'none', zIndex: 1001, display: 'flex', flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '0 0 6px 6px', overflow: 'hidden'
                }}>
                  {[
                    { label: 'Ver Todos', href: '/loja' },
                    { label: 'Sacos Plásticos PE', href: '/loja?cat=pe' },
                    { label: 'Sacos Zip Lock', href: '/loja?cat=zip' },
                    { label: 'Sacos a Vácuo', href: '/loja?cat=vacuo' },
                  ].map(c => (
                    <Link
                      key={c.href}
                      href={c.href}
                      style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#333', borderBottom: '1px solid #f9f9f9', fontWeight: 600, display: 'block', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FF6B00'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#333'; }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <nav style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
              {CATEGORIES.map(c => (
                <Link key={c.href} href={c.href} style={{ color: '#fff', padding: '12px 16px', fontSize: '0.84rem', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', transition: 'all 0.15s', borderBottom: '2px solid transparent', opacity: 0.9 }}
                  onMouseEnter={e => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.borderBottomColor = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.borderBottomColor = 'transparent'; }}>
                  {c.label}
                </Link>
              ))}
              <Link href="/loja" style={{ color: '#fff', padding: '12px 16px', fontSize: '0.84rem', fontWeight: 700, display: 'block', marginLeft: 'auto', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', opacity: 0.9 }}
                onMouseEnter={e => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.borderBottomColor = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.borderBottomColor = 'transparent'; }}>
                Ver tudo →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* ═══ BANNER HERO ═══ */}
        <div style={{ maxWidth: 1200, margin: '24px auto 12px auto', padding: '0 20px' }}>
          <Link
            href="/loja"
            style={{
              display: 'block',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s ease-in-out'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.003)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Image
              src="/home_banner.png"
              alt="ABC Master Embalagens — Sacos Plásticos PE, Zip Lock e a Vácuo de Alta Performance. Clique para ver o catálogo completo."
              width={1160}
              height={350}
              priority
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '350px',
                objectFit: 'cover'
              }}
            />
          </Link>
        </div>

        {/* ═══ MAIS VENDIDOS — CARROSSEL ═══ */}
        <BestSellersCarousel />

        {/* ═══ CATEGORIAS DE PRODUTOS ═══ */}
        {CATEGORIES.map((cat) => {
          const catProducts = MOCK_PRODUCTS.filter(p => p.category === cat.key);
          return (
            <section key={cat.key} style={{ background: '#f7f7f7', padding: '40px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>CATEGORIA</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111' }}>{cat.label}</h2>
                  </div>
                  <Link href={cat.href} style={{ color: '#FF6B00', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}>
                    Ver tudo →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
                  {catProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#111', color: 'rgba(255,255,255,0.7)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40 }}>
          <div>
            <Image src="/logo-preto.svg" alt="ABC Master" width={170} height={50} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 20, color: 'rgba(255,255,255,0.55)' }}>
              Soluções inteligentes em sacos plásticos PE e Zip Lock para todo o Brasil. Qualidade e compromisso em primeiro lugar.
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Instagram', 'Facebook'].map(s => (
                <a key={s} href="#" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', padding: '7px 12px', borderRadius: 6, fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget).style.background = '#FF6B00'; (e.currentTarget).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget).style.color = 'rgba(255,255,255,0.6)'; }}>
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>Navegação</h4>
            {['Início', 'Loja', 'Sobre Nós', 'Contato'].map(l => (
              <Link key={l} href={l === 'Loja' ? '/loja' : `/#${l.toLowerCase().replace(' ', '-')}`} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF6B00')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>Produtos</h4>
            {['Sacos PE (Polietileno)', 'Sacos Zip Lock', 'Kits e Combos', 'Medidas Especiais'].map(l => (
              <Link key={l} href="/loja" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF6B00')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', maxWidth: 1200, margin: '0 auto' }}>
          © 2026 ABC Master Embalagens Ltda. · CNPJ: 63.570.152/0001-40 · Todos os direitos reservados.
        </div>
      </footer>

      {/* WhatsApp flutuante */}
      <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 24, background: '#25D366', color: '#fff', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, transition: 'transform 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = '')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
      </a>

      <CartDrawer />
    </>
  );
}
