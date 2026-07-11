'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  {
    section: 'Visão Geral',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
    ],
  },
  {
    section: 'Produtos',
    items: [
      { href: '/admin/anuncios', label: 'Anúncios', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
      { href: '/admin/bling-import', label: 'Importar do Bling', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> },
    ],
  },
  {
    section: 'Vendas',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
      { href: '/admin/clientes', label: 'Clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
      { href: '/admin/nf-e', label: 'Notas Fiscais', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { href: '/admin/config', label: 'Configurações', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
      { href: '/', label: 'Ver Site Público', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg> },
    ],
  },
];

import { useState, useEffect } from 'react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    if (isLoginPage) return;

    // IDs de pedidos aprovados em MOCK_ORDERS
    const staticApprovedIds = ['1040'];

    // Carregar pedidos adicionados localmente via simulador
    let localApprovedIds: string[] = [];
    try {
      const localOrders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
      localApprovedIds = localOrders
        .filter((o: any) => o.status === 'approved')
        .map((o: any) => o.id || o.date);
    } catch {}

    const allApprovedIds = [...staticApprovedIds, ...localApprovedIds];

    // Carregar IDs visualizados
    let seenIds: string[] = [];
    try {
      seenIds = JSON.parse(localStorage.getItem('abc_seen_approved_orders') || '[]');
    } catch {}

    const unseenCount = allApprovedIds.filter(id => !seenIds.includes(id)).length;

    if (pathname === '/admin/pedidos') {
      try {
        localStorage.setItem('abc_seen_approved_orders', JSON.stringify(allApprovedIds));
      } catch {}
      setBadgeCount(0);
    } else {
      setBadgeCount(unseenCount);
    }
  }, [pathname, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Image src="/logo-preto.svg" alt="ABC Master" width={120} height={36} />
          <p className="admin-sidebar-subtitle">PAINEL DO VENDEDOR</p>
        </div>
        <nav className="admin-nav">
          {navItems.map(section => (
            <div key={section.section} className="admin-nav-section">
              <p className="admin-nav-section-title">{section.section}</p>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link ${pathname.startsWith(item.href) && item.href !== '/' ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                  {item.label === 'Pedidos' && badgeCount > 0 && (
                    <span className="nav-badge" style={{ background: '#FF6B00', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 800, marginLeft: 'auto' }}>
                      {badgeCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8 }}>
            <div className="admin-avatar">A</div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Administrador</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>admin@abcmaster.com.br</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
