import Link from 'next/link';
import Header from '@/components/Header';

export default function SucessoPage() {
  return (
    <>
      <Header />
      <main className="result-page">
        <div className="result-card">
          <div className="result-icon success">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1>Pedido Confirmado! 🎉</h1>
          <p>Seu pagamento foi aprovado com sucesso. Em breve você receberá um e-mail com os detalhes do pedido e a nota fiscal.</p>
          <div className="result-order">
            <p>Acompanhe seu pedido pelo e-mail cadastrado ou entre em contato pelo WhatsApp.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-full">
              💬 Falar com a Equipe
            </a>
            <Link href="/loja" className="btn btn-secondary btn-full">Continuar Comprando</Link>
          </div>
        </div>
      </main>
    </>
  );
}
