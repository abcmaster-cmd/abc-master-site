export interface Product {
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
  image?: string;
  specifications: Record<string, string>;
  sku: string;
  minStock?: number;
  status: 'active' | 'inactive';
  sales: number;
  width: string;
  height: string;
  thickness: string;
  material: string;
  prodWeight?: number;
  pkgWidth?: number;
  pkgHeight?: number;
  pkgLength?: number;
  pkgWeight?: number;
  hasVariations?: boolean;
  variations?: any[]; // Itens contêm: name, sku, price, stock, minStock, blingProductId, blingProductSku
  
  // Campos de vínculo opcional com o Bling ERP
  blingProductId?: string;
  blingProductSku?: string;
}

export const INITIAL_UNIFIED_PRODUCTS: Product[] = [
  {
    id: 'saco-pe-50x70',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 50 X 70 X 0,20 Transparente (grosso)',
    description: 'Espessura reforçada de 0,20mm. Ideal para proteção de produtos industriais e comerciais pesados.',
    fullDescription: 'Os sacos plásticos de Polietileno (PE) da ABC Master são desenvolvidos com material de alta densidade e espessura especial de 0,20mm, garantindo resistência superior contra furos, rasgos e tração. Ideal para embalar peças metálicas, ferramentas, produtos industriais pesados e mercadorias que necessitam de barreira contra poeira e umidade.',
    originalPrice: 59.90,
    price: 53.91,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 120,
    minStock: 10,
    status: 'active',
    sales: 412,
    freeShipping: false,
    installments: '2x R$ 26,96 sem juros',
    imageType: 'pe-grosso',
    sku: 'PE-020-50x70',
    width: '50',
    height: '70',
    thickness: '0.20',
    material: 'Polietileno de Alta Performance (PE)',
    prodWeight: 0.03,
    pkgWidth: 35,
    pkgHeight: 10,
    pkgLength: 45,
    pkgWeight: 1.05,
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
  {
    id: 'saco-pe-22x32',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 22 X 32 X 0,06 Transparente (fino)',
    description: 'Espessura leve de 0,06mm. Excelente custo-benefício para peças leves e organizadores.',
    fullDescription: 'Sacos de polietileno de baixa densidade (PEBD) com espessura de 0,06mm. Indicados para embalagens de produtos leves como roupas, papelaria, pequenos acessórios, brindes e alimentos (material atóxico). Oferece transparência excelente para visualização rápida do conteúdo e selagem rápida em máquinas seladoras manuais ou automáticas.',
    price: 59.90,
    discount: 0,
    badge: '',
    stock: 200,
    minStock: 10,
    status: 'active',
    sales: 128,
    freeShipping: false,
    installments: '2x R$ 29,95 sem juros',
    imageType: 'pe-fino',
    sku: 'PE-006-22x32',
    width: '22',
    height: '32',
    thickness: '0.06',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    prodWeight: 0.007,
    pkgWidth: 25,
    pkgHeight: 5,
    pkgLength: 30,
    pkgWeight: 1.02,
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
  {
    id: 'saco-pe-80x120',
    category: 'pe',
    name: '1 Kg Saco Plástico Pe 80 X 120 X 0,20 Transparente (grosso)',
    description: 'Saco plástico de grande porte para produtos volumosos e armazenamento industrial pesado.',
    fullDescription: 'Sacos plásticos PE giants com largura de 80cm e altura de 120cm. Fabricados em espessura super reforçada de 0,20mm para suportar grande carga física. Muito utilizado para forração de caixas, tonéis, sacaria de grãos, embalamento de móveis, peças grandes de metalurgia e produtos agrícolas. Máxima segurança contra poeira e derramamento.',
    originalPrice: 144.33,
    price: 129.90,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 45,
    minStock: 10,
    status: 'active',
    sales: 45,
    freeShipping: false,
    installments: '4x R$ 32,47 sem juros',
    imageType: 'pe-grosso',
    sku: 'PE-020-80x120',
    width: '80',
    height: '120',
    thickness: '0.20',
    material: 'Polietileno Aditivado',
    prodWeight: 0.1,
    pkgWidth: 40,
    pkgHeight: 15,
    pkgLength: 60,
    pkgWeight: 1.1,
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
  {
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
    minStock: 10,
    status: 'active',
    sales: 80,
    freeShipping: false,
    installments: '2x R$ 26,96 sem juros',
    imageType: 'pe-grosso',
    sku: 'PE-020-35x55',
    width: '35',
    height: '55',
    thickness: '0.20',
    material: 'Polietileno de Alta Performance (PE)',
    prodWeight: 0.018,
    pkgWidth: 30,
    pkgHeight: 8,
    pkgLength: 40,
    pkgWeight: 1.04,
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
  {
    id: 'sacos-zip-n05',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N05 10x14cm (100 unidades)',
    description: 'Sacos herméticos com trilho deslizante. Excelente vedação para conservação e alimentos.',
    fullDescription: 'Sacos herméticos tipo Zip Lock de tamanho N05 (10x14cm). Ideais para pequenas peças, botões, bijuterias, parafusos, amostras de laboratório e alimentos. Possui trilho plástico hermético resistente que permite abrir e fechar centenas de vezes sem perder a vedação. Material 100% virgem e livre de BPA.',
    price: 34.90,
    discount: 0,
    badge: '',
    stock: 350,
    minStock: 10,
    status: 'active',
    sales: 128,
    freeShipping: false,
    installments: '1x R$ 34,90 sem juros',
    imageType: 'zip',
    sku: 'ZIP-N05-10x14',
    width: '10',
    height: '14',
    thickness: '0.08',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    prodWeight: 0.001,
    pkgWidth: 15,
    pkgHeight: 3,
    pkgLength: 20,
    pkgWeight: 0.15,
    specifications: {
      'Material': 'Polietileno de Baixa Densidade (PEBD)',
      'Espessura': '0,08 mm (Padrão Zip)',
      'Largura': '10 cm',
      'Comprimento': '14 cm',
      'Cor': 'Transparente com linha vermelha',
      'Quantidade aproximada': 'Pacote fechado com 100 unidades',
      'Indicação': 'Bijuterias, parafusos, alimentos, sementes e eletrônicos'
    }
  },
  {
    id: 'sacos-zip-n10',
    category: 'zip',
    name: 'Saco Plástico Zip Lock N10 24x34cm (100 unidades)',
    description: 'Tamanho grande para documentos, roupas e organização geral com fechamento hermético.',
    fullDescription: 'Sacos herméticos grandes N10 (24x34cm). Perfeitos para proteger documentos, manuais de instrução, roupas, enxovais, alimentos in grandes volumes e organização doméstica ou industrial. Fechamento firme por pressão que impede a entrada de umidade, poeira e pragas.',
    originalPrice: 88.00,
    price: 79.20,
    discount: 10,
    badge: 'OFERTA IMPERDÍVEL',
    stock: 90,
    minStock: 10,
    status: 'active',
    sales: 90,
    freeShipping: false,
    installments: '3x R$ 26,40 sem juros',
    imageType: 'zip',
    sku: 'ZIP-N10-24x34',
    width: '24',
    height: '34',
    thickness: '0.08',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    prodWeight: 0.008,
    pkgWidth: 28,
    pkgHeight: 5,
    pkgLength: 38,
    pkgWeight: 0.9,
    specifications: {
      'Material': 'Polietileno de Baixa Densidade (PEBD)',
      'Espessura': '0,08 mm (Padrão Zip)',
      'Largura': '24 cm',
      'Comprimento': '34 cm',
      'Cor': 'Transparente Cristal',
      'Quantidade aproximada': 'Pacote fechado com 100 unidades',
      'Indicação': 'Roupas, alimentos congelados, manuais, viagens e documentos'
    }
  },
  {
    id: 'saco-vacuo-20x30',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 20 X 30 cm (100 unidades)',
    description: 'Alta barreira contra oxigênio e umidade. Ideal para conservação de alimentos frios, carnes e queijos.',
    fullDescription: 'Sacos para embaladora a vácuo profissional de tamanho 20x30cm. Estrutura multilaminada com excelente barreira a gases e vapor d\'água. Aumenta a vida útil dos alimentos em até 5 vezes. Pode ser utilizado em banho-maria (Sous Vide), congelamento rápido e micro-ondas. Totalmente livre de bisfenol A.',
    originalPrice: 59.90,
    price: 49.90,
    discount: 16,
    badge: 'CAMPEÃO DE VENDAS',
    stock: 140,
    minStock: 10,
    status: 'active',
    sales: 320,
    freeShipping: false,
    installments: '2x R$ 24,95 sem juros',
    imageType: 'vacuo',
    sku: 'VAC-20x30',
    width: '20',
    height: '30',
    thickness: '0.15',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    prodWeight: 0.005,
    pkgWidth: 22,
    pkgHeight: 4,
    pkgLength: 32,
    pkgWeight: 0.6,
    specifications: {
      'Material': 'Nylon-Poli (Alta Barreira)',
      'Espessura': '0,15 mm (Ideal para Vácuo)',
      'Largura': '20 cm',
      'Comprimento': '30 cm',
      'Cor': 'Transparente Brilhante',
      'Quantidade aproximada': 'Pacote fechado com 100 unidades',
      'Indicação': 'Carnes, frios, queijos, grãos e produtos cozidos'
    }
  },
  {
    id: 'saco-vacuo-30x40',
    category: 'vacuo',
    name: 'Saco Plástico para Embalagem a Vácuo 30 X 40 cm (100 unidades)',
    description: 'Tamanho médio-grande para porções maiores. Certificado livre de BPA para contato com alimentos.',
    fullDescription: 'Sacos de vácuo multilaminados de grande porte (30x40cm). Ideal para costelas, peças inteiras de queijo, peixes grandes e porções comerciais. Compatível com seladoras a vácuo de câmara ou bico de sucção. Garante proteção absoluta contra oxidação e queima por congelamento.',
    price: 79.90,
    discount: 0,
    badge: '',
    stock: 95,
    minStock: 10,
    status: 'active',
    sales: 95,
    freeShipping: false,
    installments: '3x R$ 26,63 sem juros',
    imageType: 'vacuo',
    sku: 'VAC-30x40',
    width: '30',
    height: '40',
    thickness: '0.15',
    material: 'Polietileno de Baixa Densidade (PEBD)',
    prodWeight: 0.01,
    pkgWidth: 32,
    pkgHeight: 4,
    pkgLength: 42,
    pkgWeight: 1.08,
    specifications: {
      'Material': 'Nylon-Poli (Alta Barreira)',
      'Espessura': '0,15 mm (Ideal para Vácuo)',
      'Largura': '30 cm',
      'Comprimento': '40 cm',
      'Cor': 'Transparente Brilhante',
      'Quantidade aproximada': 'Pacote fechado com 100 unidades',
      'Indicação': 'Cortes grandes, costela, alimentos em fatias e congelados'
    }
  }
];

const VERSION = '1.2';

export function getProductsServerSide(): Product[] {
  try {
    const fs = require('fs');
    const path = require('path');
    const dirPath = path.join(process.cwd(), 'scratch');
    const filePath = path.join(dirPath, 'products_persist.json');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(INITIAL_UNIFIED_PRODUCTS, null, 2), 'utf-8');
      return INITIAL_UNIFIED_PRODUCTS;
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('⚠️ Falha ao ler products_persist.json no servidor:', err);
    return INITIAL_UNIFIED_PRODUCTS;
  }
}

export function saveProductsServerSide(products: Product[]): void {
  try {
    const fs = require('fs');
    const path = require('path');
    const dirPath = path.join(process.cwd(), 'scratch');
    const filePath = path.join(dirPath, 'products_persist.json');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('⚠️ Falha ao salvar products_persist.json no servidor:', err);
  }
}

export function getProducts(): Product[] {
  if (typeof window === 'undefined') {
    return getProductsServerSide();
  }
  const stored = localStorage.getItem('abc_products');
  const storedVersion = localStorage.getItem('abc_products_version');

  if (!stored || storedVersion !== VERSION) {
    localStorage.setItem('abc_products', JSON.stringify(INITIAL_UNIFIED_PRODUCTS));
    localStorage.setItem('abc_products_version', VERSION);
    return INITIAL_UNIFIED_PRODUCTS;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    localStorage.setItem('abc_products', JSON.stringify(INITIAL_UNIFIED_PRODUCTS));
    localStorage.setItem('abc_products_version', VERSION);
    return INITIAL_UNIFIED_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('abc_products', JSON.stringify(products));
    localStorage.setItem('abc_products_version', VERSION);
    
    // Sincroniza síncrono/assíncrono com o servidor
    fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    }).catch(err => console.warn('Erro ao sincronizar produtos com o servidor:', err));
  } else {
    saveProductsServerSide(products);
  }
}

/**
 * Calcula o parcelamento progressivo sem juros conforme o preço:
 * - Até R$ 50,00     → 1x (sem parcelamento)
 * - R$ 50,01 a R$ 100 → 2x sem juros
 * - Acima de R$ 100  → 3x sem juros
 */
export function getInstallments(price: number): string {
  if (!price || price <= 0) return '1x sem juros';
  if (price <= 50) {
    return `1x de R$ ${price.toFixed(2).replace('.', ',')}`;
  } else if (price <= 100) {
    return `2x de R$ ${(price / 2).toFixed(2).replace('.', ',')} sem juros`;
  } else {
    return `3x de R$ ${(price / 3).toFixed(2).replace('.', ',')} sem juros`;
  }
}
