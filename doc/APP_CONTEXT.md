# Contexto do Aplicativo - ABC Master E-commerce

Este documento registra o estado de desenvolvimento, arquitetura, fluxos e decisões técnicas do projeto ABC Master E-commerce.

## 📌 Status Atual do Projeto
- **Logotipos Ampliados para Destaque de Marca**:
  - Aumentado o tamanho do logotipo nos Headers (global `components/Header.tsx` e inline `app/page.tsx`) de `150x44` para `210x62` pixels.
  - Aumentado o tamanho do logotipo no Footer principal da Home Page de `130x40` para `170x50` pixels.
  - Isso provê maior imponência, legibilidade e fixação visual da marca "ABC Master Embalagens" para os novos clientes.
- **Layout da Home Page - Mais Vendidos (Carrossel) + Categorias**:
  - Seção **Mais Vendidos** implementada como **carrossel horizontal** com setas `‹` e `›` para navegação, usando `useRef` em um componente `BestSellersCarousel` dedicado.
  - O carrossel exibe até **10 produtos** com badge, com scroll suave (`scrollBehavior: smooth`) e `scroll-snap` por card de 240px.
  - As setas ficam laranjas no hover e estão posicionadas nas laterais do carrossel.
  - Abaixo do carrossel, cada **categoria** ("Sacos Plásticos PE", "Sacos Zip Lock" e "Sacos a Vácuo") aparece em uma seção própria com fundo `#f7f7f7` uniforme.
  - Mocks expandidos para **10 produtos** totais (com badge), distribuídos entre as 3 categorias.
- **Banner Hero Compactado**:
  - Reduzido o padding vertical do Banner Hero na Home Page (`app/page.tsx`) de `60px` para `28px`.
  - Limitada a altura máxima da imagem de destaque (`/hero-packaging.png`) no estilo para `280px` (`maxHeight: '280px'`) com `objectFit: 'cover'`.
  - Reduzidas ligeiramente as margens inferiores e tamanhos dos textos internos do hero, permitindo que a seção de **Produtos Mais Vendidos** fique visível na base da dobra de tela do usuário sem rolagem excessiva.
- **Botão Entrar / Cadastrar no Header Principal**:
  - Remodelada a barra de ações principal dos cabeçalhos para integrar diretamente o botão de login do cliente (**Entrar / Cadastrar**) e a caixinha de boas-vindas com link de logout ("Sair") ao lado dos botões de Orçamento (WhatsApp) e Carrinho.
  - Aplicada a mesma padronização visual com bordas sutis (`#eee`), fonte com peso `700`, alinhamento centralizado e mesma altura de botão (`height: 44`, `boxSizing: 'border-box'`).
  - Esta alteração foi replicada tanto no componente global do Header (`components/Header.tsx`) quanto no Header inline da Home Page (`app/page.tsx`).
- **Home Page Focada e Simplificada**:
  - Removidas as seções adicionais de selos de confiança, Call-To-Action de medida especial, Quem Somos e Formulário de Contato do corpo principal (`app/page.tsx`).
  - A página agora exibe exclusivamente o **Banner Hero principal** no topo e a seção de **Produtos Mais Vendidos** (grid de anúncios em destaque), conforme solicitado pelo usuário.
- **Correção Definitiva de Legibilidade do Logotipo**:
  - Resolvida a inconsistência onde o Header inline da Home Page (`app/page.tsx`) utilizava o `/logo-preto.svg` (com letras claras) em fundo branco. Agora, ele utiliza o `/logo-branco.svg` (com letras escuras), exibindo a palavra "master" e a sacola em preto de forma nítida.
  - O site agora carrega `/logo-branco.svg` (letras pretas/escuras) nas seções com fundo claro (Header global, Header inline da Home, Login do cliente e login do vendedor) e `/logo-preto.svg` (letras brancas/claras) nas seções com fundo escuro (Footer e barra lateral do vendedor).
- **Dados Cadastrais Oficiais da Empresa (Integrados via Google Maps)**: Todas as referências cadastrais fictícias foram substituídas pelas informações oficiais coletadas a partir do link do Google Maps da **ABC Master Embalagens**:
  - **Razão Social**: ABC Master Embalagens Ltda
  - **CNPJ**: 63.570.152/0001-40
  - **Endereço**: Rua Pastor Rubens Lopes, 55, Piraporinha, Diadema - SP, CEP: 09950-190
  - Esses dados foram aplicados na seção de contato e no rodapé geral da Home Page (`app/page.tsx`), na base legal do rodapé reduzido da página do produto (`app/loja/[id]/page.tsx`), e no layout de e-mails transacionais (`lib/email.ts`).
- **Visual e Estilo**: Totalmente remodelado para seguir a identidade visual da **NZB Embalagens** com e-commerce clássico e limpo.
- **Paleta de Cores**: Laranja (`#FF6B00`), Preto (`#111111`/`#222222`), Cinza/Bordas e Branco. Todos os resíduos de azul foram completamente removidos de todos os estilos e componentes.
- **Visual Flat**: Sem brilhos externos ou sombras estruturais. Design mais limpo e profissional focado em bordas sutis e contraste.
- **Página de Detalhes de Produto (Estilo Mercado Livre de 2 Colunas + Subgrids)**: Rota `/loja/[id]` diagramada para seguir perfeitamente o arranjo clássico do Mercado Livre:
  1. *Coluna da Esquerda Ampla*:
     - *Subgrid Superior*: Fotos (galeria vertical de miniaturas + imagem principal) com largura ajustada para **400px** (anteriormente 500px), aumentando em 100px a largura da coluna do meio. Isso permite que o título do produto respire horizontalmente, quebrando menos lines e parecendo mais largo.
     - *Seção 1 (Abaixo)*: Bullet points de visualização rápida "O que você precisa saber sobre este produto" logo abaixo da galeria.
     - *Seção 2 (Abaixo)*: Tabela zebrada de "Características principais" estendendo-se por toda a largura da coluna esquerda (abaixo do topo).
     - *Seção 3 (Abaixo)*: Bloco de "Descrição" detalhada do produto inserido abaixo da tabela de características.
     - *Seção 4 (Abaixo - Comentários e Avaliações Condicionados a Login)*: Seção de "Opiniões sobre o produto" contendo gráfico de barras e estrelas da média de notas dos clientes, acompanhado de listagem de avaliações. O formulário de envio de novas opiniões é **exclusivo para clientes logados**. Se deslogado, exibe um card de login amigável. Se logado, o formulário é exibido sem pedir e-mail ou CPF manualmente (coletado de forma oculta da sessão) e valida a compra de forma invisível. Comentários aprovados recebem a tag verde **"✓ Comprador verificado"**.
  2. *Coluna da Direita Fixo*:
     - Painel de compras contornado com prazo de frete expresso in verde amanhã, seletor de quantidades em dropdown, botão preenchido "Comprar agora", botão contornado "Adicionar ao carrinho", dados do vendedor e selos circulares ilustrados de Devolução Grátis (30 dias) e Compra Garantida.
  3. *Rodapé*: Seção de sugestões "Produtos do vendedor" listando outros itens do mix de produtos.
  4. *Rodapé Reduzido (Estilo Mercado Livre)*: Adicionado rodapé compacto e minimalista na base da página de produto com botão flutuante recortado de "Mais informações", links institucionais horizontais ('Trabalhe conosco', 'Termos e condições', etc.) e dados legais do CNPJ com menção ao grupo NZB Embalagens.
