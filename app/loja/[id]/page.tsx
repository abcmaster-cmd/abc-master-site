'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Produtos mock sincronizados com a página do catálogo
const PRODUCTS_DATABASE: Record<string, {
  id: string;
  category: string;
  name: string;
  description: string;
  fullDescription: string;
  originalPrice?: number;
  price: number;
  discount: number;
  badge: string;
  stock: number;
  freeShipping: boolean;
  installments: string;
  imageType: string;
  specifications: Record<string, string>;
}> = {
  'saco-pe-50x70': {
    id: 'saco-pe-50x70',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 50 X 70 X 0,20 Transparente (grosso)',
    description: 'Espessura reforçada de 0,20mm. Ideal para proteção de produtos industriais e comerciais pesados.',
    fullDescription: 'Os sacos plásticos de Polietileno (PE) da ABC Master são desenvolvidos com material de alta densidade e espessura especial de 0,20mm, garantindo resistência superior contra furos, rasgos e tração. Ideal para embalar peças metálicas, ferramentas, produtos industriais pesados e mercadorias que necessitam de barreira contra poeira e umidade durante transporte ou estoque. Material 100% reciclável e atóxico.',
    originalPrice: 59.90,
    price: 53.91,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 120,
    freeShipping: true,
    installments: '2x R$ 26,96 sem juros',
    imageType: 'pe-grosso',
    specifications: {
      'Material': 'Polietileno de Alta Performance (PE)',
      'Espessura': '0,20 mm (Grosso/Reforçado)',
      'Largura': '50 cm',
      'Comprimento': '70 cm',
      'Cor': 'Transparente',
      'Quantidade aproximada': 'Aprox. 30 a 35 unidades por kg',
      'Indicação': 'Uso industrial, logística, autopeças e e-commerce'
    }
  },
  'saco-pe-22x32': {
    id: 'saco-pe-22x32',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 22 X 32 X 0,06 Transparente (fino)',
    description: 'Espessura leve de 0,06mm. Excelente custo-benefício para peças leves e organizadores.',
    fullDescription: 'Sacos de polietileno de baixa densidade (PEBD) com espessura de 0,06mm. Indicados para embalagens de produtos leves como roupas, papelaria, pequenos acessórios, brindes e alimentos (material atóxico). Oferece transparência excelente para visualização rápida do conteúdo e selagem rápida em máquinas seladoras manuais ou automáticas.',
    price: 59.90,
    discount: 0,
    badge: '',
    stock: 200,
    freeShipping: true,
    installments: '2x R$ 29,95 sem juros',
    imageType: 'pe-fino',
    specifications: {
      'Material': 'Polietileno de Baixa Densidade (PEBD)',
      'Espessura': '0,06 mm (Leve/Flexível)',
      'Largura': '22 cm',
      'Comprimento': '32 cm',
      'Cor': 'Transparente Cristal',
      'Quantidade aproximada': 'Aprox. 120 a 140 unidades por kg',
      'Indicação': 'Roupas, e-commerce, confecção, alimentos e organização'
    }
  },
  'saco-pe-80x120': {
    id: 'saco-pe-80x120',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 80 X 120 X 0,20 Transparente (grosso)',
    description: 'Saco plástico de grande porte para produtos volumosos e armazenamento industrial pesado.',
    fullDescription: 'Sacos plásticos PE gigantes com largura de 80cm e altura de 120cm. Fabricados em espessura super reforçada de 0,20mm para suportar grande carga física. Muito utilizado para forração de caixas, tonéis, sacaria de grãos, embalamento de móveis, peças grandes de metalurgia e produtos agrícolas. Máxima segurança contra poeira e derramamento.',
    originalPrice: 144.33,
    price: 129.90,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 45,
    freeShipping: true,
    installments: '4x R$ 32,47 sem juros',
    imageType: 'pe-grosso',
    specifications: {
      'Material': 'Polietileno Aditivado',
      'Espessura': '0,20 mm (Extra Grosso)',
      'Largura': '80 cm',
      'Comprimento': '120 cm',
      'Cor': 'Translúcido',
      'Quantidade aproximada': 'Aprox. 8 a 10 unidades por kg',
      'Indicação': 'Fardos, forração, grãos, móveis e peças gigantes'
    }
  },
  'saco-pe-35x55': {
    id: 'saco-pe-35x55',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 35 X 55 X 0,20 Transparente (grosso)',
    description: 'Espessura grossa de 0,20mm. Perfeito para ferragens, autopeças e embalagens resistentes.',
    fullDescription: 'Os sacos plásticos grossos de Polietileno na medida de 35x55cm oferecem alta durabilidade. Perfeitos para acondicionar parafusos, conexões hidráulicas, autopeças e materiais pontiagudos que facilmente rasgariam sacos comuns. Excelente capacidade de selagem com aquecimento.',
    originalPrice: 59.90,
    price: 53.91,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 80,
    freeShipping: true,
    installments: '2x R$ 26,96 sem juros',
    imageType: 'pe-grosso',
    specifications: {
      'Material': 'Polietileno de Alta Performance (PE)',
      'Espessura': '0,20 mm (Grosso/Reforçado)',
      'Largura': '35 cm',
      'Comprimento': '55 cm',
      'Cor': 'Transparente',
      'Quantidade aproximada': 'Aprox. 45 a 50 unidades por kg',
      'Indicação': 'Ferragens, autopeças, construção civil e manufatura'
    }
  },
  'sacos-zip-n05': {
    id: 'sacos-zip-n05',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N05 10x14cm (100 unidades)',
    description: 'Sacos herméticos com trilho deslizante. Excelente vedação para conservação e alimentos.',
    fullDescription: 'Sacos plásticos Zip Lock (fechamento por trilho hermético). Pacote lacrado de fábrica com 100 unidades. Perfeito para armazenar porções de alimentos, sementes, bijuterias, peças de reposição de eletrônicos, parafusos e utilidades domésticas. O zíper de fechamento é macio para abrir e resistente a vazamentos de ar.',
    price: 34.90,
    discount: 0,
    badge: 'MAIS VENDIDO',
    stock: 350,
    freeShipping: false,
    installments: '1x R$ 34,90 sem juros',
    imageType: 'zip',
    specifications: {
      'Material': 'Polietileno de Baixa Densidade (PEBD)',
      'Fechamento': 'Zíper de Pressão (Hermético)',
      'Largura': '10 cm',
      'Comprimento': '14 cm',
      'Espessura': '0,08 mm (Reforçado para Zip)',
      'Quantidade por pacote': '100 unidades',
      'Indicação': 'Laboratórios, alimentos, ferragens, bijuterias e eletrônicos'
    }
  },
  'sacos-zip-n10': {
    id: 'sacos-zip-n10',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N10 24x34cm (100 unidades)',
    description: 'Tamanho grande para documentos, roupas e organização geral com fechamento hermético.',
    fullDescription: 'Sacos Zip gigantes tamanho N10 (24x34cm), ideais para acondicionar camisas, casacos finos, manuais, documentos importantes, cabos e acessórios eletrônicos grandes. Protege contra poeira, traças e umidade. Fabricação resistente de longa duração.',
    originalPrice: 88.00,
    price: 79.20,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 90,
    freeShipping: true,
    installments: '3x R$ 26,40 sem juros',
    imageType: 'zip',
    specifications: {
      'Material': 'Polietileno Hermético',
      'Fechamento': 'Zíper de Pressão Flexível',
      'Largura': '24 cm',
      'Comprimento': '34 cm',
      'Espessura': '0,09 mm',
      'Quantidade por pacote': '100 unidades',
      'Indicação': 'Roupas, e-commerce, documentos A4, manuais e proteção'
    }
  },
  'saco-vacuo-20x30': {
    id: 'saco-vacuo-20x30',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 20 X 30 cm (100 unidades)',
    description: 'Alta barreira contra oxigênio e umidade. Ideal para conservação de alimentos frios, carnes e queijos.',
    fullDescription: 'Os sacos de embalagem a vácuo gofrados (com ranhuras) da ABC Master garantem a conservação de alimentos por até 5x mais tempo. Fabricados com Nylon poli de alta barreira, são livres de BPA e perfeitos para uso em seladoras a vácuo domésticas ou profissionais. Ideal para restaurantes, açougues, laticínios ou uso residencial na conservação de queijos, carnes, embutidos e legumes.',
    originalPrice: 59.90,
    price: 49.90,
    discount: 16,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 140,
    freeShipping: true,
    installments: '2x R$ 24,95 sem juros',
    imageType: 'vacuo',
    specifications: {
      'Material': 'Nylon Poli de Alta Resistência (Livre de BPA)',
      'Tipo': 'Gofrado (com ranhuras para melhor extração de ar)',
      'Largura': '20 cm',
      'Comprimento': '30 cm',
      'Compatibilidade': 'Compatível com todas as seladoras a vácuo do mercado',
      'Quantidade por pacote': '100 unidades',
      'Indicação': 'Alimentos frescos, congelados, carnes, laticínios e cozimento sous-vide'
    }
  },
  'saco-vacuo-30x40': {
    id: 'saco-vacuo-30x40',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 30 X 40 cm (100 unidades)',
    description: 'Tamanho médio-grande para porções maiores. Certificado livre de BPA para contato com alimentos.',
    fullDescription: 'Sacos para vácuo gofrados de grande escala medindo 30x40cm. Excelente barreira protetora para conservar peças inteiras de carne, costela, queijos inteiros e peixes. Ideais para congelamento a longo prazo impedindo a queima pelo frio (freezer burn). Cozimento seguro em banho-maria (sous-vide).',
    price: 79.90,
    discount: 0,
    badge: 'NOVIDADE',
    stock: 95,
    freeShipping: true,
    installments: '3x R$ 26,63 sem juros',
    imageType: 'vacuo',
    specifications: {
      'Material': 'Coextrusado Nylon Poli (BPA Free)',
      'Tipo': 'Ranhuras de sucção de alta vazão',
      'Largura': '30 cm',
      'Comprimento': '40 cm',
      'Garantia de temperatura': 'Suporta até 100°C (adequado para sous-vide)',
      'Quantidade por pacote': '100 unidades',
      'Indicação': 'Grandes cortes de carne, laticínios industriais e estocagem'
    }
  }
};

