import { NextRequest, NextResponse } from 'next/server';
import { getActiveBlingToken } from '@/lib/blingTokenService';
import axios from 'axios';

// Funções auxiliares para mapeamento de dados do Bling
function determineCategory(name: string, categoryDesc: string = ''): string {
  const checkStr = `${name} ${categoryDesc}`.toLowerCase();
  if (checkStr.includes('zip') || checkStr.includes('fecho')) {
    return 'Sacos Zip Lock';
  } else if (checkStr.includes('vacuo') || checkStr.includes('vácuo')) {
    return 'Sacos a Vácuo';
  }
  return 'Sacos Plásticos PE';
}

function getProductImage(name: string, categoryDesc: string = '', imagens: any[] = []): string {
  if (imagens && imagens.length > 0 && imagens[0].link) {
    return imagens[0].link;
  }
  const category = determineCategory(name, categoryDesc);
  if (category === 'Sacos Zip Lock') return '/saco_zip.png';
  if (category === 'Sacos a Vácuo') return '/saco_vacuo.png';
  return '/saco_pe.png';
}

function mapSimpleProduct(p: any) {
  const price = p.preco || 0.00;
  const weight = p.pesoBruto || 0.1;
  const width = p.larguraProduto || 0;
  const height = p.alturaProduto || 0;
  const thickness = p.profundidadeProduto || 0;

  return {
    id: `bling-${p.id}`,
    name: p.nome,
    sku: p.codigo || `SKU-${p.id}`,
    price: Number(price),
    originalPrice: p.precoOriginal ? Number(p.precoOriginal) : undefined,
    stock: p.estoque?.saldoVirtualTotal || p.estoque?.saldoFisicoTotal || 0,
    minStock: p.estoqueMinimo || 5,
    status: p.situacao === 'A' ? 'active' : 'inactive',
    category: determineCategory(p.nome, p.categoriaProduto?.descricao),
    description: p.descricaoCurta || 'Embalagem técnica produzida com materiais de alta qualidade para conservação e proteção de produtos.',
    image: getProductImage(p.nome, p.categoriaProduto?.descricao, p.imagens),
    
    hasVariations: false,
    attributes: [{ name: 'Tamanho', options: [] }],
    variations: [],

    width: width > 0 ? `${width}cm` : '20cm',
    height: height > 0 ? `${height}cm` : '30cm',
    thickness: thickness > 0 ? `${thickness} micras` : '0.08 micras',
    material: p.tributacao?.origem === 5 ? 'PEBD Reciclado' : 'PEBD Virgem',
    recommendation: p.observacoes || 'Ideal para alimentos, peças e uso geral.',

    pkgWidth: width || 20,
    pkgHeight: height || 30,
    pkgLength: thickness || 5,
    pkgWeight: weight
  };
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getActiveBlingToken();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Não conectado ao Bling. Por favor, conecte sua conta nas configurações.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tudo = searchParams.get('tudo') === 'true';
    const criterio = searchParams.get('criterio') || '1'; // 1 = Ativos, 2 = Inativos, etc.
    
    let rawBlingProducts: any[] = [];

    if (tudo) {
      console.log('Iniciando carregamento COMPLETO de produtos do Bling ERP...');
      let page = 1;
      let keepFetching = true;
      const MAX_PAGES = 15; // Limite de segurança (1500 produtos) para evitar timeout no Gateway

      while (keepFetching && page <= MAX_PAGES) {
        try {
          console.log(`Buscando produtos do Bling - Página ${page}...`);
          const res = await axios.get('https://api.bling.com.br/Api/v3/produtos', {
            params: { pagina: page, limite: 100, criterio },
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
          });
          
          const pageData = res.data?.data || [];
          if (pageData.length === 0) {
            keepFetching = false;
          } else {
            rawBlingProducts = [...rawBlingProducts, ...pageData];
            page++;
            
            // Se veio menos de 100 itens, significa que é a última página
            if (pageData.length < 100) {
              keepFetching = false;
            }
          }
        } catch (pageErr: any) {
          console.error(`Erro ao carregar página ${page} do Bling:`, pageErr.message);
          keepFetching = false; // interrompe em caso de falha de rede
        }
      }
    } else {
      // Busca apenas uma única página
      const pagina = searchParams.get('pagina') || '1';
      const limite = searchParams.get('limite') || '50';
      
      console.log(`Buscando produtos do Bling - Página única ${pagina}...`);
      const response = await axios.get('https://api.bling.com.br/Api/v3/produtos', {
        params: { pagina, limite, criterio },
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
      });
      rawBlingProducts = response.data?.data || [];
    }

    console.log(`Total de registros brutos recebidos do Bling: ${rawBlingProducts.length}`);

    // --- PROCESSO DE AGRUPAMENTO DE VARIAÇÕES ---
    // No Bling v3, a listagem geral traz os pais (formato = 'V' e pai = null) e os filhos (formato = 'V' e pai.id preenchido)
    const pais = rawBlingProducts.filter((p: any) => p.formato === 'V' && !p.pai?.id);
    const filhos = rawBlingProducts.filter((p: any) => p.pai?.id);
    const simples = rawBlingProducts.filter((p: any) => p.formato !== 'V' && !p.pai?.id);

    console.log(`Processando: Pais: ${pais.length} | Filhos: ${filhos.length} | Simples: ${simples.length}`);

    const mappedProducts: any[] = [];

    // 1. Processa os produtos Pai que possuem variações Filhas associadas na resposta
    pais.forEach((pai: any) => {
      const filhosDoPai = filhos.filter((f: any) => f.pai.id === pai.id);

      if (filhosDoPai.length > 0) {
        // Mapeia as variações no padrão Variation do e-commerce
        const variationsList = filhosDoPai.map((f: any) => {
          let varName = f.nome.replace(pai.nome, '').replace(/^-/, '').trim();
          if (f.variacao?.nome) {
            varName = f.variacao.nome;
          }
          return {
            name: varName || 'Padrão',
            sku: f.codigo || `SKU-${f.id}`,
            price: Number(f.preco || pai.preco || 0).toFixed(2),
            stock: (f.estoque?.saldoVirtualTotal || f.estoque?.saldoFisicoTotal || 0).toString(),
            minStock: (f.estoqueMinimo || pai.estoqueMinimo || 5).toString()
          };
        });

        // Extrai atributos estruturados (Ex: Cor, Tamanho)
        const attrMap: Record<string, Set<string>> = {};
        filhosDoPai.forEach((f: any) => {
          const varName = f.variacao?.nome || '';
          if (varName.includes(':')) {
            const parts = varName.split(',');
            parts.forEach((part: string) => {
              const [name, val] = part.split(':');
              if (name && val) {
                const cleanName = name.trim();
                const cleanVal = val.trim();
                if (!attrMap[cleanName]) attrMap[cleanName] = new Set();
                attrMap[cleanName].add(cleanVal);
              }
            });
          } else {
            const cleanVal = varName || f.nome.replace(pai.nome, '').replace(/^-/, '').trim() || 'Padrão';
            if (!attrMap['Opção']) attrMap['Opção'] = new Set();
            attrMap['Opção'].add(cleanVal);
          }
        });

        const attributes = Object.entries(attrMap).map(([name, optionsSet]) => ({
          name,
          options: Array.from(optionsSet)
        }));

        // Consolida preço base e estoque total
        const basePrice = pai.preco || (filhosDoPai[0]?.preco || 0);
        const totalStock = filhosDoPai.reduce((sum: number, f: any) => sum + (f.estoque?.saldoVirtualTotal || f.estoque?.saldoFisicoTotal || 0), 0);
        const width = pai.larguraProduto || filhosDoPai[0]?.larguraProduto || 0;
        const height = pai.alturaProduto || filhosDoPai[0]?.alturaProduto || 0;
        const thickness = pai.profundidadeProduto || filhosDoPai[0]?.profundidadeProduto || 0;

        mappedProducts.push({
          id: `bling-${pai.id}`,
          name: pai.nome,
          sku: pai.codigo || `SKU-${pai.id}`,
          price: Number(basePrice),
          originalPrice: pai.precoOriginal ? Number(pai.precoOriginal) : undefined,
          stock: totalStock,
          minStock: pai.estoqueMinimo || 10,
          status: pai.situacao === 'A' ? 'active' : 'inactive',
          category: determineCategory(pai.nome, pai.categoriaProduto?.descricao),
          description: pai.descricaoCurta || 'Embalagem técnica com variações de tamanho/espessura cadastradas no Bling ERP.',
          image: getProductImage(pai.nome, pai.categoriaProduto?.descricao, pai.imagens),
          
          hasVariations: true,
          attributes,
          variations: variationsList,

          width: width > 0 ? `${width}cm` : '20cm',
          height: height > 0 ? `${height}cm` : '30cm',
          thickness: thickness > 0 ? `${thickness} micras` : '0.08 micras',
          material: pai.tributacao?.origem === 5 ? 'PEBD Reciclado' : 'PEBD Virgem',
          recommendation: pai.observacoes || 'Ideal para uso geral.',

          pkgWidth: width || 20,
          pkgHeight: height || 30,
          pkgLength: thickness || 5,
          pkgWeight: pai.pesoBruto || filhosDoPai[0]?.pesoBruto || 0.1
        });
      } else {
        // Se for um pai mas não vieram os filhos na listagem, importa como simples
        mappedProducts.push(mapSimpleProduct(pai));
      }
    });

    // 2. Processa os produtos simples
    simples.forEach((p: any) => {
      mappedProducts.push(mapSimpleProduct(p));
    });

    // 3. Processa filhos desgarrados (caso o pai não estivesse na lista consultada por paginação)
    filhos.forEach((f: any) => {
      const paiJaMapeado = mappedProducts.some(p => p.id === `bling-${f.pai.id}`);
      if (!paiJaMapeado) {
        // Se a variação filha veio e o pai não, mapeia ela de forma simples para não perder o produto
        mappedProducts.push(mapSimpleProduct(f));
      }
    });

    return NextResponse.json({
      success: true,
      quantidade: mappedProducts.length,
      products: mappedProducts
    });

  } catch (err: any) {
    console.error('❌ Erro na API do Bling ao processar produtos:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      return NextResponse.json({ error: 'Sessão com o Bling expirada. Por favor, conecte novamente.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao conectar ao Bling para listar produtos.', details: err.message }, { status: 500 });
  }
}
