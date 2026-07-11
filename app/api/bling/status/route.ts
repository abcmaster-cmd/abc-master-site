import { NextResponse } from 'next/server';
import { getBlingToken } from '@/lib/blingTokenService';

export async function GET() {
  const token = await getBlingToken();
  
  if (!token) {
    return NextResponse.json({ conectado: false });
  }

  // Verifica se o token expirou (mas indica que está conectado, pois o refresh token fará a renovação)
  const agora = new Date();
  const expirado = token.expiresAt.getTime() < agora.getTime();

  return NextResponse.json({
    conectado: true,
    expirado,
    expiresAt: token.expiresAt.toISOString()
  });
}