- **Autenticação e Sessão de Cliente (UserContext)**: Contexto global React criado in `contexts/UserContext.tsx` para gerenciar a autenticação (login, cadastro e logout) de clientes, mantendo o checkout de convidado (guest checkout). Fornece dados da sessão (Nome, E-mail, CPF) usados para a verificação automática de compras.
- **Página de Acesso ao Cliente (/login)**: Rota de login e cadastro dinâmicos estilizada em preto e laranja. Dá suporte a redirecionamento pós-login (URL return path) para que o cliente logado retorne instantaneamente à página de produto de onde iniciou o fluxo de avaliação.
- **Avaliações no Topo Dinâmicas**: O cabeçalho principal da página do produto agora lê dinamicamente a média aritmética de estrelas e a contagem real de opiniões a partir do estado do sistema de comentários.
- **Disparador de E-mails Transacionais (Resend API)**: Biblioteca `lib/email.ts` integrada com suporte à API do Resend para envio de e-mails profissionais responsivos contendo a identidade visual da NZB Embalagens para 5 etapas distinctas:
  1. *Carrinho Abandonado* (com listagem de itens e código de desconto VOLTEI5).
  2. *Aguardando Pagamento* (resumo, PIX Copia e Cola, e botão de fechamento).
  3. *Pagamento Aprovado* (confirmação instantânea Mercado Pago).
  4. *Nota Fiscal Emitida* (notificação de faturamento simulado no ERP Bling v3).
  5. *Pedido Despachado* (código de rastreio e link de transporte).
  - Inclui fallback automático para simulação via console caso a credencial do Resend não seja configurada em desenvolvimento.
- **Painel de Homologação Administrativa (/simulador-emails)**: Rota pública administrativa criada contendo tela de simulação onde o desenvolvedor ou cliente pode colocar seu e-mail e mandar individualmente ou em lote todos os 5 e-mails transacionais para validar a exibição responsiva na sua caixa de entrada.
- **Flow de Compra Focado em Detalhes**: Removidos os botões de "Adicionar ao Carrinho" rápido diretamente dos cards dos produtos na Home Page e na Página da Loja. Agora, o usuário é direcionado obrigatoriamente a passar pela Página de Detalhes do Produto (`/loja/[id]`) antes de incluir itens no carrinho, assegurando que visualize especificações importantes (dimensões, espessura e material) para uma experiência de compra B2B/B2C mais robusta e consciente.
- **Carrinho de Compras Dedicado (Estilo Mercado Livre)**: Rota `/carrinho` criada contendo página de carrinho dedicada no layout exato de duas colunas do Mercado Livre: checkbox geral, boxes individuais com imagens SVG de sacos PE/Zip/Vácuo correspondentes, lixeira, controle quantitativo (+/-) e resumo de compra lateral.
- **Simulador de Frete por CEP**: Adicionado painel de cálculo de frete dinâmico no carrinho. Coleta o CEP do usuário, valida o formato (8 dígitos), simula opções de frete (Melhor Envios PAC, SEDEX, Jadlog) com prazos de entrega reais, e soma o frete selecionado ao total do pedido na hora.
- **Checkout Centralizado B2B/B2C (Sem Rolagem)**: A página de checkout agora se alinha perfeitamente ao centro da tela (tanto vertical quanto horizontalmente). Oferece suporte dinâmico para compras CPF (Pessoa Física) ou CNPJ (Pessoa Jurídica) com Inscrição Estadual (I.E.) no primeiro passo.
- **Estrutura da Loja (Estilo Mercado Livre)**: Página `/loja` reconstruída com o visual exato da imagem de referência de anúncios do Mercado Livre (filtros detalhados na esquerda com switch deslizante, campos de preço Mínimo/Máximo, categorias em texto simples, e cards verticais com centavas em expoente, tags verdes de parcelamento/frete grátis, e tag azul de promoção Mercado Pago).
- **Dropdown do Header**: O botão "Todos os Produtos" no menu de navegação superior foi convertido em um dropdown suspenso funcional ativado por hover.
- **Mix de Produtos Simplificado**: Menu e categorias simplificados para conter apenas as categorias de atuação inicial: "Sacos Plásticos PE", "Sacos Zip Lock" e "Sacos a Vácuo". Foram criados os mocks e ranhuras de imagem específicas para a categoria de sacos a vácuo na loja.
- **Desenvolvimento Local**: Rodando Next.js localmente na porta 3000 (`npm run dev`).
- **Infraestrutura de Produção e Deploy**:
  - **Vercel**: Hospedado com sucesso via Vercel CLI na URL `https://abc-master-site-5q5w9o1x8-vinicius-marinhos-projects.vercel.app`.
  - **Render**: Banco de dados PostgreSQL managed.
  - **Hostinger VPS (migração futura)**: Next.js via `pm2` + Nginx como reverse proxy + PostgreSQL local.
  - **Build Command na Vercel**: `prisma generate && next build` (geração do Prisma Client antes do bundle).
  - **`postinstall`**: `prisma generate` adicionado no `package.json`.
  - **Erros de Build Corrigidos**:
    - Faltava importar `useEffect` no arquivo `app/carrinho/page.tsx`.
    - Envolvido o componente principal de `app/login/page.tsx` com `Suspense` para corrigir o erro de prerendering devido ao uso de `useSearchParams()`.
    - Removida a chave experimental `eslint` do `next.config.ts`.
  - **Novidades Bling ERP (API v3)**:
    - Implementado suporte completo de **Variações de Produtos** que agrupa automaticamente variações filhas nos produtos pais no mapeamento e importação.
    - Implementada função de **Importar Catálogo Completo** com paginação sequencial automática de todos os produtos do Bling em lote.
    - Criada a rota de **Webhook do Bling** em `/api/bling/webhook` com validação de assinatura `x-bling-signature-256` (HMAC-SHA256) para receber alterações em tempo real de estoque e dados de produtos.
  - **`.gitignore` atualizado**: `.env.example` agora é rastreado pelo git (referência pública), enquanto `.env.local` e `.env` permanecem ignorados.
  - **Commits e Pushes enviados** para `abcmaster-cmd/abc-master-site` (branch `main`).



