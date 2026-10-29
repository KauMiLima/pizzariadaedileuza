# 🍕 Pizza da Edileuza — Landing page e cardápio online

Landing page para uma pizzaria de Vitória do Mearim – MA. O cliente vê o cardápio, monta a pizza (inteira ou meio a meio), envia o pedido pronto pelo WhatsApp e paga com Pix direto pelo site.

Feito com **HTML, CSS e JavaScript puros** — sem frameworks e sem etapa de build.

## ✨ Funcionalidades

- **Cardápio com abas** gerado a partir de um único arquivo de dados (`js/config.js`).
- **Montador de pedido**: um sabor vira pizza inteira; dois sabores, meio a meio. Os sabores escolhidos ficam destacados no cardápio.
- **Pedido pelo WhatsApp** com a mensagem já escrita (sabores, valor e forma de retirada).
- **Pagamento Pix**: botão de *copia e cola* e QR Code gerados no navegador, seguindo o padrão **BR Code (EMV)** do Banco Central, com cálculo do CRC16.
- **Barra fixa** com o resumo do pedido enquanto o cliente navega.
- **Animação de entrada** da pizza em SVG + CSS (sem imagens).
- **Responsivo** (mobile first nos pontos críticos) e **acessível**: navegação por teclado, `aria-*`, contraste AA e respeito a `prefers-reduced-motion`.
- Endereço com link e mapa do Google Maps.

## 🛠️ Tecnologias

| Camada | Uso |
| --- | --- |
| HTML5 | Estrutura semântica, sprite de ícones SVG |
| CSS3 | Custom properties, Grid, Flexbox, `clamp()`, animações com `@keyframes` |
| JavaScript (ES2020+) | Renderização do cardápio, estado do pedido, geração do código Pix |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | Desenho do QR Code (via CDN) |
| Google Fonts | Anton (títulos) e Poppins (texto) |

## 📁 Estrutura

```
.
├── index.html          # Página única
├── assets/
│   └── favicon.svg
├── css/
│   └── style.css       # Estilos organizados por seção (índice no topo do arquivo)
└── js/
    ├── config.js       # ⚙️ Dados editáveis: cardápio, preços, WhatsApp e Pix
    ├── pix.js          # Gerador do código Pix (BR Code + CRC16)
    └── main.js         # Lógica da página
```

## 🚀 Como rodar

Não precisa instalar nada. Basta abrir o `index.html` no navegador.

Para desenvolver com recarregamento automático, use a extensão **Live Server** do VS Code (botão *Go Live*).

> O QR Code, as fontes e o mapa são carregados da internet. Sem conexão, o site continua funcionando e o Pix pode ser pago pelo botão *Copiar código Pix*.

## ⚙️ Como editar

Tudo o que muda com frequência fica em **`js/config.js`**:

```js
const WHATSAPP = '5598988716178';          // DDI + DDD + número
const PRECO_PIZZA = 55;                    // preço único das pizzas

const CARDAPIO = {
  pizzas: [
    { nome: 'Calabresa', preco: PRECO_PIZZA, desc: 'Molho especial da casa, ...' },
    // adicione ou remova sabores aqui
  ],
};
```

O comentário no topo do arquivo explica o formato da chave Pix para cada tipo (celular, CPF/CNPJ, e-mail ou aleatória).

## 💳 Como funciona o Pix

O código *copia e cola* é montado em `js/pix.js` no formato **TLV** (ID + tamanho + valor) definido pelo Banco Central, terminando com um **CRC16-CCITT**. O código é estático e **sem valor fixo**: o cliente digita o total no app do banco, já que o pedido pode incluir bebidas.

O pagamento não é confirmado automaticamente. A pizzaria confere pelo comprovante enviado no WhatsApp.

## 🌐 Publicação

O site é estático, então pode ser publicado de graça no **GitHub Pages**: *Settings → Pages → Deploy from a branch → `main` / `(root)`*.

---

Desenvolvido por **Kauã Lima**.
