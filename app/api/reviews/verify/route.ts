import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, email, cpf } = body;

    if (!productId || (!email && !cpf)) {
      return NextResponse.json({ verified: false, error: 'Dados insuficientes para verificação.' }, { status: 400 });
    }

    // Tenta validar no banco de dados via Prisma se o banco estiver online
    try {
      // Procura ordens que coincidam com o email ou CPF informado
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { customerData: { path: ['email'], equals: email } },
            { customerData: { path: ['cpf'], equals: cpf } },
            { customerData: { path: ['cnpj'], equals: cpf } } // Suporta CNPJ também
          ]
        },
        include: {
          items: true
        }
      });

      // Verifica se alguma ordem contém o produto correspondente e está paga (ou pendente/processando para simulação de teste)
      const hasPurchased = orders.some(order => {
        const containsProduct = order.items.some(item => item.blingId === productId);
        // Permite APPROVED ou PENDING para facilitar simulação rápida de homologação local
        const isPaidOrSimulated = order.status === 'APPROVED' || order.status === 'PENDING' || order.status === 'IN_PROCESS';
        return containsProduct && isPaidOrSimulated;
      });

      if (hasPurchased) {
        return NextResponse.json({ verified: true, source: 'database' });
      }
    } catch (dbError) {
      console.warn('[VERIFY REVIEW] Erro ao conectar ao Prisma DB, aplicando fallback para simulação local:', dbError);
      return NextResponse.json({ verified: false, fallbackLocal: true, message: 'Banco offline, validar localmente' });
    }

    return NextResponse.json({ verified: false, source: 'database' });

  } catch (err: any) {
    console.error('Erro na rota de verificação de review:', err);
    return NextResponse.json({ verified: false, error: err.message || 'Erro interno.' }, { status: 500 });
  }
}