---

## 🛠️ O que foi feito recentemente:
1. **Unificação do Header Global, Menu de Usuário com Abas & Novo Clube Master+**:
   - Removido o cabeçalho inline duplicado da Home Page (`app/page.tsx`) e substituído pela importação do componente global `<Header />` de `components/Header.tsx`, limpando imports, variáveis e estados de scroll/carrinho duplicados.
   - **Borda na Barra de Pesquisa**: Adicionada borda cinza claro (`#d0d0d0`) unificada ao redor de todo o formulário de busca no Header global, com efeito suave de transição CSS que altera a cor da borda para laranja (`#FF6B00`) e adiciona uma sombra leve de destaque ao receber foco.
   - **Menu de Usuário com Abas Sincronizadas**: Criado menu suspenso (dropdown) interativo ao passar o mouse no perfil do usuário logado em `components/Header.tsx`, contendo links com parâmetros de query URL para alternar entre as abas na Central do Usuário de forma instantânea.
   - **Remodelagem da Central do Usuário (`app/central-usuario/page.tsx`)**: Reconstruída no padrão de abas interativas no lado do cliente, integrada e sincronizada com a URL, permitindo navegar entre:
      * *Meus Pedidos*: Listagem unificada de todas as compras da conta, incluindo pedidos em andamento e finalizados (`pending`, `in_process`, `approved`, `shipped`, `delivered`, `rejected`).
     * *Dados Pessoais*: Formulário editável para alteração e persistência local (no `localStorage`) do nome e telefone do cliente.
     * *Dados de Faturamento (CNPJ)*: Painel de preenchimento de dados corporativos (Razão Social, CNPJ, I.E., Endereço) persistidos localmente para auto-completação inteligente do Checkout B2B.
     * *Minhas Avaliações*: Catálogo de produtos comprados em pedidos aprovados, fornecendo botão de redirecionamento focado na âncora `#avaliacoes` do produto para avaliação.
   - **Página Master+ (`app/master-plus/page.tsx`)**: Criada nova página para o programa de vantagens B2B/B2C da ABC Master Embalagens, detalhando frete fixo express regional (R$ 12,90), tabela de desconto progressivo em lote, suporte corporativo técnico e FAQ sanfonado interativo.
2. **Página de Produtos Estilo Shopee Seller Center & Controle de Estoque**:
   - A página de **Anúncios** (`app/admin/anuncios/page.tsx`) foi completamente redesenhada no estilo do **Shopee Seller Center**.
   - **Filtros Avançados (Grid)**: Inclui painel de busca avançada por Nome do Produto, SKU, Categoria (PE, Zip, Vácuo) e faixa de preço (Mínimo/Máximo), além de botões "Pesquisar" e "Limpar Filtros".
   - **Abas de Status (Estilo Shopee)**: Abas minimalistas com contadores dinâmicos para alternar entre "Todos", "Ativos" (em estoque), "Esgotados" (sem estoque) e "Inativos/Rascunhos".
   - **Tabela Reformulada**: Adicionados checkboxes de seleção em massa, coluna de Produto com miniatura (thumbnail) de imagem integrada, coluna de SKU detalhando variações técnicas (Tamanho, Espessura), controle de Preço editável inline (com ícone de lápis) e controle de Estoque editável inline com botões +/- e input direto, coluna de Vendas acumuladas, e ações de duplicar/deletar/editar.
   - **Correção de ReferenceError**: Resolvido o erro `"formatCurrency is not defined"` adicionando a declaração da função utilitária `formatCurrency` no escopo do arquivo.
   - **Ações em Lote**: Barra flutuante laranja que surge ao selecionar produtos para executar ações rápidas (Ex: Zerar Estoque ou Deletar em lote).
   - Deletada a página física `/admin/estoque` e removido seu atalho correspondente do menu lateral (`app/admin/AdminLayoutClient.tsx`), mantendo o gerenciamento de estoque concentrado diretamente no produto.
   - Criada a página de **Notas Fiscais (NF-e)** (`app/admin/nf-e/page.tsx`) integrada à emissão via Bling ERP de forma simulada, com funções de transmitir NF-e pendente, baixar XML, ver PDF e cancelar nota fiscal.
   - Deletada a página física redundante de **Envios / Etiquetas** (`app/admin/envios/page.tsx`) e removido seu atalho correspondente do menu lateral, já que toda a parte de faturamento, rastreamento e geração de etiquetas de postagem foi consolidada na página de Pedidos e na nova tela de Detalhes de Pedido.
   - Criada a página de **Configurações** (`app/admin/config/page.tsx`) com abas para dados cadastrais oficiais da empresa (Razão Social, CNPJ, Inscrição Estadual e endereço completo), chaves de integração/API (Bling, Mercado Pago, Resend) e regras de frete (CEP de origem).
   - Criadas as páginas de **Novo Anúncio** (`app/admin/anuncios/novo/page.tsx`) e **Editar Anúncio** (`app/admin/anuncios/[id]/editar/page.tsx`) integrando um widget completo e interativo de **Variações de Produtos** (Tamanho, Espessura, Cor). O widget realiza a combinação combinatória cartesiana das opções adicionadas nos atributos, monta uma tabela editável com SKU/Preço/Estoque individuais, desabilita os campos de faturamento gerais quando ativo para evitar conflitos de dados, fornece preenchimento em lote (bulk apply) de forma ágil e valida o formulário impedindo o cadastro de campos vazios nas variações.
   - Criada a página de **Detalhe do Pedido** (`app/admin/pedidos/[id]/page.tsx`) exibindo resumo financeiro completo, tabela de itens comprados com miniatura, informações cadastrais e fiscais do comprador, dados logísticos com rastreamento ativo e uma linha do tempo histórica do pedido, além de ações de emissão ágil de NF-e e etiquetas de envio.
