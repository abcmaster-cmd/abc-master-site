import { NextRequest, NextResponse } from 'next/server';
import {
  sendAbandonedCartEmail,
  sendAwaitingPaymentEmail,
  sendPaymentApprovedEmail,
  sendInvoiceIssuedEmail,
  sendOrderShippedEmail
} from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type, customerName } = body;

    if (!email) {
      return NextResponse.json({ error: 'O campo email é obrigatório.' }, { status: 400 });
    }

    const name = customerName || 'Vinícius Teste';
    const mockOrderId = 'ABC-' + Math.floor(Math.random() * 90000 + 10000);
    const mockNfeNumber = '000.' + Math.floor(Math.random() * 900 + 100) + '.' + Math.floor(Math.random() * 900 + 100);
    const mockTracking = 'BR' + Math.floor(Math.random() * 900000000 + 100000000) + 'JX';

    const mockCartItems = [
      { name: '1 Kg Saco Plástico Pe 50 X 70 X 0,20 Transparente (grosso)', quantity: 2, price: 53.91 },
      { name: 'Saco Plástico Zip Lock N10 24x34cm (100 unidades)', quantity: 1, price: 79.20 }
    ];

    const results: Record<string, any> = {};

    if (type === 'abandoned' || type === 'all') {
      results.abandoned = await sendAbandonedCartEmail(email, name, mockCartItems);
    }
    
    if (type === 'awaiting_payment' || type === 'all') {
      results.awaiting_payment = await sendAwaitingPaymentEmail(email, name, mockOrderId, 187.02, 23.90);
    }

    if (type === 'payment_approved' || type === 'all') {
      results.payment_approved = await sendPaymentApprovedEmail(email, name, mockOrderId, 187.02);
    }

    if (type === 'invoice_issued' || type === 'all') {
      results.invoice_issued = await sendInvoiceIssuedEmail(email, name, mockOrderId, mockNfeNumber);
    }

    if (type === 'shipped' || type === 'all') {
      results.shipped = await sendOrderShippedEmail(email, name, mockOrderId, mockTracking, 'Jadlog Express');
    }

    const modeUsed = process.env.RESEND_API_KEY ? 'resend_api' : 'console_simulation';

    return NextResponse.json({
      success: true,
      message: type === 'all' 
        ? 'Todos os 5 e-mails transacionais da jornada de compra foram processados.' 
        : `E-mail transacional do tipo "${type}" processado com sucesso.`,
      mode: modeUsed,
      results
    });

  } catch (err: any) {
    console.error('Erro ao simular e-mails:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Erro interno no servidor.'
    }, { status: 500 });
  }
}
