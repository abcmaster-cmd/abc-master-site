import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.BLING_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  if (!clientId) {
    return NextResponse.json({ error: 'BLING_CLIENT_ID não configurado no servidor' }, { status: 500 });
  }

  // Define um state simples para segurança CSRF
  const state = Math.random().toString(36).substring(2, 15);
  
  // URL de autorização do Bling ERP (API v3)
  const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=${state}`;

  // Redireciona o usuário para a tela de autorização do Bling
  return NextResponse.redirect(authUrl);
}
