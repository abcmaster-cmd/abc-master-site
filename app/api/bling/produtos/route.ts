import { NextRequest, NextResponse } from 'next/server';
import { getActiveBlingToken } from '@/lib/blingTokenService';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getActiveBlingToken();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Não conectado ao Bling. Por favor, conecte sua conta nas configurações.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pagina = searchParams.get('pagina') || '1';
    const limite = searchParams.get('limite') || '50';
    const criterio = searchParams.get('criterio') || '1'; // 1 = Ativos, 2 = Inativos, etc.

    console.log(`Buscando produtos do Bling ERP (página ${pagina})...`);

    const response = await axios.get('https://api.bling.com.br/Api/v3/produtos', {
      params: {
        pagina,
        limite,
        criterio
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const blingProducts = response.data?.data || [];
    
    // Mapeia os campos da API v3 do Bling para a estrutura interna do nosso e-commerce
    const mappedProducts = blingProducts.map((p: any) => {
      // Determina categoria
      let category = 'Sacos Plásticos PE';
      const categoryDesc = p.categoriaProduto?.descricao || '';
      if (categoryDesc.toLowerCase().includes('zip') || p.nome.toLowerCase().includes('zip')) {
        category = 'Sacos Zip Lock';
      } else if (categoryDesc.toLowerCase().includes('vacuo') || categoryDesc.toLowerCase().includes('vácuo') || p.nome.toLowerCase().includes('vacuo') || p.nome.toLowerCase().includes('vácuo')) {
        category = 'Sacos a Vácuo';
      }

      // Preço e estoque
      const price = p.preco || 0.00;
      
      // Peso bruto/líquido em kg (Bling salva em kg)
      const weight = p.pesoBruto || 0.1;
      
      // Dimensões do produto (embalagem)
      const width = p.larguraProduto || 0;
      const height = p.alturaProduto || 0;
      const thickness = p.profundidadeProduto || 0; // Profundidade vira espessura/comprimento

      // Imagem padrão ou mock baseado na categoria se não houver
      let image = '/saco_pe.png';
      if (category === 'Sacos Zip Lock') image = '/saco_zip.png';
      if (category === 'Sacos a Vácuo') image = '/saco_vacuo.png';

      // Se houver anexo/imagem na API do Bling, tenta pegar a primeira
      if (p.imagens && p.imagens.length > 0 && p.imagens[0].link) {
        image = p.imagens[0].link;
      }

      return {
        id: `bling-${p.id}`,
        name: p.nome,
        sku: p.codigo || `SKU-${p.id}`,
        price: Number(price),
        originalPrice: p.precoOriginal ? Number(p.precoOriginal) : undefined,
        stock: p.estoque?.saldoVirtualTotal || p.estoque?.saldoFisicoTotal || 0,
        minStock: p.estoqueMinimo || 5,
        status: p.situacao === 'A' ? 'active' : 'inactive',
        category: category,
        description: p.descricaoCurta || 'Embalagem técnica produzida com materiais de alta qualidade para conservação e proteção de produtos.',
        image: image,
        
        // Características físicas (Produto)
        width: width > 0 ? `${width}cm` : '20cm',
        height: height > 0 ? `${height}cm` : '30cm',
        thickness: thickness > 0 ? `${thickness} micras` : '0.08 micras',
        material: p.tributacao?.origem === 5 ? 'PEBD Reciclado' : 'PEBD Virgem',
        recommendation: p.observacoes || 'Ideal para alimentos, peças e uso geral.',

        // Ficha logística para embalagem de transporte
        pkgWidth: width || 20,
        pkgHeight: height || 30,
        pkgLength: thickness || 5,
        pkgWeight: weight
      };
    });

    return NextResponse.json({
      success: true,
      pagina: Number(pagina),
      quantidade: mappedProducts.length,
      products: mappedProducts
    });

  } catch (err: any) {
    console.error('❌ Erro ao buscar produtos do Bling:', err.response?.data || err.message);
    
    // Tratamento de erro específico para token inválido ou expirado que não pôde ser renovado
    if (err.response?.status === 401) {
      return NextResponse.json({ error: 'Sessão com o Bling expirada. Por favor, conecte novamente.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Erro ao conectar ao Bling para listar produtos.', details: err.message }, { status: 500 });
  }
}
