'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getProducts, saveProducts, getInstallments } from '@/lib/productDatabase';

interface Attribute {
  name: string;
  options: string[];
}

interface Variation {
  name: string; // Ex: "15x20cm - 0.10mm"
  sku: string;
  price: string;
  stock: string;
  minStock: string;
  blingProductId?: string;
  blingProductSku?: string;
  blingProductName?: string;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  minStock: number;
  description: string;
  width: string;
  height: string;
  thickness: string;
  material: string;
  prodWeight?: number | string;
  image?: string;
  pkgWidth?: number | string;
  pkgHeight?: number | string;
  pkgLength?: number | string;
  pkgWeight?: number | string;
  // Variações pré-configuradas (Mocks)
  hasVariations: boolean;
  attributes: Attribute[];
  variations: Variation[];
}

const MOCK_PRODUCTS: ProductData[] = [
  {
    id: '1',
    name: 'Sacos Plásticos PE (Polietileno)',
    category: 'Sacos PE',
    sku: 'PE-010-15x20',
    price: 29.90,
    originalPrice: 34.90,
    stock: 250,
    minStock: 20,
    description: 'Sacos plásticos de Polietileno (PE) de alta qualidade para embalagem em geral.',
    width: '15',
    height: '20',
    thickness: '0.10',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    hasVariations: true,
    attributes: [
      { name: 'Tamanho', options: ['15x20cm', '20x30cm'] },
      { name: 'Espessura', options: ['0.10mm', '0.20mm'] }
    ],
    variations: [
      { name: '15x20cm - 0.10mm', sku: 'PE-010-15x20', price: '29.90', stock: '100', minStock: '10' },
      { name: '15x20cm - 0.20mm', sku: 'PE-020-15x20', price: '39.90', stock: '50', minStock: '10' },
      { name: '20x30cm - 0.10mm', sku: 'PE-010-20x30', price: '49.90', stock: '60', minStock: '10' },
      { name: '20x30cm - 0.20mm', sku: 'PE-020-20x30', price: '59.90', stock: '40', minStock: '10' },
    ]
  },
  {
    id: '2',
    name: 'Sacos Plásticos Zip Lock',
    category: 'Zip Lock',
    sku: 'ZIP-N05',
    price: 34.90,
    originalPrice: 39.90,
    stock: 180,
    minStock: 30,
    description: 'Sacos plásticos Zip Lock herméticos, práticos e duráveis.',
    width: '10',
    height: '14',
    thickness: '0.08',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    hasVariations: false,
    attributes: [{ name: 'Tamanho', options: [] }],
    variations: []
  },
  {
    id: '3',
    name: 'Sacos PE Industrial (Pacote 100un)',
    category: 'Sacos PE',
    sku: 'PE-IND-20x30',
    price: 89.90,
    originalPrice: 99.90,
    stock: 42,
    minStock: 15,
    description: 'Sacos plásticos PE reforçados para aplicação em indústrias pesadas.',
    width: '20',
    height: '30',
    thickness: '0.20',
    material: 'Polietileno de Alta Densidade (PEAD)',
    hasVariations: false,
    attributes: [{ name: 'Tamanho', options: [] }],
    variations: []
  },
  {
    id: '4',
    name: 'Kit Zip Lock Variado',
    category: 'Zip Lock',
    sku: 'ZIP-KIT-50',
    price: 59.90,
    originalPrice: 69.90,
    stock: 8,
    minStock: 10,
    description: 'Kit contendo diversos tamanhos de sacos com fecho zip lock.',
    width: 'Diversas',
    height: 'Diversas',
    thickness: '0.08',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    hasVariations: false,
    attributes: [{ name: 'Tamanho', options: [] }],
    variations: []
  },
  {
    id: '5',
    name: 'Sacos PE 0,06mm (Econômico)',
    category: 'Sacos PE',
    sku: 'PE-0006-10x15',
    price: 19.90,
    originalPrice: 24.90,
    stock: 0,
    minStock: 10,
    description: 'Sacos de PE mais finos para embalagens leves.',
    width: '10',
    height: '15',
    thickness: '0.06',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    hasVariations: false,
    attributes: [{ name: 'Tamanho', options: [] }],
    variations: []
  },
];

