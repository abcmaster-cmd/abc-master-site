import { Resend } from 'resend';

// Inicializa o cliente do Resend se a chave estiver configurada
// Caso contrário, roda em modo de simulação (escreve no console.log)
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Remetente oficial fictício ou configurável
const FROM_EMAIL = 'ABC Master Embalagens <onboarding@resend.dev>';

// Cores da NZB Embalagens / ABC Master
const COLOR_PRIMARY = '#FF6B00'; // Laranja NZB
const COLOR_DARK = '#111111'; // Preto
const COLOR_LIGHT = '#F4F4F4'; // Cinza Fundo

// Template HTML Base
function getBaseTemplate(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: ${COLOR_LIGHT};
            color: #333333;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-top: 5px solid ${COLOR_PRIMARY};
            border-bottom: 1px solid #eaeaea;
            border-left: 1px solid #eaeaea;
            border-right: 1px solid #eaeaea;
          }
          .header {
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
          }
          .logo-text {
            font-size: 22px;
            font-weight: 800;
            color: ${COLOR_DARK};
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
          }
          .logo-highlight {
            color: ${COLOR_PRIMARY};
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            color: ${COLOR_DARK};
            margin-top: 0;
            margin-bottom: 16px;
          }
          .paragraph {
            font-size: 15px;
            color: #555555;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .button-container {
            margin: 28px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: ${COLOR_PRIMARY};
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-weight: 700;
            font-size: 15px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            background-color: ${COLOR_DARK};
            padding: 30px 24px;
            text-align: center;
            font-size: 12px;
            color: #999999;
          }
          .footer a {
            color: ${COLOR_PRIMARY};
            text-decoration: none;
          }
          .table-products {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          .table-products th {
            text-align: left;
            padding: 10px;
            background-color: #fcfcfc;
            border-bottom: 2px solid #ededed;
            color: #666;
            font-weight: 600;
          }
          .table-products td {
            padding: 12px 10px;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
          }
          .pix-box {
            background-color: #F8F9FA;
            border: 1px dashed ${COLOR_PRIMARY};
            border-radius: 4px;
            padding: 16px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div style="padding: 20px 0;">
          <div class="container">
            <div class="header">
              <h1 class="logo-text">ABC MASTER <span class="logo-highlight">EMBALAGENS</span></h1>
            </div>
            <div class="content">
              ${contentHtml}
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;">ABC Master Embalagens Ltda | CNPJ: 63.570.152/0001-40</p>
              <p style="margin: 0 0 10px 0;">Rua Pastor Rubens Lopes, 55 - Piraporinha, Diadema - SP - CEP 09950-190</p>
              <p style="margin: 0;">Precisa de suporte? Fale com a gente no <a href="https://wa.me/5511999999999">WhatsApp (11) 99999-9999</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Interface de parâmetros genérica
interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

// Função genérica de envio que decide entre Resend real ou Simulação local
async function sendMail({ to, subject, html }: SendMailParams) {
  console.log(`[EMAIL SEND] Enviando e-mail para: ${to}`);
  console.log(`[EMAIL SEND] Assunto: ${subject}`);
  
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log('[EMAIL SEND] Enviado com sucesso via Resend API!', data);
      return { success: true, mode: 'resend', data };
    } catch (err) {
      console.error('[EMAIL SEND] Erro no Resend, chave inválida ou problema de domínio:', err);
      return { success: false, mode: 'resend', error: err };
    }
  } else {
    console.log('[EMAIL SEND] Modo Simulação Ativo (RESEND_API_KEY não definida).');
    return { success: true, mode: 'simulation' };
  }
}

