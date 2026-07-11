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
        // IMPORTANTE: Se o produto tiver o ID do Bling associado (blingProductId), usamos ele para evitar erros de SKUs/descrições duplicadas.
        const blingItens = items.map((item: any) => {
          const itemPayload: any = {
            quantidade: parseInt(item.quantity) || 1,
            valor: Number(item.price)
          };

          if (item.blingProductId) {
            itemPayload.produto = {
              id: Number(item.blingProductId)
            };
          } else {
            itemPayload.codigo = item.blingProductSku || item.sku || '';
            itemPayload.descricao = item.name;
          }

          return itemPayload;
        });

        // 1. Verificar se o cliente já existe no Bling ERP pelo CPF/CNPJ, se não, cadastrá-lo
        const cpfOrCnpjLimpo = cpfOrCnpj.replace(/\D/g, '');
        let contactId = null;

        try {
          console.log(`🔍 Pesquisando contato no Bling ERP com documento: ${cpfOrCnpjLimpo}...`);
          const resSearch = await axios.get(
            `https://api.bling.com.br/Api/v3/contatos?numeroDocumento=${cpfOrCnpjLimpo}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
              }
            }
          );
          
          if (resSearch.data?.data && resSearch.data.data.length > 0) {
            contactId = resSearch.data.data[0].id;
            console.log(`✓ Contato existente encontrado no Bling. ID: ${contactId}`);
          }
        } catch (searchErr: any) {
          console.warn('⚠️ Erro ao pesquisar contato no Bling, prosseguindo para cadastrar:', searchErr.message);
        }

        if (!contactId) {
          console.log(`➕ Contato não encontrado. Cadastrando novo cliente no Bling ERP: ${customerName}...`);
          try {
            const payloadContato = {
              nome: customerName,
              codigo: cpfOrCnpjLimpo,
              tipo: isCorporate ? 'J' : 'F', // F = Fisica, J = Juridica na v3
              situacao: 'A', // A = Ativo
              numeroDocumento: cpfOrCnpjLimpo,
              telefone: address?.phone || '',
              email: email,
              endereco: {
                geral: {
                  endereco: address?.street || '',
                  numero: address?.number || '',
                  complemento: address?.complement || '',
                  bairro: address?.neighborhood || '',
                  cep: address?.cep || '',
                  municipio: address?.city || '',
                  uf: address?.state || ''
                }
              }
            };

            const resCreateContact = await axios.post(
              'https://api.bling.com.br/Api/v3/contatos',
              payloadContato,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              }
            );

            if (resCreateContact.status === 201 || resCreateContact.status === 200) {
              contactId = resCreateContact.data?.data?.id;
              console.log(`✓ Novo contato criado com sucesso no Bling ERP. ID: ${contactId}`);
            }
          } catch (createContactErr: any) {
            const errDetails = createContactErr.response?.data || createContactErr.message;
            console.error('❌ Falha ao criar contato no Bling:', JSON.stringify(errDetails));
            throw new Error('Falha ao registrar contato do cliente no Bling ERP: ' + JSON.stringify(errDetails));
          }
        }

        if (!contactId) {
          throw new Error('Não foi possível obter ou criar um ID de contato válido no Bling ERP.');
        }

        const hoje = new Date();
        const dataVenda = hoje.toISOString().split('T')[0]; // AAAA-MM-DD

        const vencimento = new Date();
        vencimento.setDate(vencimento.getDate() + 1); // +1 dia de vencimento
        const dataVencimento = vencimento.toISOString().split('T')[0]; // AAAA-MM-DD

        const totalItens = items.reduce((acc: number, item: any) => {
          return acc + (Number(item.price) * (parseInt(item.quantity) || 1));
        }, 0);

        // Monta o payload de Venda conforme API v3 do Bling referenciando o ID do contato obtido
        const payloadBling = {
          contato: {
            id: Number(contactId)
          },
          data: dataVenda,
          itens: blingItens,
          transporte: {
            valorFrete: Number(shippingCost || 0)
          },
          parcelas: [
            {
              dataVencimento: dataVencimento,
              valor: Number(totalItens.toFixed(2))
            }
          ],
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
      const errorData = blingError.response?.data || { message: blingError.message };
      console.error('❌ Falha na integração do pedido com o Bling ERP:', JSON.stringify(errorData));
      
      return NextResponse.json({
        success: true,
        orderId: createdOrderInDb?.id || idLocal || 'order-offline',
        integratedWithBling: false,
        blingOrderId: null,
        blingError: errorData
      });
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