export default function EditarAnuncioPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  // Informações Gerais
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sacos PE');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [description, setDescription] = useState('');
  
  // Especificações Físicas do Produto
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState(''); // Comprimento do Produto (cm)
  const [thickness, setThickness] = useState('');
  const [prodWeight, setProdWeight] = useState('');
  const [material, setMaterial] = useState('');
  const [recommendation, setRecommendation] = useState(''); // Recomendação de Uso (Indicação)
  const [image, setImage] = useState(''); // Novo estado de imagem (Base64 / WebP)
  
  // Especificações Físicas da Embalagem
  const [pkgWidth, setPkgWidth] = useState('');
  const [pkgHeight, setPkgHeight] = useState('');
  const [pkgLength, setPkgLength] = useState('');
  const [pkgWeight, setPkgWeight] = useState('');

  // Controle de Variações
  const [hasVariations, setHasVariations] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([
    { name: 'Tamanho', options: [] }
  ]);
  const [newOptionInputs, setNewOptionInputs] = useState<string[]>(['']);
  const [variations, setVariations] = useState<Variation[]>([]);

  // Campos de Edição em Lote
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');
  const [bulkMinStock, setBulkMinStock] = useState('10');

  // Vínculo com o Bling ERP para produto simples
  const [blingProductId, setBlingProductId] = useState('');
  const [blingProductSku, setBlingProductSku] = useState('');
  const [blingProductName, setBlingProductName] = useState('');

  // Busca e modal para o Bling ERP
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState<number>(-1);
  const [isBlingModalOpen, setIsBlingModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Carregar dados iniciais do produto com suporte a variações
  useEffect(() => {
    if (productId) {
      const list = getProducts();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let product: any = list.find((p: any) => p.id === productId);
      if (!product) {
        product = MOCK_PRODUCTS.find(p => p.id === productId) as any;
      }

      if (product) {
        setName(product.name);
        setCategory(product.category);
        setSku(product.sku);
        setPrice(product.price.toString());
        setOriginalPrice(product.originalPrice?.toString() || '');
        setStock(product.stock.toString());
        setMinStock(product.minStock.toString());
        setDescription(product.description);
        setWidth(product.width);
        setHeight(product.height);
        setThickness(product.thickness);
        setMaterial(product.material);
        setRecommendation(product.recommendation || product.indication || product.specifications?.['Indicação'] || '');
        setProdWeight(product.prodWeight?.toString() || '');
        setImage(product.image || '');
        setPkgWidth(product.pkgWidth?.toString() || '');
        setPkgHeight(product.pkgHeight?.toString() || '');
        setPkgLength(product.pkgLength?.toString() || '');
        setPkgWeight(product.pkgWeight?.toString() || '');
        
        // Vínculo com Bling ERP para produto simples
        setBlingProductId(product.blingProductId || '');
        setBlingProductSku(product.blingProductSku || '');
        setBlingProductName(product.blingProductId ? (product.name || `Produto Bling SKU ${product.blingProductSku}`) : '');
        
        // Variações
        setHasVariations(product.hasVariations);
        if (product.attributes && product.attributes.length > 0) {
          setAttributes(product.attributes);
          setNewOptionInputs(product.attributes.map(() => ''));
        }
        if (product.variations && product.variations.length > 0) {
          // As variações já contêm blingProductId, blingProductSku, blingProductName caso vinculadas
          setVariations(product.variations);
        }
        
        setLoading(false);
      } else {
        setNotFound(true);
        setLoading(false);
      }
    }
  }, [productId]);

  // Cartesian Product
  const getCombinations = (attrs: Attribute[]): string[] => {
    const activeAttrs = attrs.filter(a => a.name.trim() !== '' && a.options.length > 0);
    if (activeAttrs.length === 0) return [];

    let results: string[][] = [[]];
    for (const attr of activeAttrs) {
      const temp: string[][] = [];
      for (const res of results) {
        for (const opt of attr.options) {
          temp.push([...res, opt]);
        }
      }
      results = temp;
    }
    return results.map(r => r.join(' - '));
  };

  // Sincronizar variações dinamicamente conforme os atributos mudam
  useEffect(() => {
    if (!hasVariations) {
      setVariations([]);
      return;
    }

    const combNames = getCombinations(attributes);
    setVariations(prev => {
      return combNames.map(name => {
        const existing = prev.find(v => v.name === name);
        if (existing) return existing;

        const cleanNameSuffix = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
        const generatedSku = sku ? `${sku}-${cleanNameSuffix}` : cleanNameSuffix;

        return {
          name,
          sku: generatedSku,
          price: price || '',
          stock: stock || '',
          minStock: minStock || '10'
        };
      });
    });
  }, [attributes, hasVariations, sku]);

  // Adicionar Atributo
  const handleAddAttribute = () => {
    if (attributes.length >= 2) {
      alert('É permitido configurar no máximo 2 atributos de variação.');
      return;
    }
    setAttributes([...attributes, { name: '', options: [] }]);
    setNewOptionInputs([...newOptionInputs, '']);
  };

  // Remover Atributo
  const handleRemoveAttribute = (idx: number) => {
    const updated = attributes.filter((_, i) => i !== idx);
    setAttributes(updated);
    const updatedInputs = newOptionInputs.filter((_, i) => i !== idx);
    setNewOptionInputs(updatedInputs);
  };

  // Adicionar Opção
  const handleAddOption = (attrIdx: number) => {
    const optVal = newOptionInputs[attrIdx].trim();
    if (!optVal) return;

    if (attributes[attrIdx].options.includes(optVal)) {
      alert('Esta opção já foi adicionada.');
      return;
    }

    const updated = [...attributes];
    updated[attrIdx].options.push(optVal);
    setAttributes(updated);

    const updatedInputs = [...newOptionInputs];
    updatedInputs[attrIdx] = '';
    setNewOptionInputs(updatedInputs);
  };

  // Remover Opção
  const handleRemoveOption = (attrIdx: number, optIdx: number) => {
    const updated = [...attributes];
    updated[attrIdx].options = updated[attrIdx].options.filter((_, i) => i !== optIdx);
    setAttributes(updated);
  };

  // Bulk Apply
  const handleBulkApply = () => {
    if (variations.length === 0) {
      alert('Adicione atributos e opções para gerar variações.');
      return;
    }
    setVariations(prev => prev.map(v => ({
      ...v,
      price: bulkPrice !== '' ? bulkPrice : v.price,
      stock: bulkStock !== '' ? bulkStock : v.stock,
      minStock: bulkMinStock !== '' ? bulkMinStock : v.minStock,
    })));
    alert('Valores em lote aplicados com sucesso na tabela abaixo!');
  // Modificar linha individual
  const handleVariationChange = (idx: number, field: keyof Variation, val: string) => {
    const updated = [...variations];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariations(updated);
  };

  // --- Métodos de Vínculo com Bling ERP ---
  const searchBlingProducts = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/bling/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar dados no Bling.');
    } finally {
      setSearching(false);
    }
  };

  const linkBlingProduct = (bp: any) => {
    if (selectedVariationIdx === -1) {
      // Vincula ao produto simples principal
      setBlingProductId(bp.id);
      setBlingProductSku(bp.sku);
      setBlingProductName(bp.name);
    } else {
      // Vincula a uma variação específica da tabela
      const updated = [...variations];
      updated[selectedVariationIdx] = {
        ...updated[selectedVariationIdx],
        blingProductId: bp.id,
        blingProductSku: bp.sku,
        blingProductName: bp.name
      };
      setVariations(updated);
    }
    setIsBlingModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const unlinkBlingProduct = (variationIdx: number = -1) => {
    if (variationIdx === -1) {
      setBlingProductId('');
      setBlingProductSku('');
      setBlingProductName('');
    } else {
      const updated = [...variations];
      updated[variationIdx] = {
        ...updated[variationIdx],
        blingProductId: undefined,
        blingProductSku: undefined,
        blingProductName: undefined
      };
      setVariations(updated);
    }
  };

  const openBlingLinkModal = (variationIdx: number = -1) => {
    setSelectedVariationIdx(variationIdx);
    setIsBlingModalOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasVariations && variations.length === 0) {
      alert('Você ativou as variações mas não adicionou nenhuma opção válida.');
      return;
    }

    if (hasVariations) {
      const invalid = variations.some(v => !v.sku || !v.price || !v.stock);
      if (invalid) {
        alert('Por favor, preencha todos os campos obrigatórios da tabela de variações.');
        return;
      }
    }

    if (typeof window !== 'undefined') {
      const currentProducts = getProducts();

      const parsePrice = (valStr: string) => {
        if (!valStr) return 0;
        const clean = valStr.replace(/\./g, '').replace(/,/g, '.');
        return parseFloat(clean) || 0;
      };

      const categoryMapping: Record<string, string> = {
        'Sacos PE': 'pe',
        'Zip Lock': 'zip',
        'Sacos a Vácuo': 'vacuo'
      };
      const savedCategory = categoryMapping[category] || category;

      // Variações limpas
      const cleanVariations = variations.map(v => ({
        ...v,
        price: parsePrice(v.price).toFixed(2),
        stock: parseInt(v.stock) || 0,
        minStock: parseInt(v.minStock) || 10
      }));

      // Procura o produto e atualiza seus campos
      const index = currentProducts.findIndex(p => p.id === productId);
      
      const updatedProduct = {
        id: productId,
        name: name,
        sku: sku,
        price: parsePrice(price),
        originalPrice: originalPrice ? parsePrice(originalPrice) : undefined,
        discount: originalPrice && parsePrice(originalPrice) > parsePrice(price)
          ? Math.round(((parsePrice(originalPrice) - parsePrice(price)) / parsePrice(originalPrice)) * 100)
          : 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 10,
        status: 'active',
        category: savedCategory,
        sales: index >= 0 ? (currentProducts[index].sales || 0) : 0,
        width: width,
        height: height,
        thickness: thickness,
        material: material,
        recommendation: recommendation,
        prodWeight: parsePrice(prodWeight),
        image: image || '',
        pkgWidth: parsePrice(pkgWidth),
        pkgHeight: parsePrice(pkgHeight),
        pkgLength: parsePrice(pkgLength),
        pkgWeight: parsePrice(pkgWeight),
        
        hasVariations,
        variations: cleanVariations,
        
        // Vínculo com Bling ERP
        blingProductId: hasVariations ? undefined : blingProductId || undefined,
        blingProductSku: hasVariations ? undefined : blingProductSku || undefined,
        
        installments: getInstallments(parsePrice(price)),
        freeShipping: false
      };

      if (index >= 0) {
        currentProducts[index] = updatedProduct;
        saveProducts(currentProducts);
      }
    }

    alert('Anúncio atualizado com sucesso!');
    router.push('/admin/anuncios');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-medium)' }}>
        <p>Carregando dados do anúncio...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h2>Anúncio não encontrado</h2>
        <p style={{ color: 'var(--text-light)' }}>O anúncio com ID {productId} não existe no sistema.</p>
        <button onClick={() => router.push('/admin/anuncios')} className="btn btn-primary">
          Voltar para Anúncios
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Editar Anúncio (#{productId})</h1>
        <div className="admin-topbar-actions">
          <button onClick={() => router.push('/admin/anuncios')} className="btn" style={{ padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer', background: '#fff', border: '1px solid var(--border)' }}>
            Voltar
          </button>
        </div>
      </div>

      <div className="admin-content" style={{ maxWidth: 860, paddingBottom: 60 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Informações Básicas */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Informações Básicas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Título do Anúncio (Ex: Saco Plástico PE 15x20cm Grosso)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', background: '#fff', fontFamily: 'inherit' }}
                  >
                    <option value="Sacos PE">Sacos Plásticos PE</option>
                    <option value="Zip Lock">Sacos Zip Lock</option>
                    <option value="Sacos a Vácuo">Sacos a Vácuo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>SKU de Controle Base</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    required
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Seção Imagem do Anúncio (Suporta WebP) */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Imagem do Anúncio</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {image ? (
                <div style={{ position: 'relative', width: 120, height: 120, border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden', background: '#F8F8F8' }}>
                  <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ width: 120, height: 120, border: '2px dashed #cbd5e1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.8rem', background: '#f8fafc' }}>
                  📷
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'inline-block', background: '#FF6B00', color: '#fff', padding: '10px 18px', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', marginBottom: 8, transition: 'background-color 0.2s' }}>
                  Escolher Foto do Produto
                  <input
                    type="file"
                    accept="image/*, image/webp"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Suporta arquivos JPG, PNG e **WEBP**. Recomendado imagem quadrada.</p>
              </div>
            </div>
          </div>

          {/* Toggle de Variações */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>Variações do Produto</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Selecione se este produto possui variações (ex: tamanho, espessura, cor).</p>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasVariations}
                  onChange={e => setHasVariations(e.target.checked)}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Possui Variações</span>
              </label>
            </div>

            {/* Configuração de Atributos e Opções */}
            {hasVariations && (
              <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 20 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Atributos de Variação</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {attributes.map((attr, attrIdx) => (
                    <div key={attrIdx} style={{ background: '#fafafa', borderRadius: 6, border: '1px solid #e2e8f0', padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#444' }}>Nome do Atributo:</span>
                          <input
                            type="text"
                            placeholder="Ex: Tamanho, Espessura"
                            value={attr.name}
                            onChange={e => {
                              const updated = [...attributes];
                              updated[attrIdx].name = e.target.value;
                              setAttributes(updated);
                            }}
                            style={{ flex: 1, maxWidth: 200, padding: '6px 10px', fontSize: '0.82rem', border: '1px solid #ccc', borderRadius: 4 }}
                          />
                        </div>
                        {attributes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attrIdx)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Remover Atributo
                          </button>
                        )}
                      </div>

                      {/* Chips/Valores já adicionados */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {attr.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            style={{
                              background: '#fff', border: '1px solid #ccc', borderRadius: 20,
                              padding: '4px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6
                            }}
                          >
                            {opt}
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(attrIdx, optIdx)}
                              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Input de Novo Valor */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Adicione um valor (Ex: 20x30cm, 0.15mm)"
                          value={newOptionInputs[attrIdx] || ''}
                          onChange={e => {
                            const updated = [...newOptionInputs];
                            updated[attrIdx] = e.target.value;
                            setNewOptionInputs(updated);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOption(attrIdx);
                            }
                          }}
                          style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', border: '1px solid #ccc', borderRadius: 4 }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddOption(attrIdx)}
                          style={{ padding: '8px 16px', background: '#3483fa', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          + Adicionar Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {attributes.length < 2 && (
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    style={{ marginTop: 16, background: '#fff', border: '1px dashed #3483fa', color: '#3483fa', borderRadius: 4, padding: '10px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center' }}
                  >
                    ➕ Adicionar Segundo Atributo de Variação
                  </button>
                )}

              </div>
            )}
          </div>

          {/* Faturamento Geral (Desabilitado se usar variações) */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)', opacity: hasVariations ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              Faturamento Geral {hasVariations && <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>(Gerenciado na tabela de variações abaixo)</span>}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Preço de Venda Geral (R$)</label>
                <input
                  type="text"
                  placeholder="Ex: 34,94 ou 34.94"
                  value={price}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setPrice(val);
                  }}
                  disabled={hasVariations}
                  required={!hasVariations}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Preço Original Geral (R$ - Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 59,90"
                  value={originalPrice}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setOriginalPrice(val);
                  }}
                  disabled={hasVariations}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Saldo em Estoque Geral</label>
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  disabled={hasVariations}
                  required={!hasVariations}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Estoque Mínimo Geral</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={minStock}
                  onChange={e => setMinStock(e.target.value)}
                  disabled={hasVariations}
                  required={!hasVariations}
                />
              </div>
            </div>
          </div>

          {/* Seção Vínculo com Bling ERP (Apenas para produto simples) */}
          {!hasVariations && (
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: 12, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                🔗 Vínculo com Estoque Físico (Bling ERP)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16 }}>
                Vincule este anúncio comercial a um produto físico cadastrado no seu Bling para sincronização automática de estoque.
              </p>
              {blingProductSku ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#E6F4EA', border: '1px solid #A3E2AB', borderRadius: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#137333', display: 'block' }}>✓ Vinculado com sucesso</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#333' }}>{blingProductName}</span>
                    <span style={{ fontSize: '0.78rem', color: '#666', display: 'block', fontFamily: 'monospace', marginTop: 2 }}>SKU Bling: {blingProductSku}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => unlinkBlingProduct(-1)}
                    style={{ padding: '6px 12px', background: '#fff', border: '1px solid #C5221F', color: '#C5221F', borderRadius: 4, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Desvincular
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>Nenhum produto físico do Bling vinculado a este anúncio.</span>
                  <button
                    type="button"
                    onClick={() => openBlingLinkModal(-1)}
                    style={{ padding: '8px 16px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                  >
                    🔗 Vincular Produto do Bling
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tabela combinatória de Variações */}
          {hasVariations && variations.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: 12, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>Variações Geradas ({variations.length})</h3>
              
              {/* Painel de Preenchimento em Lote */}
              <div style={{ background: '#FFF0E6', border: '1px solid #FFE2D1', borderRadius: 6, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>⚡ Preencher em Lote:</span>
                <input
                  type="text"
                  placeholder="Preço R$"
                  value={bulkPrice}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setBulkPrice(val);
                  }}
                  style={{ width: 110, padding: '6px 10px', fontSize: '0.82rem', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
                />
                <input
                  type="number"
                  placeholder="Estoque"
                  value={bulkStock}
                  onChange={e => setBulkStock(e.target.value)}
                  style={{ width: 100, padding: '6px 10px', fontSize: '0.82rem', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
                />
                <input
                  type="number"
                  placeholder="Est. Mínimo"
                  value={bulkMinStock}
                  onChange={e => setBulkMinStock(e.target.value)}
                  style={{ width: 100, padding: '6px 10px', fontSize: '0.82rem', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
                />
                <button
                  type="button"
                  onClick={handleBulkApply}
                  style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Aplicar
                </button>
              </div>

              {/* Tabela de Variações */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #e6e6e6', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px' }}>Especificação / Combinação</th>
                    <th>SKU da Variação *</th>
                    <th>Preço (R$) *</th>
                    <th>Estoque *</th>
                    <th>Est. Mínimo</th>
                    <th style={{ paddingRight: 14 }}>Vínculo Bling</th>
                  </tr>
                </thead>
                <tbody>
                  {variations.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#333' }}>{v.name}</td>
                      <td>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={e => handleVariationChange(idx, 'sku', e.target.value)}
                          placeholder="SKU"
                          style={{ width: '90%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: 4, fontFamily: 'monospace' }}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={v.price}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9.,]/g, '');
                            handleVariationChange(idx, 'price', val);
                          }}
                          placeholder="0,00"
                          style={{ width: '80%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: 4 }}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => handleVariationChange(idx, 'stock', e.target.value)}
                          placeholder="Ex: 50"
                          style={{ width: '80%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: 4 }}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={v.minStock}
                          onChange={e => handleVariationChange(idx, 'minStock', e.target.value)}
                          placeholder="Ex: 10"
                          style={{ width: '80%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: 4 }}
                          required
                        />
                      </td>
                      <td style={{ paddingRight: 14 }}>
                        {v.blingProductSku ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.72rem', background: '#E6F4EA', color: '#137333', padding: '4px 6px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' }} title={v.blingProductName}>
                              ✓ {v.blingProductSku}
                            </span>
                            <button
                              type="button"
                              onClick={() => unlinkBlingProduct(idx)}
                              style={{ background: 'none', border: 'none', color: '#C5221F', cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openBlingLinkModal(idx)}
                            style={{ background: 'none', border: '1px solid #FF6B00', color: '#FF6B00', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                          >
                            🔗 Vincular Bling
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Especificações Técnicas do Produto (Ficha Técnica) */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)', opacity: hasVariations ? 0.6 : 1 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              Especificações Técnicas do Produto (Ficha Técnica) {hasVariations && <span style={{ fontSize: '0.78rem', color: '#777', fontWeight: 500 }}>(Sobrescritas por variação)</span>}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Largura do Produto (cm)</label>
                <input
                  type="text"
                  placeholder="Ex: 35"
                  value={width}
                  onChange={e => setWidth(e.target.value.replace(/[^0-9.,]/g, ''))}
                  disabled={hasVariations}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Comprimento do Produto (cm)</label>
                <input
                  type="text"
                  placeholder="Ex: 55"
                  value={height}
                  onChange={e => setHeight(e.target.value.replace(/[^0-9.,]/g, ''))}
                  disabled={hasVariations}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Espessura do Produto (mm)</label>
                <input
                  type="text"
                  placeholder="Ex: 0.20"
                  value={thickness}
                  onChange={e => setThickness(e.target.value.replace(/[^0-9.,]/g, ''))}
                  disabled={hasVariations}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Peso do Produto (kg)</label>
                <input
                  type="text"
                  placeholder="Ex: 1.0 ou 3.0"
                  value={prodWeight}
                  onChange={e => setProdWeight(e.target.value.replace(/[^0-9.,]/g, ''))}
                  disabled={hasVariations}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600 }}>Material / Composição</label>
                <input
                  type="text"
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  placeholder="Ex: Polietileno de Baixa Densidade (PEBD)"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600 }}>Recomendação de Uso (Indicação)</label>
                <input
                  type="text"
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value)}
                  placeholder="Ex: Roupas, e-commerce, confecção e alimentos"
                />
              </div>
            </div>
          </div>

          {/* Especificações Físicas da Embalagem de Envio */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              Medidas da Embalagem de Envio (Logística)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Largura da Embalagem (cm)</label>
                <input
                  type="text"
                  placeholder="Ex: 25"
                  value={pkgWidth}
                  onChange={e => setPkgWidth(e.target.value.replace(/[^0-9.,]/g, ''))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Altura da Embalagem (cm)</label>
                <input
                  type="text"
                  placeholder="Ex: 10"
                  value={pkgHeight}
                  onChange={e => setPkgHeight(e.target.value.replace(/[^0-9.,]/g, ''))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Comprimento da Embalagem (cm)</label>
                <input
                  type="text"
                  placeholder="Ex: 30"
                  value={pkgLength}
                  onChange={e => setPkgLength(e.target.value.replace(/[^0-9.,]/g, ''))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Peso da Embalagem (kg)</label>
                <input
                  type="text"
                  placeholder="Ex: 0.15"
                  value={pkgWeight}
                  onChange={e => setPkgWeight(e.target.value.replace(/[^0-9.,]/g, ''))}
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="form-group" style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Descrição</h3>
            <label style={{ fontWeight: 600 }}>Descrição Detalhada do Anúncio</label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Botões do Formulário */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: 20 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/anuncios')}
              className="btn"
              style={{ padding: '12px 24px', cursor: 'pointer', background: '#fff', border: '1px solid var(--border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 24px', cursor: 'pointer', background: '#FF6B00', borderColor: '#FF6B00' }}
            >
              Salvar Alterações
            </button>
          </div>

        </form>

        {/* Modal de Vínculo com o Bling ERP */}
        {isBlingModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 1000, fontFamily: 'sans-serif'
          }}>
            <div style={{
              background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  {selectedVariationIdx === -1 
                    ? 'Vincular Anúncio ao Bling ERP' 
                    : `Vincular Variação "${variations[selectedVariationIdx]?.name}" ao Bling`}
                </h4>
                <button 
                  type="button" 
                  onClick={() => setIsBlingModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  placeholder="Busque por Nome ou SKU físico no Bling..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.88rem' }}
                  onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); searchBlingProducts(); } }}
                />
                <button 
                  type="button"
                  onClick={searchBlingProducts}
                  disabled={searching}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              <div style={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', margin: '20px 0' }}>
                    {searching ? 'Pesquisando produtos no Bling...' : 'Digite algo e clique em buscar.'}
                  </p>
                ) : (
                  searchResults.map((bp: any) => (
                    <div key={bp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid #f0f0f0', borderRadius: 6, background: '#fafafa' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333' }}>{bp.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#666', fontFamily: 'monospace', marginTop: 2 }}>SKU Bling: {bp.sku || 'Sem SKU'} | Estoque: {bp.stock} un</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => linkBlingProduct(bp)}
                        style={{ padding: '6px 12px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
