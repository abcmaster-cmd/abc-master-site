import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Instância do Prisma
const prisma = new PrismaClient();

// Caminho de fallback local no disco para armazenar o token em ambiente offline
const FALLBACK_DIR = path.join(process.cwd(), 'scratch');
const FALLBACK_PATH = path.join(FALLBACK_DIR, 'bling_token.json');

export interface BlingTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Salva o token do Bling com resiliência: tenta no banco de dados,
 * se falhar (ex: sem conexão), salva em arquivo local.
 */
export async function saveBlingToken(accessToken: string, refreshToken: string, expiresAt: Date) {
  try {
    // 1. Tenta salvar na tabela BlingToken do Prisma
    await prisma.blingToken.upsert({
      where: { id: 'bling-global-token' },
      update: { accessToken, refreshToken, expiresAt },
      create: { id: 'bling-global-token', accessToken, refreshToken, expiresAt }
    });
    console.log('✓ Token do Bling salvo com sucesso no Banco de Dados.');
  } catch (dbError) {
    // 2. Fallback caso o banco esteja inacessível
    console.warn('⚠️ Banco de dados inacessível, salvando token do Bling localmente no disco.');
    const tokenData = {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      if (!fs.existsSync(FALLBACK_DIR)) {
        fs.mkdirSync(FALLBACK_DIR, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');
      console.log('✓ Token do Bling salvo localmente em:', FALLBACK_PATH);
    } catch (fsError) {
      console.error('❌ Falha ao salvar arquivo de fallback de token:', fsError);
    }
  }
}

/**
 * Obtém o token do Bling com resiliência: tenta no banco de dados,
 * se falhar, tenta ler do arquivo de fallback local.
 */
export async function getBlingToken(): Promise<BlingTokenData | null> {
  // 1. Tenta ler do banco
  try {
    const token = await prisma.blingToken.findUnique({
      where: { id: 'bling-global-token' }
    });
    if (token) {
      return {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: new Date(token.expiresAt)
      };
    }
  } catch (dbError) {
    console.warn('⚠️ Banco de dados offline ou erro ao obter token. Lendo do arquivo local.');
  }

  // 2. Tenta ler do arquivo local
  try {
    if (fs.existsSync(FALLBACK_PATH)) {
      const raw = fs.readFileSync(FALLBACK_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: new Date(data.expiresAt)
      };
    }
  } catch (fsError) {
    console.error('❌ Falha ao ler arquivo de fallback do token:', fsError);
  }

  return null;
}

/**
 * Verifica se o token atual do Bling está expirado ou prestes a expirar (menos de 5 minutos restantes).
 */
export function isTokenExpired(expiresAt: Date): boolean {
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutos de margem
  return expiresAt.getTime() - now.getTime() < bufferTime;
}

/**
 * Renova o token do Bling usando o refresh token.
 */
export async function refreshBlingToken(refreshToken: string): Promise<BlingTokenData> {
  const clientId = process.env.BLING_CLIENT_ID;
  const clientSecret = process.env.BLING_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Configuração do Bling (Client ID / Client Secret) ausente no .env.local');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const requestBody = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  console.log('Renovando token do Bling ERP...');
  
  const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', requestBody.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    }
  });

  const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 3600));

  // Salva o novo token
  const nextRefreshToken = new_refresh_token || refreshToken;
  await saveBlingToken(access_token, nextRefreshToken, expiresAt);

  return {
    accessToken: access_token,
    refreshToken: nextRefreshToken,
    expiresAt
  };
}

/**
 * Retorna o token de acesso do Bling ativo e válido. 
 * Se estiver expirado, realiza a renovação de forma automática.
 */
export async function getActiveBlingToken(): Promise<string | null> {
  const tokenData = await getBlingToken();
  if (!tokenData) return null;

  if (isTokenExpired(tokenData.expiresAt)) {
    console.log('Token do Bling expirado. Iniciando renovação automática...');
    try {
      const refreshed = await refreshBlingToken(tokenData.refreshToken);
      return refreshed.accessToken;
    } catch (err: any) {
      console.error('❌ Falha crítica ao renovar token do Bling:', err.response?.data || err.message);
      return null;
    }
  }

  return tokenData.accessToken;
}