// SVG de imagem simulada idêntica à listagem do catálogo
const LargeProductImageSvg = ({ type }: { type: string }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 450 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      <rect width="450" height="380" fill="#FFFFFF" rx="4"/>
      
      {/* Saco Plástico Traseiro */}
      <rect x="145" y="85" width="160" height="190" rx="4" fill="#F0F0F0" stroke="#E2E2E2" strokeWidth="1" opacity="0.6"/>
      
      {/* Saco Plástico do Meio */}
      <rect x="135" y="75" width="160" height="190" rx="4" fill="#F7F7F7" stroke="#DCDCDC" strokeWidth="1"/>
      
      {/* Saco Plástico Frontal Principal */}
      <rect x="125" y="65" width="160" height="190" rx="4" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
      
      {/* Texturas de Plástico Trasparente / Brilho do Saco */}
      <path d="M135 85L275 225" stroke="#F5F5F5" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M165 65L285 185" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8"/>
      
      {/* Detalhes específicos de tipo de produto */}
      {type === 'zip' && (
        <>
          {/* Trilho do Zip Lock */}
          <line x1="125" y1="84" x2="285" y2="84" stroke="#FF6B00" strokeWidth="4.5"/>
          <line x1="125" y1="90" x2="285" y2="90" stroke="#FF6B00" strokeWidth="1.5" opacity="0.7"/>
        </>
      )}

      {type === 'pe-grosso' && (
        <>
          {/* Indicador de Espessura Grossa */}
          <path d="M260 220H275V235" stroke="#FF6B00" strokeWidth="4.5" fill="none"/>
          <text x="145" y="235" fill="#888" fontSize="13" fontWeight="bold">0,20 mm</text>
        </>
      )}

      {type === 'pe-fino' && (
        <>
          {/* Indicador de Espessura Fina */}
          <text x="145" y="235" fill="#aaa" fontSize="13" fontWeight="bold">0,06 mm</text>
        </>
      )}

      {type === 'vacuo' && (
        <>
          {/* Ranhuras de sucção do vácuo */}
          <path d="M125 90L285 90" stroke="#EAEAEA" strokeWidth="1.5"/>
          <path x1="125" y1="120" x2="285" y2="120" stroke="#EEEEEE" strokeWidth="1"/>
          <path x1="125" y1="150" x2="285" y2="150" stroke="#EEEEEE" strokeWidth="1"/>
          <path x1="125" y1="180" x2="285" y2="180" stroke="#EEEEEE" strokeWidth="1"/>
          <path x1="125" y1="210" x2="285" y2="210" stroke="#EEEEEE" strokeWidth="1"/>
          <text x="155" y="240" fill="#FF6B00" fontSize="11" fontWeight="bold">VÁCUO GOFRADO</text>
        </>
      )}

      {type === 'kit' && (
        <>
          {/* Ícones extras simulando múltiplos sacos empilhados */}
          <rect x="210" y="140" width="70" height="90" rx="3" fill="#FFFFFF" stroke="#FF6B00" strokeWidth="1.5" opacity="0.9"/>
          <line x1="210" y1="152" x2="280" y2="152" stroke="#FF6B00" strokeWidth="3"/>
        </>
      )}
    </svg>
  );
};

