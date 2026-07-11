import { NextRequest, NextResponse } from 'next/server';
import { getProductsServerSide, saveProductsServerSide } from '@/lib/productDatabaseServer';

// Retorna a lista de produtos persistida no servidor
export async function GET() {
  try {
    const products = getProductsServerSide();
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao ler produtos no servidor', details: err.message }, { status: 500 });
  }
}

// Salva a lista de produtos no arquivo físico do servidor
export async function POST(req: NextRequest) {
  try {
    const products = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Formato inválido. Esperado array de produtos.' }, { status: 400 });
    }
    
    saveProductsServerSide(products);
    return NextResponse.json({ success: true, message: 'Produtos persistidos no servidor com sucesso' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao salvar produtos no servidor', details: err.message }, { status: 500 });
  }
}
