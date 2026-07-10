import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, shipping, total } = body;

    // Em produção: criar Order no banco + preferência no Mercado Pago + pedido no Bling
    // Por agora, retornamos uma URL simulada para demonstração
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Simula delay de processamento
    await new Promise(r => setTimeout(r, 500));

    // Em produção, este seria o init_point real do Mercado Pago
    // Para demo, redirecionamos para a página de sucesso
    return NextResponse.json({
      success: true,
      orderId: `ORD-${Date.now()}`,
      initPoint: `${baseUrl}/sucesso?order_id=demo-${Date.now()}`,
      message: 'Pedido criado com sucesso (modo demo)',
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 });
  }
}
