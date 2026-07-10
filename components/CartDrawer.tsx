'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatVariation(variation: Record<string, string>) {
  return Object.entries(variation).map(([k, v]) => `${k}: ${v}`).join(' | ');
}

export default function CartDrawer() {
  const { items, totalItems, subtotal, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-label="Carrinho de compras">
        <div className="cart-drawer-header">
          <h3>Meu Carrinho {totalItems > 0 && `(${totalItems})`}</h3>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Fechar carrinho">
            <XIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBagIcon />
            <p>Seu carrinho está vazio</p>
            <Link href="/loja" className="btn btn-primary" onClick={closeCart} style={{ marginTop: 8 }}>
              Ver Produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-icon">
                    <PackageIcon />
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-variation">{formatVariation(item.variation)}</p>
                    <div className="cart-item-row">
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <span className="cart-item-price">{formatCurrency(item.unitPrice * item.quantity)}</span>
                      <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Remover item">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="btn btn-primary btn-full"
                onClick={closeCart}
              >
                Finalizar Compra →
              </Link>
              <button
                className="btn btn-secondary btn-full"
                onClick={closeCart}
                style={{ marginTop: 8 }}
              >
                Continuar Comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