export default function ProdutoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useUser();
  
  const id = params.id as string;
  const product = PRODUCTS_DATABASE[id] || PRODUCTS_DATABASE['saco-pe-50x70']; // Fallback
  
  const [qty, setQty] = useState(1);
  const [activeImageTab, setActiveImageTab] = useState(0);
  const [added, setAdded] = useState(false);

  // Estados da calculadora de frete por CEP
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<Array<{ id: string; name: string; deadline: string; price: number; description?: string }>>([]);
  const [calculating, setCalculating] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) {
      setCep(digits);
    } else {
      setCep(`${digits.slice(0, 5)}-${digits.slice(5, 8)}`);
    }
    setCepError('');
  };

  const handleCalculateShipping = () => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) {
      setCepError('CEP deve conter 8 dígitos.');
      return;
    }
    setCalculating(true);
    setCepError('');

    setTimeout(() => {
      const firstTwo = cleaned.substring(0, 2);
      const isSpMetropolitan = ['01', '02', '03', '04', '05', '06', '07', '08', '09'].includes(firstTwo);

      const now = new Date();
      const isBefore11 = now.getHours() < 11;

      const options = [];

      if (isSpMetropolitan) {
        options.push({
          id: 'flex',
          name: 'ABC Master Flex (Motoboy)',
          deadline: isBefore11 ? 'Chega HOJE (se comprado até 11h)' : 'Chega AMANHÃ (compras após as 11h)',
          price: 12.90,
          description: 'Entrega local expressa'
        });

        options.push({
          id: 'jadlog_express',
          name: 'Jadlog Express',
          deadline: 'Entrega em até 2 dias úteis',
          price: 18.50
        });

        options.push({
          id: 'sedex',
          name: 'SEDEX (Correios)',
          deadline: 'Entrega em até 2 dias úteis',
          price: 21.40
        });

        options.push({
          id: 'pac',
          name: 'PAC (Correios)',
          deadline: 'Entrega em até 4 dias úteis',
          price: 14.90
        });
      } else {
        options.push({
          id: 'sedex',
          name: 'SEDEX (Correios)',
          deadline: 'Entrega em até 3 dias úteis',
          price: 38.10
        });

        options.push({
          id: 'jadlog_std',
          name: 'Jadlog Standard',
          deadline: 'Entrega em até 5 dias úteis',
          price: 24.90
        });

        options.push({
          id: 'pac',
          name: 'PAC (Correios)',
          deadline: 'Entrega em até 7 dias úteis',
          price: 21.50
        });
      }

      setShippingOptions(options);
      setCalculating(false);
    }, 450);
  };

  // Estados de reviews/comentários de clientes
  const [reviews, setReviews] = useState<Array<{ id: string, authorName: string, rating: number, title: string, comment: string, createdAt: string, verified?: boolean }>>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Sincroniza o nome do autor com o usuário logado
  useEffect(() => {
    if (user) {
      setNewAuthor(user.name);
    } else {
      setNewAuthor('');
    }
  }, [user]);

  useEffect(() => {
    const cached = localStorage.getItem(`reviews_${product.id}`);
    if (cached) {
      setReviews(JSON.parse(cached));
    } else {
      // Mock inicial adaptado por produto
      const isZip = product.category === 'zip';
      const isVacuo = product.category === 'vacuo';
      
      const defaultReviews = [
        {
          id: '1',
          authorName: 'Marcio Silva',
          rating: 5,
          title: isZip ? 'Fecho excelente!' : isVacuo ? 'Muito bom para alimentos!' : 'Produto excelente e muito resistente!',
          comment: isZip 
            ? 'Fiquei muito surpreso com a vedação hermética, o zíper de pressão realmente fecha super bem. Uso para organizar bijuterias e peças pequenas e atende perfeitamente.'
            : isVacuo
            ? 'Comprei para embalar queijos e carnes na minha charcutaria. A textura gofrada facilita muito a sucção na seladora de vácuo. Plástico bem espesso e de ótima qualidade.'
            : 'Fiquei muito surpreso com a qualidade. O plástico é bem grosso, grosso de verdade conforme a descrição (0,20mm). Uso para embalar peças pesadas na minha mecânica e aguenta perfeitamente sem rasgar.',
          createdAt: '15 Mai 2026',
          verified: true
        },
        {
          id: '2',
          authorName: 'Ana Souza',
          rating: 5,
          title: 'Perfeito para o meu negócio',
          comment: 'Excelente custo-benefício. O tamanho é exato conforme as especificações e a transparência é cristalina. A entrega da ABC Master foi rápida demais, chegou no dia seguinte conforme prometido!',
          createdAt: '03 Jun 2026',
          verified: true
        }
      ];
      setReviews(defaultReviews);
      localStorage.setItem(`reviews_${product.id}`, JSON.stringify(defaultReviews));
    }
  }, [product.id, product.category]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setVerifyError('Você precisa fazer login para enviar uma avaliação.');
      return;
    }
    if (!newAuthor || !newTitle || !newComment) {
      setVerifyError('Por favor, preencha todos os campos do formulário.');
      return;
    }

    setVerifying(true);
    setVerifyError('');

    try {
      // 1. Tenta validar no backend via API passando o email e CPF do cliente logado na sessão
      const res = await fetch('/api/reviews/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          email: user.email,
          cpf: user.cpf
        })
      });

      const data = await res.json();
      let isVerified = false;

      if (data.verified) {
        isVerified = true;
      } else if (data.fallbackLocal || !data.verified) {
        // Fallback local: Se o banco estiver offline ou não retornar, valida no localStorage de ordens do navegador
        try {
          const localOrders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
          const hasPurchasedLocal = localOrders.some((order: any) => {
            const matchesKey = order.email?.toLowerCase().trim() === user.email.toLowerCase().trim() || 
                               order.cpf?.replace(/\D/g, '') === user.cpf.replace(/\D/g, '');
            const containsProduct = order.products && order.products.includes(product.id);
            return matchesKey && containsProduct;
          });
          if (hasPurchasedLocal) {
            isVerified = true;
          }
        } catch (localErr) {
          console.error('Erro ao verificar compras locais:', localErr);
        }
      }

      if (!isVerified) {
        setVerifyError('Verificação de compra falhou. Não encontramos nenhum pedido aprovado deste produto vinculado a esta conta de cliente.');
        setVerifying(false);
        return;
      }

      const reviewObj = {
        id: Math.random().toString(36).substring(2, 9),
        authorName: newAuthor,
        rating: newRating,
        title: newTitle,
        comment: newComment,
        createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        verified: true
      };

      const updated = [reviewObj, ...reviews];
      setReviews(updated);
      localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updated));

      // Reset formulário
      setNewTitle('');
      setNewComment('');
      setNewRating(5);
      setVerifyError('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);

    } catch (err: any) {
      console.error('Erro ao verificar comprador:', err);
      setVerifyError('Erro de conexão ao verificar compra. Tente novamente.');
    } finally {
      setVerifying(false);
    }
  };

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : '0.0';

  const starsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rat = r.rating as 1 | 2 | 3 | 4 | 5;
    if (starsCount[rat] !== undefined) starsCount[rat]++;
  });

  const handleAddToCart = () => {
    addItem({
      blingId: product.id,
      name: product.name,
      variation: {},
      unitPrice: product.price,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    // Adiciona e manda direto para checkout
    addItem({
      blingId: product.id,
      name: product.name,
      variation: {},
      unitPrice: product.price,
    }, qty);
    router.push('/checkout');
  };

  const integerPart = Math.floor(product.price);
  const centsPart = Math.round((product.price - integerPart) * 100).toString().padStart(2, '0');

  return (
    <>
      <Header />
      <main style={{ background: '#FFF', minHeight: 'calc(100vh - 145px)', padding: '24px 0', fontFamily: 'inherit' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumbs de Navegação estilo Mercado Livre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#666', marginBottom: 20, paddingBottom: 12 }}>
            <Link href="/loja" style={{ color: '#3483FA', fontWeight: 600, textDecoration: 'none' }}>Voltar à lista</Link>
            <span style={{ color: '#ccc' }}>|</span>
            <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Indústria e Comércio</Link>
            <span>&gt;</span>
            <Link href="/loja" style={{ color: '#666', textDecoration: 'none' }}>Embalagens</Link>
            <span>&gt;</span>
            <span style={{ color: '#333', fontWeight: 600 }}>{product.category === 'pe' ? 'Sacos PE' : product.category === 'zip' ? 'Sacos Zip Lock' : 'Sacos a Vácuo'}</span>
          </div>

          {/* GRID PRINCIPAL DE DUAS COLUNAS (ESQUERDA AMPLA E DIREITA PAINEL DE COMPRAS) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
            
            {/* ── COLUNA DA ESQUERDA (IMAGENS, TÍTULO, DADOS, ESPECIFICAÇÕES, DESCRIÇÃO) ── */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* SUB-GRID SUPERIOR (FOTOS À ESQUERDA, TÍTULO/PREÇO À DIREITA) */}
              <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32, alignItems: 'start', marginBottom: 40 }}>
                
                {/* Lado Esquerdo do Sub-Grid: Galeria de Fotos e Bullets de "O que você precisa saber" */}
                <div>
                  {/* Painel de Fotos (Galeria Lateral + Imagem Principal) */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
                    {/* Miniaturas à Esquerda */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 50 }}>
                      {[0, 1, 2].map(idx => {
                        const imgUrl =
                          product.name.toLowerCase().includes('canela') ? '/saco_canela.png' :
                          product.category === 'pe' ? '/saco_pe.png' :
                          product.category === 'zip' ? '/saco_zip.png' :
                          product.category === 'vacuo' ? '/saco_vacuo.png' : '/saco_pe.png';
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveImageTab(idx)}
                            style={{
                              width: 50, height: 50, border: activeImageTab === idx ? '2px solid #FF6B00' : '1px solid #ddd',
                              borderRadius: 4, background: '#fff', overflow: 'hidden', padding: 2, cursor: 'pointer', transition: 'all 0.15s',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <div style={{ width: '100%', height: '100%', opacity: activeImageTab === idx ? 1 : 0.6, overflow: 'hidden' }}>
                              <img
                                src={imgUrl}
                                alt={`Miniatura ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transform: idx === 1 ? 'scale(1.5)' : idx === 2 ? 'scale(2.2)' : 'none',
                                  transformOrigin: idx === 2 ? 'top right' : 'center',
                                  transition: 'all 0.2s'
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Imagem Grande Principal com Zoom Simulado */}
                    <div style={{
                      flex: 1,
                      height: 380,
                      border: '1px solid #EDEDED',
                      borderRadius: 4,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <img
                        src={
                          product.name.toLowerCase().includes('canela') ? '/saco_canela.png' :
                          product.category === 'pe' ? '/saco_pe.png' :
                          product.category === 'zip' ? '/saco_zip.png' :
                          product.category === 'vacuo' ? '/saco_vacuo.png' : '/saco_pe.png'
                        }
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          transform: activeImageTab === 1 ? 'scale(1.6)' : activeImageTab === 2 ? 'scale(2.3)' : 'scale(1)',
                          transformOrigin: activeImageTab === 2 ? 'top right' : 'center',
                          transition: 'transform 0.3s ease-in-out'
                        }}
                      />
                      {activeImageTab > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          background: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)'
                        }}>
                          🔍 Zoom: {activeImageTab === 1 ? 'Detalhamento Técnico' : 'Zoom de Solda / Espessura'}
                        </div>
                      )}
                    </div>
                  </div>


                </div>

                {/* Lado Direito do Sub-Grid: Informações de Preço, Título e Reputação */}
                <div>
                  {/* Condição e Vendidos */}
                  <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: 4 }}>
                    Novo | +100 vendidos
                  </div>

                  {/* Título do Produto */}
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#333', lineHeight: 1.25, margin: '0 0 8px 0' }}>
                    {product.name}
                  </h1>

                  {/* Avaliação Estrelas Dinâmica */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', marginBottom: 16 }}>
                    <span style={{ color: '#333', fontWeight: 600 }}>{averageRating}</span>
                    <span style={{ color: '#FF6B00', fontSize: '1rem', letterSpacing: 1 }}>
                      {'★'.repeat(Math.round(Number(averageRating)))}{'☆'.repeat(5 - Math.round(Number(averageRating)))}
                    </span>
                    <a href="#opinioes-secao" style={{ color: '#3483FA', textDecoration: 'none', fontSize: '0.8rem' }}>
                      ({totalReviews} {totalReviews === 1 ? 'opinião' : 'opiniões'})
                    </a>
                  </div>

                  {/* Preço e Desconto */}
                  <div style={{ marginBottom: 14 }}>
                    {product.discount > 0 && product.originalPrice && (
                      <s style={{ fontSize: '0.88rem', color: '#999', display: 'block', marginBottom: 2 }}>R$ {product.originalPrice.toFixed(2)}</s>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', color: '#333' }}>
                      <span style={{ fontSize: '2.1rem', fontWeight: 300, lineHeight: 1 }}>R$ {integerPart}</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 300, marginTop: 4, marginLeft: 1 }}>{centsPart}</span>
                      {product.discount > 0 && (
                        <span style={{ color: '#00a650', fontSize: '0.92rem', fontWeight: 600, marginLeft: 12, marginTop: 6 }}>{product.discount}% OFF</span>
                      )}
                    </div>
                  </div>

                  {/* Parcelamento e Info Mercado Pago */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.82rem', color: '#00a650', fontWeight: 500, margin: '0 0 6px 0' }}>
                      em {product.installments}
                    </p>
                    <span style={{ color: '#2962FF', background: '#E8EAF6', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 3, display: 'inline-block', marginBottom: 10 }}>
                      20% OFF Saldo no Mercado Pago
                    </span>
                    <a href="#" style={{ color: '#3483FA', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                      Ver meios de pagamento e promoções
                    </a>
                  </div>
                </div>

              </div>

              {/* Seção 1: Características Principais (OCUPANDO A LARGURA CHEIA DA COLUNA DA ESQUERDA) */}
              <div id="caracteristicas-completas" style={{ borderTop: '1px solid #EDEDED', paddingTop: 36, marginBottom: 36, scrollMarginTop: 24 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: 20 }}>Características principais</h2>
                <div style={{ border: '1px solid #EDEDED', borderRadius: 6, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], idx) => (
                        <tr key={key} style={{ background: idx % 2 === 0 ? '#F7F7F7' : '#FFFFFF', borderBottom: '1px solid #EDEDED' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#333', width: '30%', borderRight: '1px solid #EDEDED' }}>{key}</td>
                          <td style={{ padding: '12px 16px', color: '#666' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seção 2: Descrição Detalhada (ABAIXO DA TABELA DE ESPECIFICAÇÕES, TAMBÉM EM LARGURA CHEIA) */}
              <div style={{ borderTop: '1px solid #EDEDED', paddingTop: 36, paddingBottom: 16 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: 16 }}>Descrição</h2>
                <p style={{ fontSize: '0.92rem', color: '#666', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {product.fullDescription}
                </p>
              </div>

              {/* ── SEÇÃO 3: OPINIÕES SOBRE O PRODUTO (ESTILO MERCADO LIVRE) ── */}
              <div id="opinioes-secao" style={{ borderTop: '1px solid #EDEDED', paddingTop: 36, paddingBottom: 24, scrollMarginTop: 24 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: 24 }}>Opiniões sobre o produto</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>
                  {/* Bloco Esquerdo: Médias e Barras de Estrelas */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '3rem', fontWeight: 600, color: '#333', lineHeight: 1 }}>{averageRating}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                        <span style={{ color: '#FF6B00', fontSize: '1.1rem' }}>
                          {'★'.repeat(Math.round(Number(averageRating)))}{'☆'.repeat(5 - Math.round(Number(averageRating)))}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#666' }}>{totalReviews} {totalReviews === 1 ? 'opinião' : 'opiniões'}</span>
                      </div>
                    </div>

                    {/* Barras Horizontais */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = starsCount[star as 1 | 2 | 3 | 4 | 5] || 0;
                        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#666' }}>
                            <span style={{ width: 12, textAlign: 'right' }}>{star}</span>
                            <span style={{ color: '#FF6B00' }}>★</span>
                            <div style={{ flex: 1, height: 6, background: '#EDEDED', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#FF6B00', borderRadius: 3 }} />
                            </div>
                            <span style={{ width: 24, textAlign: 'left' }}>{pct.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bloco Direito: Listagem de Avaliações e Formulário de Envio */}
                  <div>
                    {/* Lista de Avaliações */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
                      {reviews.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>Nenhuma avaliação para este produto ainda. Seja o primeiro a opinar!</p>
                      ) : (
                        reviews.map(rev => (
                          <div key={rev.id} style={{ borderBottom: '1px solid #F5F5F5', paddingBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#FF6B00', fontSize: '0.88rem', letterSpacing: 1 }}>
                                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                </span>
                                {rev.verified && (
                                  <span style={{ color: '#00a650', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    ✓ Comprador verificado
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#999' }}>{rev.createdAt}</span>
                            </div>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#333', margin: '0 0 6px 0' }}>{rev.title}</h4>
                            <p style={{ fontSize: '0.84rem', color: '#666', lineHeight: 1.5, margin: '0 0 6px 0' }}>{rev.comment}</p>
                            <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: 500 }}>Por: {rev.authorName}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Formulário: Deixar Comentário/Opinião */}
                    {!user ? (
                      /* Se VISITANTE (Deslogado) */
                      <div style={{ border: '1px solid #EDEDED', borderRadius: 6, padding: '32px 24px', background: '#FAFAFA', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#333', marginBottom: 8 }}>Deseja avaliar este produto?</h3>
                        <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                          Para garantir a autenticidade das opiniões, apenas compradores reais cadastrados podem deixar avaliações.
                        </p>
                        <Link
                          href={`/login?redirect=/loja/${product.id}#opinioes-secao`}
                          style={{
                            display: 'inline-block', padding: '11px 28px', borderRadius: 4, background: '#FF6B00',
                            color: '#fff', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.15s'
                          }}
                        >
                          Entrar ou Cadastrar-se
                        </Link>
                      </div>
                    ) : (
                      /* Se CLIENTE LOGADO */
                      <div style={{ border: '1px solid #EDEDED', borderRadius: 6, padding: '24px', background: '#FAFAFA' }}>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>O que você achou do produto? Deixe sua opinião</h3>
                        <p style={{ fontSize: '0.76rem', color: '#666', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                          🔒 Identificado como <strong>{user.name}</strong> ({user.email}). Validaremos automaticamente sua compra para aprovar a opinião com o selo de comprador verificado.
                        </p>
                        
                        {reviewSubmitted ? (
                          <div style={{ color: '#00a650', fontSize: '0.88rem', fontWeight: 600, padding: '8px 12px', background: '#E6F6EC', borderRadius: 4, display: 'inline-block' }}>
                            ✓ Obrigado! Sua opinião foi publicada com sucesso como Comprador Verificado.
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            
                            {verifyError && (
                              <div style={{ color: '#D32F2F', fontSize: '0.82rem', fontWeight: 600, padding: '10px 14px', background: '#FFEBEE', borderRadius: 4, lineHeight: 1.4 }}>
                                ⚠️ {verifyError}
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                              {/* Nome do Autor (Desabilitado) */}
                              <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>Nome da Avaliação</label>
                                <input
                                  type="text"
                                  value={newAuthor}
                                  disabled
                                  style={{
                                    width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd',
                                    fontSize: '0.82rem', outline: 'none', background: '#F0F0F0', boxSizing: 'border-box', color: '#555'
                                  }}
                                />
                              </div>

                              {/* Avaliação em Estrelas (Seletor) */}
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>Sua Nota</label>
                                <select
                                  value={newRating}
                                  onChange={e => setNewRating(Number(e.target.value))}
                                  style={{
                                    padding: '7px 12px', borderRadius: 4, border: '1px solid #ccc',
                                    fontSize: '0.82rem', outline: 'none', background: '#fff', fontWeight: 600, cursor: 'pointer'
                                  }}
                                >
                                  <option value="5">5 estrelas (Excelente)</option>
                                  <option value="4">4 estrelas (Muito Bom)</option>
                                  <option value="3">3 estrelas (Bom)</option>
                                  <option value="2">2 estrelas (Regular)</option>
                                  <option value="1">1 estrela (Ruim)</option>
                                </select>
                              </div>
                            </div>

                            {/* Título da Opinião */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>Título da Opinião</label>
                              <input
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Ex: Excelente qualidade, recomendo!"
                                required
                                style={{
                                  width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc',
                                  fontSize: '0.82rem', outline: 'none', background: '#fff', boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            {/* Texto de Opinião */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', fontWeight: 600, marginBottom: 4 }}>Opinião Detalhada</label>
                              <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Conte em detalhes sua experiência com as medidas, material e acabamento..."
                                required
                                rows={4}
                                style={{
                                  width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc',
                                  fontSize: '0.82rem', outline: 'none', background: '#fff', boxSizing: 'border-box',
                                  fontFamily: 'inherit', resize: 'vertical'
                                }}
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={verifying}
                              style={{
                                alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 4, border: 'none',
                                background: verifying ? '#ccc' : '#FF6B00', color: '#fff', fontSize: '0.84rem', fontWeight: 700,
                                cursor: verifying ? 'not-allowed' : 'pointer', transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => { if(!verifying) e.currentTarget.style.background = '#e05e00' }}
                              onMouseLeave={e => { if(!verifying) e.currentTarget.style.background = '#FF6B00' }}
                            >
                              {verifying ? 'Verificando compra...' : 'Enviar opinião'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* ── COLUNA DA DIREITA (PAINEL DE COMPRA EM CARD CONTORNADO) ── */}
            <aside style={{
              background: '#fff', border: '1px solid #E6E6E6', borderRadius: 8, padding: '24px',
              display: 'flex', flexDirection: 'column', gap: 20
            }}>
              
              {/* Calculadora de CEP e Entrega */}
              <div style={{ borderBottom: '1px solid #EDEDED', paddingBottom: 16 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🚚 Calcular Frete e Prazos
                </p>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={cep}
                    onChange={e => handleCepChange(e.target.value)}
                    maxLength={9}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 4,
                      border: cepError ? '1px solid #EF4444' : '1px solid #ccc',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={handleCalculateShipping}
                    disabled={calculating || !cep}
                    style={{
                      background: calculating ? '#ccc' : '#FF6B00',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: calculating || !cep ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {calculating ? '...' : 'Calcular'}
                  </button>
                </div>

                {cepError && (
                  <p style={{ fontSize: '0.74rem', color: '#EF4444', margin: '0 0 8px 0', fontWeight: 600 }}>
                    ⚠️ {cepError}
                  </p>
                )}

                {/* Lista de Opções de Frete Calculadas */}
                {shippingOptions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    {shippingOptions.map(opt => {
                      const isFlex = opt.id === 'flex';
                      return (
                        <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 2 }}>
                          <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: isFlex ? '#FF6B00' : '#333', margin: 0 }}>
                              {isFlex ? '⚡ ' : ''}{opt.name}
                            </p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                              {opt.deadline}
                            </p>
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#333' }}>
                            {opt.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p style={{ fontSize: '0.72rem', color: '#666', margin: '8px 0 0 0', lineHeight: 1.3 }}>
                  Entregamos em todo o país. Compras para a grande SP/ABCD até as 11h chegam hoje!
                </p>
              </div>

              {/* Bloco de Estoque Disponível */}
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#333', margin: '0 0 10px 0' }}>Estoque disponível</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.82rem', color: '#666' }}>Quantidade:</span>
                  <select
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    style={{
                      padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc',
                      fontSize: '0.84rem', fontWeight: 600, outline: 'none', cursor: 'pointer', background: '#fff'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'unidade' : 'unidades'}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: '#999' }}>({product.stock} disponíveis)</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleBuyNow}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 6, border: 'none',
                    background: '#FF6B00', color: '#fff', fontSize: '0.92rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e05e00'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FF6B00'}
                >
                  Comprar agora
                </button>
                
                <button
                  onClick={handleAddToCart}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 6,
                    border: '1.5px solid #FF6B00', background: added ? '#FFF0E6' : '#fff',
                    color: '#FF6B00', fontSize: '0.92rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF0E6'}
                  onMouseLeave={e => { if(!added) e.currentTarget.style.background = '#fff' }}
                >
                  {added ? '✓ Adicionado ao carrinho!' : 'Adicionar ao carrinho'}
                </button>
              </div>

              {/* Info do Vendedor */}
              <div style={{ fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', paddingTop: 14 }}>
                <p style={{ margin: '0 0 4px 0' }}>Vendido por <span style={{ fontWeight: 600, color: '#333' }}>ABCMASTEREMBALAGENS</span></p>
                <p style={{ margin: 0, fontWeight: 700, color: '#00a650' }}>+100 vendas</p>
              </div>

              {/* Selos de Devolução e Compra Garantida */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem', color: '#666', lineHeight: 1.4 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: '1rem', marginTop: 2 }}>↩️</span>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: '#3483FA', fontWeight: 600, cursor: 'pointer' }}>Devolução grátis.</span> Você tem 30 dias a partir da data de recebimento.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: '1rem', marginTop: 2 }}>🛡️</span>
                  <p style={{ margin: 0 }}>
                    <span style={{ color: '#3483FA', fontWeight: 600, cursor: 'pointer' }}>Compra Garantida.</span> Receba o produto que está esperando ou devolvemos o dinheiro.
                  </p>
                </div>
              </div>

              {/* Link extra */}
              <a href="#" style={{ color: '#3483FA', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block', borderTop: '1px solid #eee', paddingTop: 14 }}>
                + Adicionar a uma lista
              </a>

            </aside>
          </div>

          {/* ── SEÇÃO: PRODUTOS DO VENDEDOR (GRID INFERIOR) ── */}
          <div style={{ borderTop: '1px solid #EDEDED', marginTop: 48, paddingTop: 36 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333', marginBottom: 20 }}>Produtos do vendedor</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {Object.values(PRODUCTS_DATABASE).slice(0, 4).map(p => {
                const pInteger = Math.floor(p.price);
                const pCents = Math.round((p.price - pInteger) * 100).toString().padStart(2, '0');
                return (
                  <Link
                    key={p.id}
                    href={`/loja/${p.id}`}
                    style={{
                      border: '1px solid #EDEDED', borderRadius: 4, background: '#fff',
                      padding: 16, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ background: '#FFF4EE', height: 140, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <span style={{ color: '#FF6B00', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {p.id.includes('zip') ? 'ZIP LOCK' : p.id.includes('vacuo') ? 'VÁCUO' : 'PE TRANSPARENTE'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.82rem', fontWeight: 500, color: '#333', marginBottom: 8, height: 32, overflow: 'hidden', lineHeight: 1.3 }}>
                      {p.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-start', color: '#333', marginBottom: 4 }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>R$ {pInteger}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: 1, marginLeft: 1 }}>{pCents}</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#00a650', fontWeight: 600 }}>
                      {p.freeShipping ? 'Frete grátis' : 'Frete a calcular'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* ═══ RODAPÉ REDUZIDO (ESTILO MERCADO LIVRE) ═══ */}
      <footer style={{ background: '#F5F5F5', borderTop: '1px solid #E6E6E6', padding: '24px 20px', fontFamily: 'inherit', position: 'relative', marginTop: 48 }}>
        
        {/* Botão Centralizado na borda superior */}
        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <button style={{
            background: '#F5F5F5', border: '1px solid #E6E6E6', borderRadius: '4px 4px 0 0',
            padding: '8px 18px', fontSize: '0.78rem', fontWeight: 600, color: '#333', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, outline: 'none', borderBottom: 'none'
          }}>
            Mais informações <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>⌃</span>
          </button>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          
          {/* Links Horizontais */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', fontSize: '0.78rem', color: '#666', marginTop: 8 }}>
            {['Trabalhe conosco', 'Termos e condições', 'Promoções', 'Como cuidamos da sua privacidade'].map(link => (
              <a key={link} href="#" style={{ color: '#333', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color='#FF6B00'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
                {link}
              </a>
            ))}
            
            {/* Link de Acessibilidade com Ícone */}
            <a href="#" style={{ color: '#333', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} onMouseEnter={e => e.currentTarget.style.color='#FF6B00'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: -1 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8a2 2 0 1 0-2-2 2 2 0 0 0 2 2z"/><path d="M9 13v-3a3 3 0 0 1 6 0v3"/><path d="M12 13v6"/><path d="M9 16h6"/>
              </svg>
              Acessibilidade
            </a>

            {['Contato', 'Informações sobre seguros', 'Programa de Affiliados'].map(link => (
              <a key={link} href="#" style={{ color: '#333', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color='#FF6B00'} onMouseLeave={e => e.currentTarget.style.color='#333'}>
                {link}
              </a>
            ))}
          </div>

          {/* Dados Legais e Direitos Autorais */}
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#999', lineHeight: 1.6, width: '100%' }}>
            <p style={{ margin: '0 0 4px 0' }}>Copyright © 1999-2026 ABC Master Embalagens LTDA.</p>
            <p style={{ margin: 0 }}>
              CNPJ n.º 63.570.152/0001-40 / Rua Pastor Rubens Lopes, 55, Piraporinha, Diadema/SP - CEP 09950-190 - empresa do grupo NZB Embalagens.
            </p>
          </div>
          
        </div>
      </footer>
    </>
  );
}