// ── 1. EMAIL: CARRINHO ABANDONADO ──
export async function sendAbandonedCartEmail(to: string, customerName: string, items: Array<{ name: string, quantity: number, price: number }>) {
  const customer = customerName || 'Cliente';
  const tableRows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.quantity} un</td>
      <td style="text-align: right; font-weight: 600;">R$ ${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = getBaseTemplate(
    'Carrinho Abandonado',
    `
      <h2 class="title">Esqueceu alguma coisa, ${customer}?</h2>
      <p class="paragraph">
        Vimos que você adicionou itens incríveis ao seu carrinho de compras, mas acabou saindo sem finalizar seu pedido.
      </p>
      <p class="paragraph">
        Para que suas mercadorias não fiquem sem embalagens protetoras, nós separamos e guardamos seu carrinho temporariamente:
      </p>
      
      <table class="table-products">
        <thead>
          <tr>
            <th>Produto</th>
            <th style="text-align: center;">Quantidade</th>
            <th style="text-align: right;">Preço Unit.</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <p class="paragraph" style="font-weight: 600; color: #00a650;">
        💡 Para ajudar na sua decisão, ganhe 5% de desconto usando o cupom <span style="background: #E6F6EC; padding: 2px 6px; border-radius: 3px;">VOLTEI5</span> na finalização do pedido!
      </p>
      
      <div class="button-container">
        <a href="http://localhost:3000/carrinho" class="button">Recuperar Meu Carrinho</a>
      </div>
      
      <p class="paragraph">
        Se tiver alguma dúvida sobre tamanhos, espessuras ou prazos de frete, responda este e-mail ou chame nossa equipe diretamente pelo WhatsApp de suporte.
      </p>
    `
  );

  return sendMail({
    to,
    subject: '🛍️ Seu carrinho de embalagens está te esperando!',
    html
  });
}

// ── 2. EMAIL: AGUARDANDO PAGAMENTO ──
export async function sendAwaitingPaymentEmail(to: string, customerName: string, orderId: string, total: number, shippingCost: number) {
  const customer = customerName || 'Cliente';
  const pixCode = '00020101021226870014br.gov.bcb.pix2565pix.mercado-pago.com.br/qr/v2/44e4b52d-f9ca-4db4-bb1a-f10cbabcc9875204000053039865405' + total.toFixed(2) + '5802BR5925ABC_MASTER_EMBALAGENS_LT6009SAO_PAULO62070503***6304CA77';

  const html = getBaseTemplate(
    'Aguardando Pagamento',
    `
      <h2 class="title">Seu pedido #${orderId} foi recebido!</h2>
      <p class="paragraph">
        Olá, ${customer}! Seu pedido está cadastrado e estamos aguardando apenas a confirmação do pagamento para realizar o envio das suas embalagens.
      </p>
      
      <div style="background-color: #fcfcfc; border: 1px solid #ededed; padding: 18px; border-radius: 4px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; color: ${COLOR_DARK};">Resumo financeiro:</h4>
        <p style="margin: 0 0 6px 0; font-size: 14px; color: #666;">Valor dos itens: R$ ${(total - shippingCost).toFixed(2)}</p>
        <p style="margin: 0 0 6px 0; font-size: 14px; color: #666;">Valor do frete: R$ ${shippingCost.toFixed(2)}</p>
        <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${COLOR_DARK};">Total do pedido: R$ ${total.toFixed(2)}</p>
      </div>

      <h3 style="font-size: 15px; font-weight: 700; color: ${COLOR_DARK}; margin-bottom: 8px;">Pague via PIX (Aprovação Instantânea)</h3>
      <p class="paragraph">Use o Pix Copia e Cola no aplicativo do seu banco para pagar de forma imediata:</p>
      <div class="pix-box">${pixCode}</div>

      <div class="button-container">
        <a href="http://localhost:3000/checkout" class="button">Ver Meios de Pagamento</a>
      </div>
      
      <p class="paragraph">
        Atenção: A reserva de estoque dos itens do seu pacote é válida por no máximo 24 horas. Garanta seu pagamento antes que acabe!
      </p>
    `
  );

  return sendMail({
    to,
    subject: `🕒 Aguardando pagamento para o pedido #${orderId}`,
    html
  });
}

