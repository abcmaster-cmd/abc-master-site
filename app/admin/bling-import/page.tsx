'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getProducts, saveProducts, getInstallments, Product } from '@/lib/productDatabase';
import Link from 'next/link';

export default function BlingImportPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [existingSkus, setExistingSkus] = useState<Set<string>>(new Set());

  // Carregar SKUs locais já cadastrados
  const loadExistingProducts = () => {
    const local = getProducts();
    const skus = new Set(local.map(p => p.sku).filter(Boolean));
    setExistingSkus(skus);
  };

  // Verificar status de conexão com o Bling
  const checkConnection = async () => {
    try {
      const res = await fetch('/api/bling/status');
      const data = await res.json();
      setConnected(data.conectado);
    } catch (err) {
      console.error(err);
      setConnected(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Carregar produtos do Bling ERP
  const fetchBlingProducts = async (pageNum: number) => {
    setLoadingProducts(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/bling/produtos?pagina=${pageNum}&limite=50`);
      if (res.status === 401) {
        setConnected(false);
        throw new Error('Sessão expirada no Bling. Por favor, conecte novamente.');
      }
      
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.quantidade || 0);
        
        // Resetar seleções
        setSelectedIds({});
      } else {
        throw new Error(data.error || 'Erro ao listar produtos do Bling.');
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    checkConnection();
    loadExistingProducts();
  }, []);

  useEffect(() => {
    if (connected) {
      fetchBlingProducts(page);
    }
  }, [connected, page]);

  const toggleSelectAll = () => {
    const allSelected = products.every(p => selectedIds[p.id]);
    const newSelected: Record<string, boolean> = {};
    if (!allSelected) {
      products.forEach(p => {
        newSelected[p.id] = true;
      });
    }
    setSelectedIds(newSelected);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mapeamento padrão de um produto do Bling para a tipagem local
  const mapBlingToLocalProduct = (bp: any): Product => {
    return {
      id: bp.id.replace('bling-', 'prod-bling-') + '-' + Date.now().toString().slice(-4),
      category: bp.category === 'Sacos Zip Lock' ? 'zip' : bp.category === 'Sacos a Vácuo' ? 'vacuo' : 'pe',
      name: bp.name,
      description: bp.description,
      fullDescription: bp.description + ' Embalagem técnica importada do ERP Bling. Desenvolvida para alta resistência e excelente proteção de mercadorias B2B/B2C.',
      price: bp.price,
      originalPrice: bp.originalPrice,
      discount: bp.originalPrice && bp.originalPrice > bp.price ? Math.round(((bp.originalPrice - bp.price) / bp.originalPrice) * 100) : 0,
      badge: bp.originalPrice && bp.originalPrice > bp.price ? 'OFERTA ERP' : '',
      stock: bp.stock,
      minStock: bp.minStock || 10,
      status: bp.status,
      sales: 0,
      freeShipping: false,
      installments: getInstallments(bp.price),
      imageType: bp.category === 'Sacos Zip Lock' ? 'zip' : bp.category === 'Sacos a Vácuo' ? 'vacuo' : 'pe-grosso',
      image: bp.image,
      sku: bp.sku,
      width: bp.width.replace('cm', ''),
      height: bp.height.replace('cm', ''),
      thickness: bp.thickness.replace(' micras', ''),
      material: bp.material,
      prodWeight: bp.pkgWeight / 100, // peso aproximado unitário
      pkgWidth: bp.pkgWidth,
      pkgHeight: bp.pkgHeight,
      pkgLength: bp.pkgLength,
      pkgWeight: bp.pkgWeight,
      
      // Suporte a variações importadas do Bling ERP
      hasVariations: bp.hasVariations || false,
      attributes: bp.attributes || [{ name: 'Tamanho', options: [] }],
      variations: bp.variations || [],
      
      specifications: {
        'Material': bp.material,
        'Espessura': bp.thickness,
        'Largura': bp.width,
        'Comprimento': bp.height,
        'Código SKU': bp.sku,
        'Origem': 'Importado do Bling ERP',
        'Indicação': bp.recommendation
      }
    };
  };

  // Função para executar a importação dos produtos selecionados
  const handleImport = () => {
    const toImport = products.filter(p => selectedIds[p.id]);
    if (toImport.length === 0) {
      alert('Nenhum produto selecionado!');
      return;
    }

    try {
      const localProducts = getProducts();
      let importedCount = 0;
      let updatedCount = 0;
      const updatedList = [...localProducts];

      toImport.forEach((bp: any) => {
        const index = updatedList.findIndex(p => p.sku === bp.sku);
        const mapped = mapBlingToLocalProduct(bp);

        if (index >= 0) {
          // Atualiza mantendo o ID interno
          mapped.id = updatedList[index].id;
          mapped.sales = updatedList[index].sales;
          updatedList[index] = mapped;
          updatedCount++;
        } else {
          updatedList.push(mapped);
          importedCount++;
        }
      });

      saveProducts(updatedList);
      loadExistingProducts();
      
      setMessage({
        text: `✓ Sucesso! ${importedCount} novos produtos importados e ${updatedCount} atualizados no catálogo local.`,
        type: 'success'
      });
      setSelectedIds({});
    } catch (err: any) {
      setMessage({ text: `Falha na importação: ${err.message}`, type: 'error' });
    }
  };

  // Função para importar TODO o catálogo do Bling ERP de uma vez só
  const handleImportAll = async () => {
    if (!confirm('Deseja realmente clonar TODO o catálogo do Bling ERP? Isso substituirá dados locais de produtos com o mesmo SKU.')) {
      return;
    }

    setLoadingProducts(true);
    setMessage(null);

    try {
      // 1. Busca todos os produtos do Bling sequencialmente no backend
      const res = await fetch('/api/bling/produtos?tudo=true');
      if (res.status === 401) {
        setConnected(false);
        throw new Error('Sessão expirada no Bling. Por favor, conecte novamente.');
      }
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar os produtos do Bling.');
      }

      const allBlingProducts = data.products || [];
      if (allBlingProducts.length === 0) {
        throw new Error('Nenhum produto encontrado no Bling ERP.');
      }

      // 2. Importa e mapeia para o catálogo local
      const localProducts = getProducts();
      let importedCount = 0;
      let updatedCount = 0;
      const updatedList = [...localProducts];

      allBlingProducts.forEach((bp: any) => {
        const index = updatedList.findIndex(p => p.sku === bp.sku);
        const mapped = mapBlingToLocalProduct(bp);

        if (index >= 0) {
          mapped.id = updatedList[index].id;
          mapped.sales = updatedList[index].sales;
          updatedList[index] = mapped;
          updatedCount++;
        } else {
          updatedList.push(mapped);
          importedCount++;
        }
      });

      // 3. Salva no banco de dados local (localStorage)
      saveProducts(updatedList);
      loadExistingProducts();
      
      // Se estiver na primeira página de listagem, recarrega para atualizar
      fetchBlingProducts(page);

      setMessage({
        text: `✓ Importação Completa Concluída! ${importedCount} novos produtos adicionados e ${updatedCount} atualizados a partir do Bling ERP.`,
        type: 'success'
      });
      setSelectedIds({});
    } catch (err: any) {
      setMessage({ text: `Falha na importação total: ${err.message}`, type: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Limpar todos os vínculos com o Bling ERP
  const handleClearAllBlingLinks = () => {
    if (!confirm('Tem certeza de que deseja REMOVER O VÍNCULO de todos os anúncios com o Bling? Os anúncios continuarão existindo na loja virtual, mas a sincronização de estoque via webhook será desativada para todos eles.')) {
      return;
    }

    try {
      const localProducts = getProducts();
      const updated = localProducts.map(p => {
        const cleanProduct = {
          ...p,
          blingProductId: undefined,
          blingProductSku: undefined
        };
        if (cleanProduct.variations) {
          cleanProduct.variations = cleanProduct.variations.map(v => ({
            ...v,
            blingProductId: undefined,
            blingProductSku: undefined,
            blingProductName: undefined
          }));
        }
        return cleanProduct;
      });

      saveProducts(updated);
      alert('Vínculos com o Bling ERP removidos de todos os anúncios com sucesso!');
      window.location.reload();
    } catch (err: any) {
      alert(`Erro ao limpar vínculos: ${err.message}`);
    }
  };

  // Excluir todos os produtos importados/clonados do Bling
  const handleRemoveAllBlingClones = () => {
    if (!confirm('ATENÇÃO: Isso excluirá apenas da sua loja virtual (site) todos os anúncios que foram clonados do Bling. O cadastro físico de produtos dentro da sua conta do Bling ERP continuará 100% intacto e intocado. Deseja continuar?')) {
      return;
    }

    try {
      const localProducts = getProducts();
      const updated = localProducts.filter(p => !p.id.startsWith('bling-') && !p.id.startsWith('prod-bling-'));

      saveProducts(updated);
      alert('Todos os anúncios clonados/importados do Bling foram excluídos da loja virtual!');
      window.location.reload();
    } catch (err: any) {
      alert(`Erro ao excluir clones: ${err.message}`);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Clonar Produtos do Bling ERP</h1>
        <div className="admin-topbar-actions">
          <Link href="/admin/anuncios" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem', marginRight: 10 }}>
            ⬅ Voltar aos Anúncios
          </Link>
          {connected && (
            <>
              <button
                onClick={handleImportAll}
                className="btn"
                style={{ padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer', background: '#334155', color: '#fff', border: 'none', marginRight: 10 }}
              >
                📦 Importar Catálogo Completo
              </button>
              <button
                onClick={handleImport}
                className="btn btn-primary"
                disabled={Object.values(selectedIds).filter(Boolean).length === 0}
                style={{ padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                📥 Importar Selecionados ({Object.values(selectedIds).filter(Boolean).length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="admin-content">
        {loadingStatus ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            Verificando conexão com o Bling ERP...
          </div>
        ) : !connected ? (
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔌</div>
            <h2 style={{ marginBottom: 12, fontWeight: 700, color: 'var(--text-dark)' }}>Sua conta do Bling não está conectada</h2>
            <p style={{ color: 'var(--text-medium)', maxWidth: 500, margin: '0 auto 24px auto', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Para clonar os produtos do Bling para a loja, é necessário autorizar o aplicativo OAuth do seu e-commerce integrado ao ERP do Bling.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Link href="/admin/config?tab=integracoes" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                ⚙ Configurar Chaves (Bling)
              </Link>
              <a href="/api/bling/auth" className="btn btn-primary" style={{ padding: '12px 24px', background: '#FF6B00' }}>
                🔗 Conectar Conta do Bling
              </a>
            </div>
          </div>
        ) : (
          <div>
            {message && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 6,
                marginBottom: 20,
                fontSize: '0.9rem',
                fontWeight: 600,
                background: message.type === 'success' ? '#E6F4EA' : '#FCE8E6',
                color: message.type === 'success' ? '#137333' : '#C5221F',
                border: `1px solid ${message.type === 'success' ? '#A3E2AB' : '#F5C2C1'}`
              }}>
                {message.text}
              </div>
            )}

            {/* Painel de Gestão e Limpeza de Catálogo */}
            <div style={{ 
              background: '#FFF8F8', 
              border: '1px solid #FFE0E0', 
              borderRadius: 8, 
              padding: '16px 24px', 
              marginBottom: 20, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#C5221F', fontSize: '0.92rem', fontWeight: 700 }}>⚠️ Zona de Ações Avançadas (Catálogo)</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#666' }}>
                  Ações rápidas para desvincular o e-commerce ou excluir do site anúncios importados. <strong style={{ color: '#C5221F' }}>Nota: Estas ações modificam apenas o site e não alteram nada no seu Bling ERP.</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleClearAllBlingLinks}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#fff', border: '1px solid #C5221F', color: '#C5221F', cursor: 'pointer', fontWeight: 600, borderRadius: 4 }}
                >
                  🔗 Desvincular Todos
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAllBlingClones}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#C5221F', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, borderRadius: 4 }}
                >
                  ❌ Excluir Clonados
                </button>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {/* Barra de Filtros Rápidos / Stats */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-medium)' }}>
                  <span>Conexão ativa com Bling ERP ✓</span>
                  <span>|</span>
                  <span>Exibindo <strong>{products.length}</strong> produtos nesta página</span>
                </div>
                
                {/* Ações Rápidas */}
                <div>
                  <button 
                    onClick={() => fetchBlingProducts(page)} 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fff' }}
                  >
                    🔄 Atualizar Lista
                  </button>
                </div>
              </div>

              {/* Tabela de Produtos */}
              {loadingProducts ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
                  Carregando catálogo do Bling...
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                  Nenhum produto cadastrado foi encontrado no seu Bling ERP.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40, textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={products.length > 0 && products.every(p => selectedIds[p.id])}
                          onChange={toggleSelectAll}
                          style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ width: 70 }}>Imagem</th>
                      <th>Produto / Código SKU</th>
                      <th>Categoria Sugerida</th>
                      <th style={{ textAlign: 'right' }}>Preço de Venda</th>
                      <th style={{ textAlign: 'center' }}>Estoque Total</th>
                      <th style={{ textAlign: 'center', width: 140 }}>Status de Venda</th>
                      <th style={{ textAlign: 'center', width: 120 }}>Catálogo Local</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((bp) => {
                      const isSelected = !!selectedIds[bp.id];
                      const existsLocally = existingSkus.has(bp.sku);

                      return (
                        <tr key={bp.id} style={{ background: isSelected ? '#FFFDFB' : 'transparent' }}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(bp.id)}
                              style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                          </td>
                          <td>
                            {/* Miniatura do produto */}
                            <img
                              src={bp.image}
                              alt={bp.name}
                              style={{
                                width: 44,
                                height: 44,
                                objectFit: 'contain',
                                borderRadius: 4,
                                border: '1px solid #eee',
                                background: '#f9f9f9'
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.88rem', marginBottom: 2 }}>
                              {bp.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>
                                SKU: {bp.sku}
                              </span>
                              {bp.hasVariations && bp.variations?.length > 0 && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: 4 }}>
                                  🔗 {bp.variations.length} variações
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-medium)' }}>
                              {bp.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                            {bp.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ 
                              fontWeight: 600,
                              color: bp.stock <= bp.minStock ? 'var(--danger)' : '#137333',
                              background: bp.stock <= bp.minStock ? '#FCE8E6' : '#E6F4EA',
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: '0.8rem'
                            }}>
                              {bp.stock} un
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: bp.status === 'active' ? '#E6F4EA' : '#F1F5F9',
                              color: bp.status === 'active' ? '#137333' : '#475569'
                            }}>
                              {bp.status === 'active' ? 'Ativo no Bling' : 'Inativo no Bling'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {existsLocally ? (
                              <span style={{ fontSize: '0.78rem', color: '#137333', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <span>✓</span> Já Importado
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#888', fontStyle: 'italic' }}>
                                Não Importado
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Paginação Simples */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-medium)' }}>
                  Página <strong>{page}</strong>
                </span>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={page === 1 || loadingProducts}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ◀ Anterior
                  </button>
                  <button
                    disabled={products.length < 50 || loadingProducts}
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: products.length < 50 ? 'not-allowed' : 'pointer' }}
                  >
                    Próxima ▶
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
