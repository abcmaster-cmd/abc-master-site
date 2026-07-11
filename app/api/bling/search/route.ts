import { NextRequest, NextResponse } from 'next/server';
import { getActiveBlingToken } from '@/lib/blingTokenService';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getActiveBlingToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Bling desconectado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    console.log(`Buscando termo "${query}" no Bling ERP para vínculo...`);

    // Busca produtos no Bling filtrando por nome ou código
    const response = await axios.get('https://api.bling.com.br/Api/v3/produtos', {
      params: {
        pesquisa: query,
        limite: 15,
        criterio: '1' // apenas produtos ativos
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const blingProducts = response.data?.data || [];
    
    // Mapeia uma lista simplificada para preencher o select/autocomplete do front-end
    const simplified = blingProducts.map((p: any) => ({
      id: String(p.id),
      name: p.nome,
      sku: p.codigo || '',
      price: p.preco || 0,
      stock: p.estoque?.saldoVirtualTotal || p.estoque?.saldoFisicoTotal || 0,
      formato: p.formato // 'S' = Simples, 'V' = Variação, etc.
    }));

    return NextResponse.json({ success: true, products: simplified });

  } catch (err: any) {
    console.error('❌ Erro ao buscar produtos para vínculo no Bling:', err.response?.data || err.message);
    return NextResponse.json({ error: 'Erro ao buscar dados no Bling.', details: err.message }, { status: 500 });
  }
}
