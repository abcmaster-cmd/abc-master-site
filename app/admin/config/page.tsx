'use client';

import { useState } from 'react';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<'empresa' | 'integracoes' | 'frete'>('empresa');

  // Estado das configurações
  const [razaoSocial, setRazaoSocial] = useState('ABC Master Embalagens Ltda');
  const [cnpj, setCnpj] = useState('63.570.152/0001-40');
  const [ie, setIe] = useState('123.456.789.110');
  const [endereco, setEndereco] = useState('Rua Pastor Rubens Lopes, 55');
  const [bairro, setBairro] = useState('Piraporinha');
  const [cidade, setCidade] = useState('Diadema');
  const [estado, setEstado] = useState('SP');
  const [cep, setCep] = useState('09950-190');

  const [blingToken, setBlingToken] = useState('d3b07384d113edec49eaa6238ad5ff00b79d2354c7b30d31d361c47a521');
  const [mpPublicKey, setMpPublicKey] = useState('APP_USR-67e45ad2-d450-482a-9e1d-c40d04c10c12');
  const [mpAccessToken, setMpAccessToken] = useState('APP_USR-845920489502934-070915-c2901a5d625b290356c52a0951-849502');
  const [resendApiKey, setResendApiKey] = useState('re_NZBEmbalagens_83ad749cd9f2b842da310bc94');

  const [cepOrigem, setCepOrigem] = useState('09950-190');
  const [pacActive, setPacActive] = useState(true);
  const [sedexActive, setSedexActive] = useState(true);
  const [jadlogActive, setJadlogActive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Configurações salvas com sucesso!');
  };

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Configurações do Sistema</h1>
        <div className="admin-topbar-actions">
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer' }}>
            💾 Salvar Configurações
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>
          {/* Menu Lateral de Abas */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={() => setActiveTab('empresa')}
              style={{
                textAlign: 'left', padding: '12px 16px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'empresa' ? '#FFF0E6' : 'transparent',
                color: activeTab === 'empresa' ? 'var(--primary)' : 'var(--text-medium)',
                transition: 'all 0.15s'
              }}
            >
              🏢 Dados da Empresa
            </button>
            <button
              onClick={() => setActiveTab('integracoes')}
              style={{
                textAlign: 'left', padding: '12px 16px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'integracoes' ? '#FFF0E6' : 'transparent',
                color: activeTab === 'integracoes' ? 'var(--primary)' : 'var(--text-medium)',
                transition: 'all 0.15s'
              }}
            >
              🔌 Integrações / APIs
            </button>
            <button
              onClick={() => setActiveTab('frete')}
              style={{
                textAlign: 'left', padding: '12px 16px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'frete' ? '#FFF0E6' : 'transparent',
                color: activeTab === 'frete' ? 'var(--primary)' : 'var(--text-medium)',
                transition: 'all 0.15s'
              }}
            >
              🚚 Frete e Logística
            </button>
          </div>

          {/* Conteúdo da Aba */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: 32, boxShadow: 'var(--shadow-sm)' }}>
            <form onSubmit={handleSave}>
              {activeTab === 'empresa' && (
                <div>
                  <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Dados Cadastrais da Empresa</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Razão Social</label>
                      <input type="text" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>CNPJ da Empresa</label>
                      <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Inscrição Estadual (I.E.)</label>
                      <input type="text" value={ie} onChange={e => setIe(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>CEP</label>
                      <input type="text" value={cep} onChange={e => setCep(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontWeight: 600 }}>Endereço Completo</label>
                      <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Bairro</label>
                      <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Cidade</label>
                      <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Estado (UF)</label>
                      <input type="text" value={estado} onChange={e => setEstado(e.target.value)} maxLength={2} required />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integracoes' && (
                <div>
                  <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Tokens de Integração e APIs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Token Bling ERP (API v3)</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>✓ Conectado</span>
                      </label>
                      <input type="password" value={blingToken} onChange={e => setBlingToken(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Mercado Pago Public Key</label>
                      <input type="text" value={mpPublicKey} onChange={e => setMpPublicKey(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600 }}>Mercado Pago Access Token</label>
                      <input type="password" value={mpAccessToken} onChange={e => setMpAccessToken(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Resend API Key (E-mails Transacionais)</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>✓ Ativo</span>
                      </label>
                      <input type="password" value={resendApiKey} onChange={e => setResendApiKey(e.target.value)} style={{ fontFamily: 'monospace' }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'frete' && (
                <div>
                  <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Regras de Distribuição & Frete</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="form-group" style={{ maxWidth: 300 }}>
                      <label style={{ fontWeight: 600 }}>CEP de Origem (Saída das Embalagens)</label>
                      <input type="text" value={cepOrigem} onChange={e => setCepOrigem(e.target.value)} required />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                      <h4 style={{ marginBottom: 16, fontWeight: 700 }}>Transportadoras Habilitadas</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                          <input type="checkbox" checked={pacActive} onChange={e => setPacActive(e.target.checked)} style={{ width: 18, height: 18 }} />
                          Correios PAC
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                          <input type="checkbox" checked={sedexActive} onChange={e => setSedexActive(e.target.checked)} style={{ width: 18, height: 18 }} />
                          Correios SEDEX
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                          <input type="checkbox" checked={jadlogActive} onChange={e => setJadlogActive(e.target.checked)} style={{ width: 18, height: 18 }} />
                          Jadlog Express (.Package)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', cursor: 'pointer' }}>
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
