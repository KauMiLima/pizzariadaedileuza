/**
 * Configuração do site — é o único arquivo que precisa ser editado
 * para mudar cardápio, preços, WhatsApp ou Pix.
 */

/** Número do WhatsApp: só dígitos, com DDI 55 + DDD. */
const WHATSAPP = '5598988716178';

/**
 * Dados do Pix (conferidos com o QR Code do Banco do Brasil da pizzaria).
 * Formato da chave conforme o tipo:
 *   - Celular:   '+5598988716178' (com +55 e DDD, sem espaços)
 *   - CPF/CNPJ:  só números
 *   - E-mail:    'nome@email.com'
 *   - Aleatória: a chave completa, com os traços
 * O padrão Pix limita o nome a 25 letras e a cidade a 15 (o código corta sozinho).
 */
const PIX = {
  chave: '+5598988716178',
  nome: 'EDILEUSA MARINHO RODRIGUES',
  cidade: 'VITORIA DO MEARIM',
};

/** Tamanho e preço únicos de todas as pizzas. */
const TAMANHO = { nome: 'Grande', fatias: 8 };
const PRECO_PIZZA = 55;

/** Categorias exibidas como abas. Bebidas não entram no montador de pizza. */
const CATEGORIAS = [
  { id: 'pizzas', nome: 'Pizzas' },
  { id: 'bebidas', nome: 'Bebidas' },
];

/** Itens do cardápio por categoria. `tag` (opcional) vira um selo no card. */
const CARDAPIO = {
  pizzas: [
    { nome: 'Calabresa', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, calabresa, cebola, tomate, pimentão e orégano.' },
    { nome: 'Frango', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, frango, cebola, tomate, pimentão, milho e orégano.' },
    { nome: 'Mussarela', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, cebola, tomate, pimentão e orégano.' },
    { nome: 'Carne Seca', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, carne seca, cebola, tomate, pimentão e orégano.' },
    { nome: 'Bacon', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, bacon, cebola, tomate, pimentão e orégano.' },
    { nome: 'Portuguesa', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, presunto, cebola, tomate, pimentão, ovo cozido e orégano.' },
    { nome: 'Frango com Catupiry', preco: PRECO_PIZZA, desc: 'Molho especial da casa, mussarela, frango com catupiry, cebola, tomate, pimentão, milho e orégano.' },
  ],
  // TODO: confirmar bebidas e preços com a pizzaria.
  bebidas: [
    { nome: 'Refrigerante 2L', preco: 14, desc: 'Coca-Cola, Guaraná ou Fanta.' },
    { nome: 'Refrigerante lata', preco: 6, desc: '350 ml.' },
    { nome: 'Suco natural 500 ml', preco: 10, desc: 'Cajá, acerola, maracujá ou laranja.' },
    { nome: 'Água mineral', preco: 4, desc: 'Com ou sem gás, 500 ml.' },
  ],
};
