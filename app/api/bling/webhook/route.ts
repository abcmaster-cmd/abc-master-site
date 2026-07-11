import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { getProductsServerSide, saveProductsServerSide } from '@/lib/productDatabase';

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
        console.log(`🔄 Sincronização via Webhook: SKU Bling: ${sku} | ID Bling: ${idBling} -> Novo Saldo: ${novoSaldo}`);

        // A. Atualizar no arquivo local products_persist.json
        try {
          const products = getProductsServerSide();
          let modificado = false;

          const updatedProducts = products.map((p: any) => {
            // Caso de Produto Simples (sem variações)
            if (!p.hasVariations) {
              const matchesBlingId = p.blingProductId && String(p.blingProductId) === String(idBling);
              const matchesBlingSku = p.blingProductSku && String(p.blingProductSku) === String(sku);
              const matchesLocalSku = !p.blingProductId && String(p.sku) === String(sku);

              if (matchesBlingId || matchesBlingSku || matchesLocalSku) {
                console.log(`📍 Sincronizando anúncio simples comercial "${p.name}" (SKU ${p.sku}) -> Novo Estoque: ${novoSaldo}`);
                modificado = true;
                return { ...p, stock: novoSaldo };
              }
            } else if (p.hasVariations && p.variations) {
              // Caso de Anúncio com Variações Comerciais (procura vínculo nos filhos)
              let variacaoModificada = false;
              
              const updatedVariations = p.variations.map((v: any) => {
                const matchesBlingId = v.blingProductId && String(v.blingProductId) === String(idBling);
                const matchesBlingSku = v.blingProductSku && String(v.blingProductSku) === String(sku);
                const matchesLocalSku = !v.blingProductId && String(v.sku) === String(sku);

                if (matchesBlingId || matchesBlingSku || matchesLocalSku) {
                  console.log(`📍 Sincronizando variação "${v.name}" do anúncio comercial "${p.name}" -> Novo Estoque: ${novoSaldo}`);
                  variacaoModificada = true;
                  modificado = true;
                  return { ...v, stock: novoSaldo };
                }
                return v;
              });

              if (variacaoModificada) {
                // Soma de estoque das variações atualizada no pai
                const totalStock = updatedVariations.reduce((sum: number, curr: any) => sum + (Number(curr.stock) || 0), 0);
                return { ...p, variations: updatedVariations, stock: totalStock };
              }
            }
            return p;
          });

          if (modificado) {
            saveProductsServerSide(updatedProducts);
            console.log(`✓ Estoque atualizado no arquivo local products_persist.json.`);
          }
        } catch (fileErr: any) {
          console.warn('⚠️ Falha ao atualizar estoque no arquivo local:', fileErr.message);
        }

        // B. Tenta atualizar no banco de dados se estiver ativo
        try {
          const dbProduct = await prisma.$executeRawUnsafe(
            `UPDATE "Product" SET "stock" = $1 WHERE "sku" = $2 OR "id" = $3`,
            novoSaldo,
            sku || '',
            idBling ? `bling-${idBling}` : ''
          );
          console.log(`✓ Sincronização do estoque via Webhook executada no Banco de Dados Postgres.`);
        } catch (dbError) {
          console.warn('⚠️ Banco de dados offline ou tabela Product não configurada. Atualização não gravada no Postgres.');
        }
      }
    }

    // 3. Processar atualização de produto
    if (entity === 'product' || event?.includes('produto')) {
      const idBling = data?.id;
      const nome = data?.nome;
      const preco = data?.preco;
      const sku = data?.codigo;

      console.log(`🔄 Atualização de dados recebida do Bling: SKU ${sku} | Nome: ${nome} | Preço: ${preco}`);
      
      // Sincroniza dados do produto no arquivo local
      try {
        if (preco !== undefined) {
          const products = getProductsServerSide();
          let modificado = false;

          const updatedProducts = products.map((p: any) => {
            if (!p.hasVariations) {
              const matchesBlingId = p.blingProductId && String(p.blingProductId) === String(idBling);
              const matchesBlingSku = p.blingProductSku && String(p.blingProductSku) === String(sku);
              if (matchesBlingId || matchesBlingSku) {
                modificado = true;
                return { ...p, originalPrice: p.price, price: Number(preco) };
              }
            } else if (p.hasVariations && p.variations) {
              let varModificada = false;
              const updatedVariations = p.variations.map((v: any) => {
                const matchesBlingId = v.blingProductId && String(v.blingProductId) === String(idBling);
                const matchesBlingSku = v.blingProductSku && String(v.blingProductSku) === String(sku);
                if (matchesBlingId || matchesBlingSku) {
                  varModificada = true;
                  modificado = true;
                  return { ...v, price: Number(preco).toFixed(2) };
                }
                return v;
              });
              if (varModificada) {
                return { ...p, variations: updatedVariations };
              }
            }
            return p;
          });

          if (modificado) {
            saveProductsServerSide(updatedProducts);
            console.log(`✓ Dados de preço atualizados no arquivo local products_persist.json.`);
          }
        }
      } catch (fileErr: any) {
        console.warn('⚠️ Falha ao salvar novos dados de produto no arquivo local:', fileErr.message);
      }

      // Tenta atualizar no banco de dados se estiver ativo
      try {
        if (sku && preco !== undefined) {
          await prisma.$executeRawUnsafe(
            `UPDATE "Product" SET "name" = $1, "price" = $2 WHERE "sku" = $3`,
            nome || '',
            Number(preco),
            sku
          );
          console.log(`✓ Sincronização do produto via Webhook executada no Banco de Dados Postgres.`);
        }
      } catch (dbError) {
        console.warn('⚠️ Banco de dados offline. Atualização do produto não persistida no Postgres.');
      }
    }

    // Responde com sucesso ao Bling para que ele não tente reenviar o webhook
    return NextResponse.json({ success: true, message: 'Evento processado' }, { status: 200 });

  } catch (err: any) {
    console.error('❌ Falha ao processar webhook do Bling:', err.message);
    return NextResponse.json({ error: 'Erro interno no processamento do webhook', details: err.message }, { status: 500 });
  }
}
