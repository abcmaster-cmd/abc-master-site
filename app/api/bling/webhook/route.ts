import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para validar a assinatura SHA256 do Bling
function verifyBlingSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.BLING_CLIENT_SECRET;
  if (!secret) {
    console.warn('⚠️ BLING_CLIENT_SECRET não configurado. Ignorando validação de assinatura do webhook.');
    return true; // Ignora se o secret não estiver definido (desenvolvimento)
  }

  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const calculatedSignature = hmac.digest('hex');

  return calculatedSignature === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-bling-signature-256');

    // 1. Validação de segurança
    if (!verifyBlingSignature(rawBody, signature)) {
      console.error('❌ Assinatura do webhook do Bling inválida!');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log('📬 Webhook do Bling recebido:', JSON.stringify(payload, null, 2));

    const { event, entity, data } = payload;

    // 2. Processar atualização de estoque
    // Payload provável no Bling v3:
    // data: { idProduto: 12345, saldo: 50, codigo: "SKU-PROD" }
    if (entity === 'stock' || event === 'stock.updated' || event?.includes('estoque')) {
      const idBling = data?.idProduto || data?.id;
      const sku = data?.codigo;
      const novoSaldo = data?.saldo !== undefined ? Number(data.saldo) : Number(data?.estoqueAtual || 0);

      if (idBling || sku) {
        console.log(`🔄 Atualização de estoque recebida: SKU ${sku} | ID Bling ${idBling} -> Novo Saldo: ${novoSaldo}`);

        // Tenta atualizar no banco de dados se estiver ativo
        try {
          // Busca e atualiza no PostgreSQL do Prisma (caso esteja em uso na VPS ou Vercel)
          // Isso funcionará assim que o banco real do Render/Hostinger estiver rodando!
          const dbProduct = await prisma.$executeRawUnsafe(
            `UPDATE "Product" SET "stock" = $1 WHERE "sku" = $2 OR "id" = $3`,
            novoSaldo,
            sku || '',
            idBling ? `bling-${idBling}` : ''
          );
          console.log(`✓ Sincronização do estoque via Webhook executada no Banco de Dados.`);
        } catch (dbError) {
          console.warn('⚠️ Banco de dados offline ou tabela Product não configurada. Atualização local de estoque não pôde ser gravada no Postgres.');
        }
      }
    }

    // 3. Processar atualização de produto
    if (entity === 'product' || event?.includes('produto')) {
      const idBling = data?.id;
      const nome = data?.nome;
      const preco = data?.preco;
      const sku = data?.codigo;

      console.log(`🔄 Atualização de produto recebida do Bling: SKU ${sku} | Nome: ${nome} | Preço: ${preco}`);
      
      // Tenta atualizar no banco de dados se estiver ativo
      try {
        if (sku && preco !== undefined) {
          await prisma.$executeRawUnsafe(
            `UPDATE "Product" SET "name" = $1, "price" = $2 WHERE "sku" = $3`,
            nome || '',
            Number(preco),
            sku
          );
          console.log(`✓ Sincronização do produto via Webhook executada no Banco de Dados.`);
        }
      } catch (dbError) {
        console.warn('⚠️ Banco de dados offline. Atualização do produto não persistida no Postgres.');
      }
    }

    // Responde com sucesso ao Bling para que ele não tente reenviar o webhook
    return NextResponse.json({ success: true, message: 'Evento processado' }, { status: 200 });

  } catch (err: any) {
    console.error('❌ Falha ao processar webhook do Bling:', err.message);
    // Retorna 500 para o Bling tentar reenviar o evento mais tarde
    return NextResponse.json({ error: 'Erro interno no processamento do webhook', details: err.message }, { status: 500 });
  }
}
