import { NextRequest, NextResponse } from 'next/server';
import { saveBlingToken } from '@/lib/blingTokenService';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Erro retornado pelo Bling no redirecionamento:', error);
    return NextResponse.redirect(new URL('/admin/config?error=bling_auth_denied', req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/config?error=missing_code', req.url));
  }

  const clientId = process.env.BLING_CLIENT_ID;
  const clientSecret = process.env.BLING_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/bling/callback`;

  if (!clientId || !clientSecret) {
    console.error('Erro de configuração: BLING_CLIENT_ID ou BLING_CLIENT_SECRET ausentes no .env.local');
    return NextResponse.redirect(new URL('/admin/config?error=bling_config_missing', req.url));
  }

  try {
    // Codifica credenciais em Base64 para o cabeçalho Authorization Basic
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Corpo da requisição no formato x-www-form-urlencoded
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    });

    console.log('Trocando código de autorização do Bling por token de acesso...');
    
    const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', requestBody.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    if (!access_token || !refresh_token) {
      throw new Error('Resposta do Bling não retornou access_token ou refresh_token');
    }

    // Calcula a data de expiração real do token
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 3600));

    // Salva o token usando o serviço resiliente
    await saveBlingToken(access_token, refresh_token, expiresAt);

    console.log('✓ Bling integrado com sucesso!');
    return NextResponse.redirect(new URL('/admin/config?bling=conectado', req.url));
  } catch (err: any) {
    console.error('❌ Erro ao trocar token do Bling:', err.response?.data || err.message);
    return NextResponse.redirect(new URL(`/admin/config?error=bling_token_exchange_failed&details=${encodeURIComponent(err.message)}`, req.url));
  }
}
