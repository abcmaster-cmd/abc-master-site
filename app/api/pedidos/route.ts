import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getActiveBlingToken } from '@/lib/blingTokenService';
import axios from 'axios';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Processando criação de novo pedido no backend:', JSON.stringify(body, null, 2));

    const {
      idLocal,
      customerName,
      email,
      cpfOrCnpj,
      isCorporate,
      items,
      total,
      shippingCost,
      shippingMethod,
      paymentMethod,
      address // { street, number, complement, neighborhood, city, state, cep }
    } = body;

    let createdOrderInDb: any = null;

    // 1. Tentar persistir no banco de dados Postgres (Prisma) se estiver ativo
    try {
      createdOrderInDb = await prisma.order.create({
        data: {
          id: idLocal || undefined, // usa o ID gerado no front ou gera um cuidadoso
          total: Number(total),
          shippingCost: Number(shippingCost || 0),
          shippingMethod: shippingMethod || '',
          status: 'APPROVED',
          customerData: {
            name: customerName,
            email: email,
            document: cpfOrCnpj,
            isCorporate: isCorporate,
            phone: address?.phone || '',
            address: address || {}
          },
          items: {
            create: items.map((item: any) => ({
              blingId: String(item.blingProductId || item.id || ''),
              name: item.name,
              variation: item.variation || {},
              quantity: parseInt(item.quantity) || 1,
              unitPrice: Number(item.price)
            }))
          }
        }
      });
      console.log(`✓ Pedido registrado no banco de dados PostgreSQL (ID: ${createdOrderInDb.id}).`);
    } catch (dbError: any) {
      console.warn('⚠️ Banco de dados offline ou tabelas não migradas. Ignorando persistência do pedido no PostgreSQL local:', dbError.message);
    }

    // 2. Tentar enviar o Pedido de Venda para o Bling ERP via API v3
    let blingOrderId: string | null = null;
    let integratedWithBling = false;

    try {
      const accessToken = await getActiveBlingToken();

      if (accessToken) {
        console.log('🔌 Conexão ativa com o Bling localizada. Enviando pedido de venda para o ERP...');

        // Formata os itens para o formato do Bling v3
        // IMPORTANTE: Mapeia o SKU de vínculo do Bling correspondente se existir no item (blingProductSku ou sku)
        const blingItens = items.map((item: any) => {
          const skuParaBling = item.blingProductSku || item.sku || '';
          return {
            codigo: skuParaBling,
            descricao: item.name,
            quantidade: parseInt(item.quantity) || 1,
            valor: Number(item.price)
          };
        });

        // Monta o payload de Venda conforme API v3 do Bling
        const payloadBling = {
          cliente: {
            nome: customerName,
            tipoPessoa: isCorporate ? 'J' : 'F',
            numeroDocumento: cpfOrCnpj.replace(/\D/g, ''),
            email: email,
            telefone: address?.phone || ''
          },
          itens: blingItens,
          transporte: {
            valorFrete: Number(shippingCost || 0)
          },
          observacoes: `Pedido #${idLocal || createdOrderInDb?.id || 'SemID'} integrado automaticamente da Loja Virtual.`
        };

        console.log('Payload de venda enviado ao Bling:', JSON.stringify(payloadBling, null, 2));

        const responseBling = await axios.post(
          'https://api.bling.com.br/Api/v3/pedidos/vendas',
          payloadBling,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (responseBling.status === 201 || responseBling.status === 200) {
          blingOrderId = String(responseBling.data?.data?.id || '');
          integratedWithBling = true;
          console.log(`✓ Pedido de venda integrado com sucesso no Bling ERP! Bling ID: ${blingOrderId}`);

          // Atualiza o pedido no banco de dados com o ID do Bling se o pedido foi criado no banco
          if (createdOrderInDb) {
            await prisma.order.update({
              where: { id: createdOrderInDb.id },
              data: { blingOrderId }
            });
            console.log(`✓ Campo blingOrderId atualizado no banco de dados para o pedido.`);
          }
        } else {
          console.error('❌ Falha na resposta da API do Bling ao criar venda:', responseBling.data);
        }
      } else {
        console.warn('⚠️ Bling desconectado ou sem token ativo. O pedido não pôde ser integrado.');
      }
    } catch (blingError: any) {
      console.error('❌ Falha na integração do pedido com o Bling ERP:', blingError.response?.data || blingError.message);
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrderInDb?.id || idLocal || 'order-offline',
      integratedWithBling,
      blingOrderId
    });

  } catch (err: any) {
    console.error('❌ Erro no processamento do pedido:', err.message);
    return NextResponse.json({ error: 'Erro interno no processamento do pedido', details: err.message }, { status: 500 });
  }
}