// ── 3. EMAIL: PAGAMENTO APROVADO ──
export async function sendPaymentApprovedEmail(to: string, customerName: string, orderId: string, total: number) {
  const customer = customerName || 'Cliente';

  const html = getBaseTemplate(
    'Pagamento Aprovado',
    `
      <h2 class="title" style="color: #00a650;">✓ Pagamento Confirmado!</h2>
      <p class="paragraph">
        Excelente notícia, ${customer}! O pagamento do seu pedido <strong>#${orderId}</strong> no valor de <strong>R$ ${total.toFixed(2)}</strong> foi aprovado com sucesso via Mercado Pago.
      </p>
      <p class="paragraph">
        O lote de embalagens já foi encaminhado para a expedição NZB/ABC Master. Nossa equipe está iniciando a contagem, embalagem e etiquetagem protetora da sua carga.
      </p>
      
      <div style="background-color: #E6F6EC; border-left: 4px solid #00a650; padding: 14px; border-radius: 4px; font-size: 14px; color: #1e4620; margin-bottom: 24px;">
        📌 <strong>Próximo Passo</strong>: Emissão de Nota Fiscal (NF-e). Você receberá a confirmação por e-mail com a chave de acesso da NF-e assim que concluída.
      </div>
      
      <p class="paragraph">
        Seu pacote será enviado com nota fiscal e seguro contra extravios. Agradecemos a preferência pela ABC Master Embalagens!
      </p>
    `
  );

  return sendMail({
    to,
    subject: `🎉 Pagamento aprovado para o pedido #${orderId}!`,
    html
  });
}

// ── 4. EMAIL: NOTA FISCAL EMITIDA ──
export async function sendInvoiceIssuedEmail(to: string, customerName: string, orderId: string, nfeNumber: string) {
  const customer = customerName || 'Cliente';

  const html = getBaseTemplate(
    'Nota Fiscal Emitida',
    `
      <h2 class="title">Nota Fiscal Emitida!</h2>
      <p class="paragraph">
        Olá, ${customer}! O faturamento do seu pedido <strong>#${orderId}</strong> foi finalizado no ERP Bling v3 com sucesso.
      </p>
      <p class="paragraph">
        A Nota Fiscal Eletrônica (NF-e) de número <strong>${nfeNumber}</strong> foi emitida e homologada pela SEFAZ. O arquivo XML e a DANFE PDF correspondentes estão anexados à sua conta.
      </p>
      
      <div class="button-container">
        <a href="https://www.nfe.fazenda.gov.br/" class="button" style="background-color: ${COLOR_DARK};">Visualizar Nota Fiscal</a>
      </div>

      <p class="paragraph">
        Seu lote está com a etiqueta de envio colada na caixa e alocado na doca de coleta. Ele será recolhido pela transportadora na próxima janela de coleta hoje à tarde.
      </p>
    `
  );

  return sendMail({
    to,
    subject: `📑 Nota Fiscal emitida para o pedido #${orderId}`,
    html
  });
}

// ── 5. EMAIL: PEDIDO DESPACHADO ──
export async function sendOrderShippedEmail(to: string, customerName: string, orderId: string, trackingCode: string, shippingMethod: string) {
  const customer = customerName || 'Cliente';

  const html = getBaseTemplate(
    'Pedido Despachado',
    `
      <h2 class="title" style="color: ${COLOR_PRIMARY};">🚚 Suas embalagens estão a caminho!</h2>
      <p class="paragraph">
        Prepare-se, ${customer}! O seu pedido <strong>#${orderId}</strong> foi coletado e despachado na nossa fábrica via <strong>${shippingMethod || 'Transportadora'}</strong>.
      </p>
      <p class="paragraph">
        A partir de agora, você pode rastrear a movimentação física da sua caixa de embalagens usando o código de rastreamento abaixo:
      </p>
      
      <div style="background-color: #F8F9FA; border: 1px solid #EDEDED; padding: 18px; border-radius: 4px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 14px; color: #666; display: block; margin-bottom: 6px;">Código de Rastreamento:</span>
        <strong style="font-size: 20px; color: ${COLOR_DARK}; letter-spacing: 1px; font-family: monospace;">${trackingCode}</strong>
      </div>

      <div class="button-container">
        <a href="http://localhost:3000/carrinho" class="button">Acompanhar Entrega</a>
      </div>

      <p class="paragraph">
        A previsão de chegada no seu endereço cadastrado segue o cronograma estipulado pela transportadora. Se houver qualquer dúvida ou atraso, entre em contato imediatamente com o nosso time.
      </p>
    `
  );

  return sendMail({
    to,
    subject: `🚚 Seu pedido #${orderId} foi despachado!`,
    html
  });
}