3. **Motor de Cálculo de Frete Inteligente (Balanced Bin Packing)**:
   - **Utilitário Central ([lib/shippingOptimizer.ts](file:///c:/Users/Vinicius/.gemini/antigravity/scratch/abc-master-ecommerce/lib/shippingOptimizer.ts))**: Desenvolvemos um algoritmo de distribuição balanceada de volumes (Balanced Bin Packing) focado no mix de produtos da ABC Master (1 kg, 3 kg e 5 kg). O algoritmo calcula o número mínimo de volumes necessários sem ultrapassar o limite máximo por caixa (Correios/Jadlog = 30 kg, Flex = 20 kg) e redistribui a carga de forma equilibrada (usando LPT heuristic nos grandes e itens de 1 kg como ajuste fino).
   - **Integração no Carrinho ([app/carrinho/page.tsx](file:///c:/Users/Vinicius/.gemini/antigravity/scratch/abc-master-ecommerce/app/carrinho/page.tsx))**: Refatoramos o simulador de frete para calcular tarifas dinâmicas cotando cada volume de forma individual e somando-as no final. A interface exibe a quantidade exata de volumes gerada.
   - **Integração na Página do Produto ([app/loja/[id]/page.tsx](file:///c:/Users/Vinicius/.gemini/antigravity/scratch/abc-master-ecommerce/app/loja/[id]/page.tsx))**: A calculadora rápida de frete projeta a cubagem com base no peso e na quantidade selecionada do produto.
   - **Integração no Checkout ([app/checkout/page.tsx](file:///c:/Users/Vinicius/.gemini/antigravity/scratch/abc-master-ecommerce/app/checkout/page.tsx))**: O fluxo de entrega calcula o frete real por volumes e o valor consolidado é salvo nos pedidos finais.
4. **Dashboard de Desempenho Estilo Mercado Livre**:
   - O Dashboard Administrativo (`app/admin/dashboard/page.tsx`) foi completamente redesenhado no leiaute do **Mercado Livre / Mercado Pago**.
   - **Abas Superiores**: Abas de navegação horizontais estilizadas no padrão do Mercado Livre (Resumo, Anúncios, Vendas, Métricas, Preferências).
   - **Barra de Filtros**: Controles superiores para "Período principal" (dropdown contendo 7d, 15d, 30d, 60d, 90d) e comparação travada com o "Período anterior" de igual tamanho, acompanhado por botões de ação de relatórios e filtros.
   - **Resumo de Desempenho (Grid de 8 Cartões)**: Grade de 8 cartões reativos exibindo Vendas Brutas (com barra vermelha no topo no cartão principal), Unidades Vendidas, Preço Médio por Unidade, Visitas, Compradores, Quantidade de Vendas, Conversão e Preço Médio por Venda (Ticket Médio). Cada cartão exibe um badge colorido de variação percentual dinâmica calculada contra o período equivalente anterior (Verde ▲ para alta, Vermelho ▼ para queda).
   - **Gráfico de Linhas Dinâmico em SVG**: Curva de linhas suavizada (path Bézier SVG) contendo duas linhas comparativas: a linha rosa/magenta representando a receita do período atual e a linha cinza representando a receita do período anterior. A forma do traçado é reativa e muda dinamicamente de acordo com a quantidade de dias selecionada.
   - **Ajuste de Ações Rápidas**: Cartões de ação rápida e atalhos estilizados e links corrigidos para redirecionar ao fluxo de pedidos unificado.
4. **Banner Hero Boxed (Estilo Atacadão)**:
   - O Banner Hero na Home Page (`app/page.tsx`) foi envolto em um container de largura máxima de `1200px` (`maxWidth: 1200`), com margem automática (`margin: '24px auto 12px auto'`) e bordas arredondadas de `12px` (`borderRadius: '12px'`).
   - Dessa forma, o banner não preenche mais toda a largura horizontal (100% da viewport), alinhando-se harmoniosamente com o grid do restante da página e simulando o estilo de banners do Atacadão.
5. **Ajustes Visuais no Header (components/Header.tsx e app/page.tsx)**:
   - Aumentado o padding vertical do bloco logo + barra de pesquisa de `14px` para `22px` (superior e inferior), dando mais respiro à área principal do cabeçalho.
   - Menu de navegação de categorias alterado de fundo branco para **fundo laranja (#FF6B00)** em toda a barra, unificando a identidade visual.
   - Botão "Todos os Produtos" recebeu fundo `rgba(0,0,0,0.2)` (escurecimento sutil) para se destacar dentro da barra laranja.
   - Links de categorias e "Ver tudo →" ajustados para cor branca com efeito de hover via opacidade e underline branco.
5. **Listagem Horizontal de Produtos por Categoria**:
   - Reestruturada a Home Page para exibir cada categoria de produtos ("Sacos Plásticos PE", "Sacos Zip Lock" e "Sacos a Vácuo") em sua própria seção, listando seus itens em uma única linha horizontal contínua de cards.
   - Resolvido o erro `FEATURED_PRODUCTS is not defined` mapeando corretamente o array realista `MOCK_PRODUCTS` e aplicando o componente `ProductCard` com renderizações SVG flat dinâmicas de sacos plásticos.
 6. **Logotipos Redimensionados e Ampliados**:
   - Ampliado o logotipo dos cabeçalhos ([components/Header.tsx](file:///C:/Users/Vinicius/.gemini/antigravity/scratch/abc-master-ecommerce/components/Header.tsx) e [app/page.tsx](file:///C:/Users/Vinicius/.gemini/antigravity/scratch/abc-master-ecommerce/app/page.tsx)) de `150x44` para `210x62` pixels.
   - Ampliado o logotipo do rodapé na Home Page de `130x40` para `170x50` pixels.
  7. **Inicialização do Servidor de Desenvolvimento**:
    - O servidor local de desenvolvimento do Next.js foi iniciado com sucesso em segundo plano (`npm run dev`) sob o ID de tarefa `task-10`, disponibilizando as páginas de forma dinâmica no ambiente local (porta 3000).
 8. **Imagens Reais de Produtos (PNG)**:
   - Foram geradas fotos profissionais de estúdio para os produtos usando inteligência artificial: `/saco_pe.png` (saco PE transparente), `/saco_zip.png` (saco zip com lacre vermelho), `/saco_vacuo.png` (saco texturizado a vácuo) e `/saco_canela.png` (saco PE reciclado marrom/canela).
   - Copiadas as imagens de forma física para a pasta `public/` do projeto.
   - Integrada a renderização dessas imagens PNG no lugar dos antigos blocos SVG cinzas em três pontos cruciais do sistema: na Home Page dos clientes (`app/page.tsx`), na listagem administrativa de anúncios (`app/admin/anuncios/page.tsx`) e na tabela de itens do detalhe do pedido (`app/admin/pedidos/[id]/page.tsx`).
 9. **Imagem do Banner Completa na Home Page**:
   - Criada uma imagem de banner promocional panorâmica de alta qualidade via IA (`/home_banner.png`) contendo o branding e os produtos da ABC Master Embalagens com estilo moderno de estúdio em tons laranja e cinza.
   - Salvo o arquivo fisicamente no diretório `public/`.
   - Modificada a Home Page (`app/page.tsx`) para substituir o antigo banner de duas colunas (texto e imagem lateral) por esta única imagem de banner completa, tornando-a responsiva, clicável (aponta para `/loja`) e aplicando um efeito suave de zoom no hover.
 10. **Exibição de Múltiplos Itens com Fotos e Redesenho da Listagem de Pedidos em Cartões**:
    - Reestruturada a listagem principal de pedidos (`app/admin/pedidos/page.tsx`) para substituir a propriedade de string única do produto por uma lista detalhada contendo objetos de produtos (`items`) com nome, quantidade, categoria e preço unitário.
    - Atualizados os dados simulados das vendas `#1040` e `#1038` para conter múltiplos itens distintos na mesma compra.
    - **Substituição da Tabela por Contêineres de Cartões**: Removida a tabela tradicional achatada e criada uma listagem de blocos/cartões separados (`margin-bottom: 16px`), onde cada pedido é isolado visualmente com cantos arredondados, fundo branco e sombreamento leve.
    - **Bordas Laterais Coloridas por Status**: Adicionado um friso de destaque de `5px` na lateral esquerda de cada cartão indicando o estado do pedido (Verde para Aprovado, Roxo para Em análise, Laranja para Pendente, Vermelho para Rejeitado), fornecendo diferenciação visual máxima ao gestor.
    - **Estruturação Interna em Grid**: Criado um cabeçalho cinza claro contendo ID do Pedido (`#ID`) e a data/hora da venda. O corpo do cartão distribui os dados em colunas claras (Cliente, Itens do Pedido com miniaturas em PNG real e preços unitários, Total Geral com frete, Faturamento NF-e, Expedição e Geração de Etiquetas, e botão destacado para Ver Detalhes), eliminando confusões visuais na conferência e separação (picking) de mercadorias.
    - **Cálculo de Faturamento Correto**: Alterado o cálculo da coluna "Total Geral" para somar dinamicamente o subtotal de todos os itens e o valor do frete (`totalPayable = subtotal + shipping`). A seção de finanças de cada cartão agora exibe o valor da nota a pagar em negrito, detalhando logo abaixo os subvalores de produtos e frete de forma separada.
 11. **Agrupamento de Pedidos por Fluxo de Atendimento**:
    - Reestruturada a visualização de pedidos (`app/admin/pedidos/page.tsx`) para dividir a listagem em 3 grupos organizados verticalmente: "Aguardando Atendimento / Preparação", "Enviados / Em Trânsito" e "Finalizados / Concluídos".
    - Adicionados contadores numéricos de apoio no cabeçalho de cada seção para mensurar o volume de expedição.
    - Se uma seção não contiver pedidos sob os filtros ativos, renderiza-se um aviso visual delimitado informando que não há itens naquele estágio.
 12. **Nova Página de CRM de Clientes B2B**:
    - Criada a nova rota administrativa `/admin/clientes` (`app/admin/clientes/page.tsx`) e integrada à sidebar lateral (`app/admin/AdminLayoutClient.tsx`).
    - Implementados 4 cartões de KPIs analíticos (Total de Clientes, Taxa de Recorrência %, LTV Médio e Clientes VIP).
    - Criada a tabela de CRM relacionando compras efetuadas, LTV acumulado, data da última transação e classificação comportamental (VIP/Recorrente, Frequente, Novo, Inativo).
    - Adicionada a coluna de "Ação Comercial Recomendada" com botões dinâmicos que simulam na hora campanhas direcionadas a cada perfil (ex: conceder frete grátis B2B, propor faturamento no boleto 30d, disparar cupom de reativação).
    - Criadas automações gerenciais no topo com disparos simulados de e-mails em lote.
    - Removido o quadro estático escuro de conselhos comerciais ("Decisões de Negócio Orientadas a Dados") para deixar a interface do painel mais limpa e focada diretamente nas métricas e na listagem interativa de CRM.
 13. **Imagens Reais e Galeria com Zoom na Página de Vendas do Produto**:
    - Substituídos os placeholders vetoriais de SVG cinza na página de vendas do produto (`app/loja/[id]/page.tsx`) pelas fotos profissionais PNG correspondentes da embalagem (PE, Zip ou Vácuo).
    - Atualizados os botões da galeria de miniaturas na lateral esquerda para carregar a imagem real com diferentes níveis e origens de escala CSS.
    - Implementado efeito reativo de zoom na imagem grande principal: ao clicar na miniatura 2, aproxima-se o foco nas soldas laterais (escala de 1.6x); ao selecionar a miniatura 3, aplica-se zoom máximo (escala de 2.3x) no zíper de fechamento hermético ou na espessura do material, fornecendo um recurso técnico detalhado para conferência visual de alta qualidade do comprador B2B.
    - Removida a lista textual duplicada "O que você precisa saber sobre este produto" (e seu link associado) que ficava posicionada logo abaixo da imagem, mantendo como única fonte de características técnicas a tabela consolidada de "Características principais", otimizando a clareza e eliminando dados redundantes da tela.
 14. **Calculadoras de CEP e Regras do Envio Flex**:
    - Removida a regra estática de "Frete Grátis Nacional" para se adequar ao fluxo em que o frete é cobrado do cliente em todo o Brasil (PAC/SEDEX via Correios e Jadlog).
    - Criado um widget de cálculo por CEP no painel lateral de compras da página do produto (`app/loja/[id]/page.tsx`), equipado com máscara de CEP automática (`XXXXX-XXX`), tratamento de erros e simulação de rede com delay.
    - Implementada lógica regional para São Paulo e ABCD (prefixos `01` a `09`):
      *   Disponibilização da modalidade **Flex (Motoboy)** a preço fixo de `R$ 12,90`.
      *   Prazos dinâmicos reativos: "Chega HOJE" se comprado antes das 11:00h; "Chega AMANHÃ" se comprado após esse horário.
    - Implementada lógica para as demais regiões do Brasil (SEDEX, Jadlog Standard e PAC), com valores de tabela adequados para cobrir custos logísticos.
    - Integradas as mesmas regras de CEP e prazos no fluxo do checkout (`app/checkout/page.tsx`): ao preencher o CEP e sair do campo, as opções de frete e prazos corretos são gerados dinamicamente no Passo 3 e o valor contratado é somado ao montante geral da nota.
    - Corrigido bug de runtime (`ReferenceError: formatCurrency is not defined`) na calculadora do painel do produto substituindo a chamada pelo formatador nativo `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`.
 15. **Cards de Métricas Interativos na Gestão de Pedidos**:
    - Convertidos os 4 cards superiores de estatísticas logísticas (Total Geral, Não Atendidos, Enviados e Finalizados) em botões clicáveis de filtragem rápida na página de pedidos (`app/admin/pedidos/page.tsx`).
    - Desenvolvida a indicação visual ativa: o card selecionado ganha borda laranja proeminente (`#FF6B00`), sombra suave ampliada e tag textual indicativa ("● Ativo").
    - Sincronizada a seleção bidirecional com o seletor dropdown do cabeçalho da página (atualizar o card seleciona o item no select e vice-versa).
    - Reestruturado o fluxo operacional para segregação de faturamento: o antigo grupo "Aguardando Atendimento" foi dividido em **"Aguardando Pagamento / Em Análise"** (pedidos ainda não quitados que não devem ser tocados) e **"Prontos para Preparação / Pago"** (contendo estritamente os pedidos com status `approved`).
    - Atualizados os cards de KPIs do topo para 4 colunas interativas (removendo "Total Geral"), separando "Aguardando Pgto", "A Preparar (Pago)", "Enviados" e "Finalizados" para que a equipe de expedição acompanhe exatamente o que precisa faturar e embalar sem risco de despachar mercadorias não pagas. O clique em um card ativo limpa a filtragem (exibindo toda a esteira de fluxo).
    - Removido o menu dropdown `select` de status do cabeçalho da página, eliminando a redundância visual uma vez que a navegação e filtragem agora são feitas inteiramente de forma mais natural e interativa pelos cards superiores clicáveis.
    - Definida a aba **"A Preparar (Pago)"** como o filtro padrão inicial ao entrar na página de pedidos, assegurando que o operador veja de imediato a lista de trabalho necessária para expedição diária.
    - Implementada a ocultação condicional de grupos vazios: quando o usuário seleciona um card de status (como "A Preparar"), as demais seções logísticas vazias são ocultadas por completo na interface, exibindo apenas o grupo e os pedidos que atendem àquele filtro.
    - Atualizado o badge de notificação da barra lateral no item **"Pedidos"** (`app/admin/AdminLayoutClient.tsx`): o número estático (que antes exibia "3") foi substituído por uma contagem dinâmica que mapeia apenas os pedidos aprovados (a preparar) ainda não visualizados pelo administrador. Quando o operador acessa a página de pedidos, a contagem é marcada como lida e o badge desaparece, reaparecendo apenas se entrar um novo pedido aprovado.
    - Adicionada a exibição do **método de pagamento** no card de resumo de cada pedido (na coluna "Total Geral / Finanças") no painel do administrador, apresentando um badge cinza arredondado com o respectivo canal de liquidação (Ex: `💳 PIX`, `💳 Boleto Bancário`, `💳 Cartão de Crédito`) para que a expedição saiba exatamente como o faturamento foi efetuado.
    - Invertida a disposição dos elementos no cabeçalho cinza claro de cada card de pedido: o **status operacional** (Ex: `Aprovado (Aguardando Envio)`) foi deslocado para a esquerda ao lado do número do pedido (Ex: `Pedido #1040 | Aprovado...`), enquanto a **data e hora da compra** foi movida para a extremidade direita da linha, facilitando a leitura de prioridade temporal e status simultaneamente.
 16. **Central do Usuário e Sincronização de Pedidos**:
    - Desenvolvida a página **"Central do Cliente"** em `/central-usuario` (`app/central-usuario/page.tsx`), apresentando um painel pessoal com dados cadastrados (Nome, E-mail, CPF/CNPJ, Telefone) e a esteira de histórico de pedidos do comprador logado.
    - Atualizados os links de navegação no cabeçalho principal (`components/Header.tsx`), adicionando atalhos rápidos tanto no top bar ("Minha Conta" | "Meus Pedidos") quanto no box de perfil do header principal ao detectar a sessão do cliente ativa.
    - Sincronizada a base local de dados usando a chave `'abc_orders'` no `localStorage`:
      * Ao concluir o checkout (`app/checkout/page.tsx`), o pedido é registrado de forma detalhada contendo a lista rica de itens, frete, total geral, meio de faturamento e status inicial `'approved'`.
      * A página administrativa de pedidos (`app/admin/pedidos/page.tsx`) foi integrada para carregar e salvar diretamente de `'abc_orders'`, permitindo que alterações operacionais (ex: emitir NF-e ou despachar o pedido alterando o status para `'shipped'`) sejam imediatamente refletidas em tempo real para o cliente na central dele.
      * Adaptados os pedidos mock de inicialização de sessão de Marcio Silva e Ana Souza para o formato rico para fins de simulação de histórico.
    - Integrado o fluxo de autenticação ao processo de Checkout (`app/checkout/page.tsx`): caso o usuário já esteja logado no sistema ao finalizar a compra, a página de finalização captura automaticamente seus dados cadastrais (Nome, CPF/CNPJ, WhatsApp, E-mail) por meio do `useUser()` e oculta os campos de digitação manual de identificação. Em vez de inputs vazios, exibe um painel de confirmação estilizado em verde de "Identificação Confirmada via Minha Conta", acelerando o fluxo de compra e permitindo a continuidade direta para a etapa de frete com apenas um clique.
    - Implementada a **persistência em tempo real do rascunho de checkout** (`localStorage: abc_checkout_draft`): conforme o comprador preenche os campos de dados pessoais, empresa ou entrega (incluindo o CEP e opção de frete), os dados são salvos silenciosamente no navegador. Caso a página seja recarregada ou ele saia do fluxo e volte depois, as informações são restauradas imediatamente e a simulação de frete correspondente ao CEP recuperado é recalculada no carregamento. O rascunho é limpo automaticamente quando o pagamento é finalizado com sucesso.
    - Versionado e enviado (push) o commit contendo a Central do Usuário, integração de dados pessoais e o rascunho persistente do checkout diretamente na branch principal (`main`) no repositório remoto `abcmaster-cmd/abc-master-site` no GitHub.
    - Reestruturada a esteira de etapas do Checkout (`app/checkout/page.tsx`):
      * Agrupados os dados de endereço e seleção de frete no **Passo 2 (Entrega)**, calculando e exibindo as opções logísticas (PAC, SEDEX, Flex) no mesmo painel assim que um CEP válido é inserido ou carregado do rascunho.
      * Implementada a tela de checkout de pagamento interna no **Passo 3 (Pagamento)**, permitindo que o cliente selecione o meio de pagamento (Cartão de Crédito com formulário de dados e parcelas, Pix com QR Code e código copia e cola, ou Boleto Bancário) diretamente no site.
      * Corrigido o bug de tipagem no faturamento local dos itens, mapeando `price` para `unitPrice` da resposta do carrinho de compras e adicionando validações defensivas contra valores nulos na central.
    - Atualizada a página de Confirmação de Pedido (`app/sucesso/page.tsx`): substituído o botão genérico de suporte do WhatsApp pelo link de ação *"Acompanhar Pedido"*, direcionando o comprador à nova Central do Usuário (`/central-usuario`) para rastrear a entrega em tempo real. E efetuado o push das alterações diretamente na branch principal (`main`) no repositório remoto no GitHub.
 17. **Melhorias Visuais, Acessibilidade e Fotos Reais nos Cards**:
    - **Unificação com Fotos Reais PNG**: Substituímos as ilustrações vetoriais e blocos beges estáticos nos cards de produtos de todas as páginas (catálogo de `/loja` e seção "Produtos do vendedor" no detalhe do produto `/loja/[id]`) pelas fotos profissionais de estúdio reais em PNG correspondentes (`/saco_pe.png`, `/saco_zip.png`, `/saco_vacuo.png`, `/saco_canela.png`).
    - **Contraste de Cards & Destaque de Fundo**: Implementamos bordas cinzas mais nítidas (`#dcdcdc`) e sombras sutis (`boxShadow`) nos cards de produtos. Adicionamos uma micro-animação premium de elevação e ampliação de sombra no hover acompanhada de efeito de zoom suave na foto real (`scale(1.05)`).
    - **Acessibilidade na Barra Lateral**: Aumentamos o contraste dos links da barra lateral esquerda de anúncios (mencionando categorias e faixas de preço de `#666` para `#334155`) e dos inputs de preço manual e botão de aplicar (de `#ccc` para `#94a3b8`), com efeitos adicionais de foco na cor laranja da marca.
    - **Contraste no Rodapé**: Ajustamos o contraste dos direitos autorais e dados de CNPJ no rodapé da página do produto (de `#999` para `#475569`), garantindo conformidade com padrões de acessibilidade WCAG.
 18. **Simplificação de Navegação no Cabeçalho**:
    - **Botão "Todos os Produtos" sem Dropdown e Igual às Categorias**: Removemos o menu suspenso interativo (dropdown) e o respectivo estado `dropdownOpen` do cabeçalho global (`components/Header.tsx`). O botão foi convertido em um link direto simples para a loja `/loja`, teve o ícone de hambúrguer (`☰ `) removido e foi estilizado com o mesmo design padrão (fundo laranja, hover com opacidade e friso branco inferior) dos links de categoria.
    - **Remoção do Link "Ver tudo"**: Removemos o link redundante "Ver tudo →" posicionado no canto direito do menu de categorias laranja, simplificando a navegação.
 19. **Memorização de CEP Logística Dinâmica**:
    - **Persistência de CEP Global**: Implementamos a sincronização e armazenamento automático do CEP do usuário sob a chave `'abc_user_cep'` no `localStorage` após qualquer cálculo bem-sucedido.
    - **Auto-cálculo e Máscara**: Integramos o auto-carregamento e cálculo automático de frete dinâmico (conectando-se ao motor de Balanced Bin Packing) ao abrir qualquer página de produto (`app/loja/[id]/page.tsx`), carrinho de compras (`app/carrinho/page.tsx`) e na inicialização da entrega no checkout (`app/checkout/page.tsx`). Adicionamos máscara automática de CEP (`00000-000`) ao input do carrinho.
 20. **Remoção Completa de Menções a Frete Grátis**:
    - **Ajuste nos Cards de Produtos**: Removemos a exibição condicional e o texto "Frete grátis" dos cards de produtos na Home Page (`app/page.tsx`), no catálogo (`app/loja/page.tsx`) e na lista de produtos do vendedor (`app/loja/[id]/page.tsx`), substituindo-os pelo rótulo uniforme "Frete a calcular".
    - **Remoção de Filtros**: Eliminamos o filtro switch de "Frete grátis" e a respectiva variável de estado `onlyFreeShipping` da barra lateral de anúncios da loja.
 21. **Limpeza de Badges e Exposição de Meios de Pagamento**:
    - **Remoção de Novo / Vendidos**: Removemos a informação estática "Novo | +100 vendidos" do topo da área de compra na página de detalhes do produto (`app/loja/[id]/page.tsx`).
    - **Remoção da Promoção Mercado Pago**: Eliminamos a tag azul de "20% OFF Saldo no Mercado Pago" tanto dos cards de produto na Home Page (`app/page.tsx`) e no catálogo (`app/loja/page.tsx`), quanto da página de detalhes do produto.
    - **Quadro de Meios de Pagamento Aceitos**: Criamos e integramos diretamente na página do produto um painel premium detalhando os meios de faturamento aceitos com ícones intuitivos (Cartão de Crédito em 3x sem juros, Pix com aprovação imediata e Boleto Bancário à vista), substituindo o antigo link flutuante azul "Ver meios de pagamento e promoções".
 22. **Melhorias e Flexibilidade na Criação/Edição de Produtos**:
    - **Suporte a Vírgulas em Decimais**: Alteramos a tipagem dos inputs de preços (venda geral, original opcional, lote e variações) de `type="number"` para `type="text"`. Implementamos uma máscara regex `/[^0-9.,]/g` para possibilitar ao administrador digitar vírgulas e pontos decimais de forma fluida nos formulários de criação (`app/admin/anuncios/novo/page.tsx`) e edição (`app/admin/anuncios/[id]/editar/page.tsx`).
    - **Upload de Fotos com Suporte a WebP**: Adicionamos um componente de upload de fotos com input de arquivo que aceita extensões de imagens incluindo `.webp`. O arquivo é reativamente lido em tempo real através do `FileReader` do JavaScript e renderizado como um preview de miniatura com opção de exclusão.
    - **Separação de Medidas do Produto e Medidas da Embalagem**: Introduzimos dois blocos distintos de campos físicos: um para a Ficha Técnica do Produto (Largura do Produto, Comprimento do Produto, Espessura do Produto, Peso Unitário e Material) e outro para a logística de Envio (Largura da Embalagem, Altura da Embalagem, Comprimento da Embalagem e Peso da Embalagem).
 23. **Persistência Completa de Produtos (Banco Local localStorage)**:
    - **Banco de Dados Local Unificado (Repository Pattern)**: Criamos uma biblioteca unificada de acesso a dados em `lib/productDatabase.ts` para ser a fonte única da verdade de produtos em todo o site. Ela gerencia o array padrão de produtos, a gravação e a atualização sob a chave `'abc_products'` com versionamento de banco na versão `'1.1'`.
    - **Criação e Edição Sincronizadas**: Implementamos a lógica de gravação e atualização de anúncios consumindo a biblioteca unificada. Os novos produtos recebem IDs comerciais baseados em timestamp (`'prod-' + Date.now()`), evitando qualquer reset de cache ou conflitos de IDs no e-commerce.
    - **Exibição Dinâmica e Reativa**: Adaptamos a listagem administrativa, o catálogo de produtos e os detalhes de produtos para consumirem o `lib/productDatabase.ts`.
    - **Blindagem contra TypeError e Correção de Regras de Hooks**: Protegemos a função `formatCurrency` da listagem de pedidos administrativa contra valores `undefined`, `null` ou `NaN`. Corrigimos a ordem de declaração de Hooks na página de detalhes do produto (`app/loja/[id]/page.tsx`), eliminando o erro de crash do React. Blindamos a iteração da tabela de Ficha Técnica contra o erro `Cannot convert undefined or null to object` sob a chamada de `Object.entries(product.specifications)` nos produtos recém-criados que não possuem o objeto specifications cadastrado originalmente, construindo dinamicamente a tabela com base nas medidas individuais de largura, comprimento, espessura, peso e material inseridas no formulário.
 24. **Melhorias de Catálogo e Ficha Técnica**:
    - **Campo Recomendação de Uso**: Adicionado o campo "Recomendação de Uso (Indicação)" nos formulários de criação (`app/admin/anuncios/novo/page.tsx`) e edição (`app/admin/anuncios/[id]/editar/page.tsx`) de anúncios. Esse campo é salvo no banco local e exibido automaticamente na tabela de Características Principais da página de detalhes do produto (`app/loja/[id]/page.tsx`), ao lado dos demais campos técnicos (material, largura, comprimento, espessura e peso).
    - **Imagem do Card em Formato 1:1**: A área de imagem dos cards de produto no catálogo da loja (`app/loja/page.tsx`) foi alterada para formato quadrado usando `aspectRatio: '1 / 1'`. O `objectFit` foi mudado de `cover` (que recortava a imagem) para `contain` com padding interno de `12px`, garantindo que a imagem inteira seja visível sem distorções ou cortes, independentemente do tamanho original do arquivo.
 25. **Parcelamento Progressivo**:
    - Criada a função `getInstallments(price)` em `lib/productDatabase.ts` com regra: **até R$ 50** → 1x; **R$ 50,01 a R$ 100** → 2x sem juros; **acima de R$ 100** → 3x sem juros. Todos os pontos de exibição (catálogo, detalhes, criação e edição) usam essa função dinamicamente.
