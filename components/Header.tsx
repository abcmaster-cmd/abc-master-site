'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import CartDrawer from './CartDrawer';

const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const WhatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>;

const CATEGORIES = [
  { label: 'Sacos Plásticos PE', href: '/loja?cat=pe' },
  { label: 'Sacos Zip Lock', href: '/loja?cat=zip' },
  { label: 'Sacos a Vácuo', href: '/loja?cat=vacuo' },
];

export default function Header() {
  const { totalItems, openCart } = useCart();
  const { user, logoutClient } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      {/* Barra superior */}
      <div style={{ background: '#111', color: '#ccc', fontSize: '0.78rem', padding: '7px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#aaa' }}>Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#aaa' }}>Instagram</a>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>(11) 99999-9999</span>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#22C55E', fontWeight: 600 }}><WhatsIcon />WhatsApp</a>
            
            <span style={{ width: 1, height: 12, background: '#333' }} />

            {/* Sessão do Cliente no Topo */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/central-usuario" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Olá, {user.name.split(' ')[0]}</Link>
                <span style={{ color: '#333' }}>|</span>
                <Link href="/central-usuario" style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'none' }}>Meus Pedidos</Link>
                <span style={{ color: '#333' }}>|</span>
                <button onClick={logoutClient} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, padding: 0, outline: 'none' }}>Sair</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/login" style={{ color: '#aaa', textDecoration: 'none' }}>Entre</Link>
                <span style={{ color: '#333' }}>|</span>
                <Link href="/login" style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 600 }}>Cadastre-se</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header principal */}
      <header style={{ background: '#fff', borderBottom: '2px solid #FF6B00', position: 'sticky', top: 0, zIndex: 1000, borderBottomWidth: scrolled ? '2px' : '1px', transition: 'all 0.2s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ flexShrink: 0 }}>
            <Image src="/logo-branco.svg" alt="ABC Master" width={210} height={62} />
          </Link>

          <form style={{ flex: 1, display: 'flex', maxWidth: 520 }} onSubmit={e => { e.preventDefault(); if (search) window.location.href = `/loja?q=${search}`; }}>
            <input type="text" placeholder="O que você procura?" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: '2px solid #eee', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '10px 16px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => (e.target.style.borderColor = '#FF6B00')} onBlur={e => (e.target.style.borderColor = '#eee')} />
            <button type="submit" style={{ background: '#FF6B00', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '0 6px 6px 0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <SearchIcon />
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', padding: '10px 16px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', height: 44, boxSizing: 'border-box' }}>
              <WhatsIcon /> Orçamento
            </a>

            {/* Login / Cadastro */}
            {user ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <Link href="/central-usuario"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '2px solid #eee', borderRadius: 6, padding: '5px 12px', height: 44, boxSizing: 'border-box', background: '#fff' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111' }}>Minha Conta</span>
                  <span style={{ fontSize: '0.68rem', color: '#FF6B00', fontWeight: 700 }}>Meus Pedidos</span>
                </Link>
                <button onClick={logoutClient} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #eee', borderRadius: 6, padding: '5px 10px', height: 44, boxSizing: 'border-box', background: '#f9f9f9', color: '#888', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, outline: 'none' }}
                  title="Sair da Conta">
                  Sair
                </button>
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
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: '2px solid #eee', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', position: 'relative', height: 44, boxSizing: 'border-box' }}>
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

        {/* Menu de categorias */}
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
            </nav>
            <Link href="/loja" style={{ color: '#fff', padding: '12px 16px', fontSize: '0.84rem', fontWeight: 700, marginLeft: 'auto', whiteSpace: 'nowrap', borderBottom: '2px solid transparent', opacity: 0.9 }}
              onMouseEnter={e => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.borderBottomColor = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.borderBottomColor = 'transparent'; }}>
              Ver tudo →
            </Link>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
