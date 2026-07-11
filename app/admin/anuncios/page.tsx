'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, saveProducts } from '@/lib/productDatabase';
import type { Product } from '@/lib/productDatabase';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ShopeeAnunciosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      saveProducts(products);
    }
  }, [products, initialized]);
  
  // Estados de busca (Shopee Filter Grid)
  const [searchName, setSearchName] = useState('');
  const [searchSku, setSearchSku] = useState('');
  const [searchCategory, setSearchCategory] = useState('Todos');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Estados de filtro aplicados
  const [appliedName, setAppliedName] = useState('');
  const [appliedSku, setAppliedSku] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('Todos');
  const [appliedPriceMin, setAppliedPriceMin] = useState('');
  const [appliedPriceMax, setAppliedPriceMax] = useState('');

  // Abas de Status (Estilo Shopee)
  const [activeTab, setActiveTab] = useState<'Todos' | 'Ativos' | 'Esgotados' | 'Inativos'>('Todos');

  // Controle de edição inline
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inputPriceVal, setInputPriceVal] = useState<string>('');

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [inputStockVal, setInputStockVal] = useState<number>(0);

  // Checkboxes de Seleção em Massa
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Funções de Busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedName(searchName);
    setAppliedSku(searchSku);
    setAppliedCategory(searchCategory);
    setAppliedPriceMin(priceMin);
    setAppliedPriceMax(priceMax);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchSku('');
    setSearchCategory('Todos');
    setPriceMin('');
    setPriceMax('');

    setAppliedName('');
    setAppliedSku('');
    setAppliedCategory('Todos');
    setAppliedPriceMin('');
    setAppliedPriceMax('');
  };

  // Filtragem dos Anúncios
  const filteredProducts = products.filter(p => {
    const normalizeCategory = (cat: string) => {
      if (!cat) return '';
      const c = cat.toLowerCase();
      if (c.includes('pe')) return 'pe';
      if (c.includes('zip')) return 'zip';
      if (c.includes('vácuo') || c.includes('vacuo')) return 'vacuo';
      return c;
    };

    const matchesName = p.name.toLowerCase().includes(appliedName.toLowerCase());
    const matchesSku = p.sku.toLowerCase().includes(appliedSku.toLowerCase());
    const matchesCategory = appliedCategory === 'Todos' || normalizeCategory(p.category) === normalizeCategory(appliedCategory);
    const matchesPriceMin = appliedPriceMin === '' || p.price >= parseFloat(appliedPriceMin);
    const matchesPriceMax = appliedPriceMax === '' || p.price <= parseFloat(appliedPriceMax);

    const matchesSearch = matchesName && matchesSku && matchesCategory && matchesPriceMin && matchesPriceMax;

    // Filtro da Aba
    if (activeTab === 'Ativos') return matchesSearch && p.status === 'active' && p.stock > 0;
    if (activeTab === 'Esgotados') return matchesSearch && p.stock === 0;
    if (activeTab === 'Inativos') return matchesSearch && p.status === 'inactive';
    return matchesSearch;
  });

  // Contadores de abas
  const countAll = products.length;
  const countActive = products.filter(p => p.status === 'active' && p.stock > 0).length;
  const countSoldOut = products.filter(p => p.stock === 0).length;
  const countInactive = products.filter(p => p.status === 'inactive').length;

  // Ações Individuais
  const handleStockAdjust = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + amount);
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const handleSavePrice = (id: string) => {
    const val = parseFloat(inputPriceVal);
    if (!isNaN(val) && val >= 0) {
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, price: val } : p)));
    }
    setEditingPriceId(null);
  };

  const handleSaveStock = (id: string) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, stock: Math.max(0, inputStockVal) } : p)));
    setEditingStockId(null);
  };

  const handleDuplicate = (product: Product) => {
    const newId = (Math.max(...products.map(p => parseInt(p.id))) + 1).toString();
    const newProduct: Product = {
      ...product,
      id: newId,
      name: `${product.name} (Cópia)`,
      sku: `${product.sku}-cópia`,
      sales: 0,
      stock: 0,
      status: 'inactive'
    };
    setProducts(prev => [...prev, newProduct]);
    alert(`Anúncio duplicado com sucesso! Cópia gerada com o ID #${newId}.`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente deletar este anúncio?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Seleção de Checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Ações em Lote
  const handleBatchDelete = () => {
    if (confirm(`Deseja realmente deletar os ${selectedIds.length} produtos selecionados?`)) {
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  const handleBatchZeroStock = () => {
    if (confirm(`Deseja zerar o estoque dos ${selectedIds.length} produtos selecionados?`)) {
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, stock: 0 } : p));
      setSelectedIds([]);
    }
  };

  return (
    <>
      {/* Top Header Shopee */}
      <div className="admin-topbar" style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <h1 className="admin-topbar-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Meus Produtos</h1>
          <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>Gerencie, filtre e atualize o catálogo de embalagens</p>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/admin/anuncios/novo" className="btn btn-primary" style={{ padding: '10px 18px', background: '#FF6B00', borderColor: '#FF6B00', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
            ➕ Novo Produto
          </Link>
        </div>
      </div>

      <div className="admin-content" style={{ padding: '20px 24px', background: '#f6f6f6', minHeight: 'calc(100vh - 72px)' }}>
        
        {/* Painel de Filtros Avançados (Shopee Filter Grid) */}
        <div style={{ background: '#fff', padding: 24, borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', marginBottom: 16 }}>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#666', marginBottom: 6, display: 'block' }}>Nome do Produto</label>
              <input
                type="text"
                placeholder="Insira o nome"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.82rem', border: '1px solid #ddd', borderRadius: 4, width: '100%', outline: 'none' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#666', marginBottom: 6, display: 'block' }}>SKU do Produto</label>
              <input
                type="text"
                placeholder="Insira o SKU"
                value={searchSku}
                onChange={e => setSearchSku(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.82rem', border: '1px solid #ddd', borderRadius: 4, width: '100%', outline: 'none' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#666', marginBottom: 6, display: 'block' }}>Categoria</label>
              <select
                value={searchCategory}
                onChange={e => setSearchCategory(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.82rem', border: '1px solid #ddd', borderRadius: 4, width: '100%', outline: 'none', background: '#fff', height: 35 }}
              >
                <option value="Todos">Todas as Categorias</option>
                <option value="Sacos PE">Sacos PE</option>
                <option value="Zip Lock">Zip Lock</option>
                <option value="Sacos a Vácuo">Sacos a Vácuo</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#666', marginBottom: 6, display: 'block' }}>Faixa de Preço (R$)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.82rem', border: '1px solid #ddd', borderRadius: 4, width: '100%', outline: 'none' }}
                />
                <span style={{ color: '#ccc' }}>-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.82rem', border: '1px solid #ddd', borderRadius: 4, width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            {/* Botões do Filtro */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-start', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', background: '#FF6B00', borderColor: '#FF6B00', borderRadius: 4, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                Pesquisar
              </button>
              <button type="button" onClick={handleReset} className="btn" style={{ padding: '8px 24px', background: '#fff', border: '1px solid #ccc', borderRadius: 4, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', color: '#555' }}>
                Limpar Filtros
              </button>
            </div>

          </form>
        </div>

        {/* Abas de Status Shopee */}
        <div style={{ background: '#fff', borderRadius: '4px 4px 0 0', display: 'flex', borderBottom: '1px solid #f0f0f0', overflowX: 'auto' }}>
          {[
            { key: 'Todos', label: 'Todos', count: countAll },
            { key: 'Ativos', label: 'Ativos', count: countActive },
            { key: 'Esgotados', label: 'Esgotados', count: countSoldOut },
            { key: 'Inativos', label: 'Inativos / Rascunhos', count: countInactive },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setSelectedIds([]); }}
                style={{
                  padding: '16px 24px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FF6B00' : '#555',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: isActive ? '3px solid #FF6B00' : '3px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Tabela Shopee */}
        <div style={{ background: '#fff', borderRadius: '0 0 4px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          
          {/* Barra de Ações em Massa */}
          {selectedIds.length > 0 && (
            <div style={{ background: '#FFF0E6', padding: '12px 24px', borderBottom: '1px solid #FFE2D1', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                {selectedIds.length} produto(s) selecionado(s)
              </span>
              <button onClick={handleBatchZeroStock} className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#fff', border: '1px solid #FFB894', color: '#FF6B00', cursor: 'pointer', borderRadius: 4 }}>
                Zerar Estoque
              </button>
              <button onClick={handleBatchDelete} className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FFF0F0', border: '1px solid #FCA3A3', color: 'var(--danger)', cursor: 'pointer', borderRadius: 4 }}>
                Deletar Selecionados
              </button>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '14px 20px', width: 40, textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                    style={{ width: 15, height: 15, cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Produto / Identificação</th>
                <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 600, color: '#666' }}>SKU / Variação</th>
                <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Preço</th>
                <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Estoque</th>
                <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 600, color: '#666' }}>Vendas</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#999', fontSize: '0.85rem' }}>
                    Nenhum produto correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.stock > 0 && p.stock < 20;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: isSelected ? '#FAFBFD' : '#fff', transition: 'background 0.15s' }}>
                      
                      {/* Checkbox */}
                      <td style={{ padding: '16px 20px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => handleSelectOne(p.id, e.target.checked)}
                          style={{ width: 15, height: 15, cursor: 'pointer' }}
                        />
                      </td>

                      {/* Info do Produto (Thumbnail + Nome) */}
                      <td style={{ padding: '16px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* Thumbnail Real */}
                          <div style={{
                            width: 50, height: 50, borderRadius: 4, border: '1px solid #e5e5e5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', background: '#f9f9f9'
                          }}>
                            <img
                              src={
                                p.image
                                  ? p.image
                                  : p.name.toLowerCase().includes('canela')
                                  ? '/saco_canela.png'
                                  : p.category === 'Sacos PE' || p.category === 'pe'
                                  ? '/saco_pe.png'
                                  : p.category === 'Zip Lock' || p.category === 'zip'
                                  ? '/saco_zip.png'
                                  : p.category === 'Sacos a Vácuo' || p.category === 'vacuo'
                                  ? '/saco_vacuo.png'
                                  : '/saco_pe.png'
                              }
                              alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem', lineHeight: 1.3, marginBottom: 4 }} title={p.name}>
                              {p.name}
                            </p>
                            <span style={{ fontSize: '0.72rem', background: '#f3f4f6', color: '#6b7280', padding: '2px 6px', borderRadius: 4 }}>
                              ID: #{p.id} | {p.category === 'pe' ? 'Sacos PE' : p.category === 'zip' ? 'Zip Lock' : p.category === 'vacuo' ? 'Sacos a Vácuo' : p.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Especificações */}
                      <td style={{ padding: '16px 10px' }}>
                        <div>
                          <p style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600, color: '#555', marginBottom: 2 }}>{p.sku}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888' }}>
                            {p.width}x{p.height}cm | {p.thickness}mm
                          </p>
                        </div>
                      </td>

                      {/* Preço (Editável Inline) */}
                      <td style={{ padding: '16px 10px' }}>
                        {editingPriceId === p.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inputPriceVal}
                              onChange={e => setInputPriceVal(e.target.value)}
                              style={{ width: 75, padding: '4px 6px', fontSize: '0.8rem', border: '1px solid #FF6B00', borderRadius: 4, outline: 'none' }}
                              autoFocus
                            />
                            <button onClick={() => handleSavePrice(p.id)} style={{ border: 'none', background: '#FF6B00', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem' }}>✓</button>
                            <button onClick={() => setEditingPriceId(null)} style={{ border: 'none', background: '#ccc', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem' }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong style={{ color: '#333' }}>{formatCurrency(p.price)}</strong>
                            <button
                              onClick={() => { setEditingPriceId(p.id); setInputPriceVal(p.price.toString()); }}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', opacity: 0.5 }}
                              title="Editar Preço"
                              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Estoque (Ajuste rápido) */}
                      <td style={{ padding: '16px 10px' }}>
                        {editingStockId === p.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="number"
                              value={inputStockVal}
                              onChange={e => setInputStockVal(parseInt(e.target.value) || 0)}
                              style={{ width: 65, padding: '4px 6px', fontSize: '0.8rem', border: '1px solid #FF6B00', borderRadius: 4, outline: 'none', textAlign: 'center' }}
                              autoFocus
                            />
                            <button onClick={() => handleStockSave(p.id)} style={{ border: 'none', background: '#FF6B00', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem' }}>✓</button>
                            <button onClick={() => setEditingStockId(null)} style={{ border: 'none', background: '#ccc', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem' }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              onClick={() => { setEditingStockId(p.id); setInputStockVal(p.stock); }}
                              style={{
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: isOut ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'var(--success)',
                                background: isOut ? '#FEE2E2' : isLowStock ? '#FEF3C7' : '#E8F5E9',
                                padding: '4px 8px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title="Clique para digitar estoque"
                            >
                              {p.stock} un.
                              <span style={{ fontSize: '0.62rem', opacity: 0.6 }}>✏️</span>
                            </span>

                            {/* Controles de +/- */}
                            <div style={{ display: 'inline-flex', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
                              <button onClick={() => handleStockAdjust(p.id, -1)} style={{ border: 'none', background: '#fff', padding: '3px 6px', fontSize: '0.72rem', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }} title="Subtrair 1">-</button>
                              <button onClick={() => handleStockAdjust(p.id, 1)} style={{ border: 'none', background: '#fff', padding: '3px 6px', fontSize: '0.72rem', cursor: 'pointer', borderRight: '1px solid #e2e8f0' }} title="Somar 1">+</button>
                              <button onClick={() => handleStockAdjust(p.id, 10)} style={{ border: 'none', background: '#fff', padding: '3px 6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 'bold' }} title="Somar 10">+10</button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Vendas */}
                      <td style={{ padding: '16px 10px', textAlign: 'center', fontWeight: 600, color: '#4b5563' }}>
                        {p.sales} vend.
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Link href={`/admin/anuncios/${p.id}/editar`} style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDuplicate(p)}
                            style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', padding: 0, fontFamily: 'inherit' }}
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', padding: 0, fontFamily: 'inherit' }}
                          >
                            Deletar
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

        </div>
      </div>
    </>
  );
}
