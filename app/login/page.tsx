'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { loginClient, registerClient } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectPath = searchParams.get('redirect') || '/loja';

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulário de Cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginClient(loginEmail, loginPassword);
      if (res.success) {
        setSuccess('Login efetuado com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push(redirectPath);
        }, 1200);
      } else {
        setError(res.message || 'Erro ao efetuar login.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regName || !regEmail || !regCpf) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const res = await registerClient({
        name: regName,
        email: regEmail,
        cpf: regCpf,
        phone: regPhone || undefined
      });

      if (res.success) {
        setSuccess('Cadastro concluído com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push(redirectPath);
        }, 1200);
      } else {
        setError(res.message || 'Erro ao efetuar cadastro.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 145px)', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: 32 }}>
          
          {/* Logo e Título */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="/logo-branco.svg" alt="ABC Master Embalagens" style={{ height: 42, marginBottom: 12, display: 'inline-block' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', margin: 0 }}>
              {isRegister ? 'Crie sua conta na ABC Master' : 'Entre na sua conta cliente'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>
              {isRegister ? 'Preencha os dados abaixo para cadastrar-se.' : 'Informe seu e-mail e senha de acesso.'}
            </p>
          </div>

          {/* Avisos */}
          {error && (
            <div style={{ color: '#D32F2F', fontSize: '0.82rem', fontWeight: 600, padding: '10px 14px', background: '#FFEBEE', borderRadius: 4, marginBottom: 20, lineHeight: 1.4 }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ color: '#00a650', fontSize: '0.82rem', fontWeight: 600, padding: '10px 14px', background: '#E6F6EC', borderRadius: 4, marginBottom: 20, lineHeight: 1.4 }}>
              ✓ {success}
            </div>
          )}

          {/* Formulário Dinâmico */}
          {!isRegister ? (
            /* Formulário LOGIN */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 6 }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc',
                    fontSize: '0.86rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.78rem', color: '#666', fontWeight: 600 }}>
                    Senha (ou seu CPF cadastrado)
                  </label>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Digite seu CPF (apenas números) ou senha"
                  required
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc',
                    fontSize: '0.86rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#999', display: 'block', marginTop: 4 }}>
                  💡 Dica de teste: Digite seu CPF cadastrado para autenticação rápida.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 4, border: 'none',
                  background: loading ? '#ccc' : '#FF6B00', color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                  marginTop: 8
                }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#e05e00' }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#FF6B00' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            /* Formulário CADASTRO */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 6 }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  required
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc',
                    fontSize: '0.86rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 6 }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="joao@exemplo.com"
                  required
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc',
                    fontSize: '0.86rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 6 }}>
                  CPF ou CNPJ *
                </label>
                <input
                  type="text"
                  value={regCpf}
                  onChange={e => setRegCpf(e.target.value)}
                  placeholder="Ex: 123.456.789-00"
                  required
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc',
                    fontSize: '0.86rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#999', display: 'block', marginTop: 4 }}>
                  ⚠️ Importante: Use o mesmo CPF/CNPJ que utilizou em compras anteriores para que o sistema reconheça como Comprador Verificado.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 6 }}>
                  Telefone (WhatsApp)
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 4, border: '1px solid #ccc',
                    fontSize: '0.86rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 4, border: 'none',
                  background: loading ? '#ccc' : '#FF6B00', color: '#fff', fontSize: '0.88rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                  marginTop: 8
                }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#e05e00' }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#FF6B00' }}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Conta'}
              </button>
            </form>
          )}

          {/* Alternância de Modo */}
          <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid #EEE', paddingTop: 20 }}>
            <p style={{ fontSize: '0.82rem', color: '#666', margin: 0 }}>
              {isRegister ? 'Já possui uma conta?' : 'Não possui uma conta?'}
              <button
                onClick={() => {
                  setError('');
                  setIsRegister(!isRegister);
                }}
                style={{
                  background: 'none', border: 'none', color: '#FF6B00', fontWeight: 700,
                  fontSize: '0.82rem', cursor: 'pointer', marginLeft: 6, padding: 0
                }}
              >
                {isRegister ? 'Faça Login' : 'Cadastre-se grátis'}
              </button>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
