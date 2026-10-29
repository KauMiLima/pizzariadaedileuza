/**
 * Lógica da página: cardápio com abas, montador de pedido
 * (pizza inteira ou meio a meio), mensagem do WhatsApp e pagamento Pix.
 * Depende de js/config.js e js/pix.js.
 */
(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Utilitários
  // ---------------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  const formatarPreco = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const linkWhatsApp = (mensagem) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

  async function copiarTexto(texto) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Alternativa para navegadores sem acesso à Clipboard API
      const campo = document.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.cssText = 'position: fixed; opacity: 0;';
      document.body.appendChild(campo);
      campo.select();
      document.execCommand('copy');
      campo.remove();
    }
  }

  // ---------------------------------------------------------------------------
  // Estado do pedido
  // metade1 / metade2: nome do sabor ou null.
  // metadeAtiva: qual metade o próximo "Escolher" preenche.
  // vaiPagarNoPix: vira true quando o cliente copia o Pix (entra na mensagem).
  // ---------------------------------------------------------------------------
  const pedido = { metade1: null, metade2: null, metadeAtiva: 1, vaiPagarNoPix: false };

  const CATEGORIAS_PIZZA = CATEGORIAS.map((c) => c.id).filter((id) => id !== 'bebidas');
  const PIZZAS = CATEGORIAS_PIZZA.flatMap((id) => CARDAPIO[id]);
  const buscarPizza = (nome) => PIZZAS.find((pizza) => pizza.nome === nome) || null;

  let categoriaAtual = CATEGORIAS[0].id;

  function escolherSabor(nome) {
    pedido[`metade${pedido.metadeAtiva}`] = nome;
    pedido.metadeAtiva = pedido.metadeAtiva === 1 ? 2 : 1;
    render();
  }

  function limparPedido() {
    Object.assign(pedido, { metade1: null, metade2: null, metadeAtiva: 1, vaiPagarNoPix: false });
    render();
  }

  /**
   * Resume o pedido atual. Um sabor (ou dois iguais) = pizza inteira.
   * @returns {null | { inteira: boolean, sabores: object[], total: number, descricao: string, mensagem: string }}
   */
  function resumirPedido() {
    const escolhidas = [buscarPizza(pedido.metade1), buscarPizza(pedido.metade2)].filter(Boolean);
    if (escolhidas.length === 0) return null;

    const inteira = escolhidas.length === 1 || escolhidas[0].nome === escolhidas[1].nome;
    const sabores = inteira ? [escolhidas[0]] : escolhidas;
    const total = Math.max(...sabores.map((pizza) => pizza.preco));
    const preco = formatarPreco(total);

    const descricao = inteira ? sabores[0].nome : `${sabores[0].nome} + ${sabores[1].nome}`;

    let mensagem = inteira
      ? `Olá! Quero uma pizza ${TAMANHO.nome} de ${sabores[0].nome} (${preco}), para retirada.`
      : `Olá! Quero uma pizza ${TAMANHO.nome} meio a meio: metade ${sabores[0].nome} e metade ${sabores[1].nome} (${preco}), para retirada.`;

    if (pedido.vaiPagarNoPix) mensagem += ' Vou pagar no Pix e envio o comprovante aqui.';

    return { inteira, sabores, total, descricao, mensagem };
  }

  // ---------------------------------------------------------------------------
  // Cardápio
  // ---------------------------------------------------------------------------
  const tabsEl = $('menu-tabs');
  const gridEl = $('menu-grid');
  const notaEl = $('menu-note');

  function renderAbas() {
    tabsEl.replaceChildren(
      ...CATEGORIAS.map((categoria) => {
        const ativa = categoria.id === categoriaAtual;
        const aba = document.createElement('button');
        aba.type = 'button';
        aba.className = `pill${ativa ? ' is-active' : ''}`;
        aba.setAttribute('role', 'tab');
        aba.setAttribute('aria-selected', String(ativa));
        aba.textContent = categoria.nome;
        aba.addEventListener('click', () => {
          categoriaAtual = categoria.id;
          renderCardapio({ animar: true });
        });
        return aba;
      })
    );
  }

  /** Selo do card: "Inteira", "Metade 1", "Metade 2" ou nada. */
  function seloDoSabor(nome, resumo) {
    if (!resumo) return null;
    if (resumo.inteira) return resumo.sabores[0].nome === nome ? 'Inteira' : null;
    if (pedido.metade1 === nome) return 'Metade 1';
    if (pedido.metade2 === nome) return 'Metade 2';
    return null;
  }

  function criarCard(item, { podeEscolher, animar, resumo }) {
    const selo = podeEscolher ? seloDoSabor(item.nome, resumo) : null;

    const card = document.createElement('article');
    card.className = ['card', selo && 'is-picked', !animar && 'no-anim'].filter(Boolean).join(' ');

    const tag = selo
      ? `<span class="tag tag-picked">${selo}</span>`
      : item.tag ? `<span class="tag">${item.tag}</span>` : '';

    card.innerHTML = `
      <div class="card-head">
        <h3>${item.nome}</h3>
        ${tag}
      </div>
      <p class="card-desc">${item.desc}</p>
      <div class="card-footer">
        <strong class="card-price">${formatarPreco(item.preco)}</strong>
      </div>
    `;

    if (podeEscolher) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'btn-add';
      botao.innerHTML = '<span aria-hidden="true">+</span> Escolher';
      botao.setAttribute('aria-label', `Escolher ${item.nome} para a metade ${pedido.metadeAtiva}`);
      botao.addEventListener('click', () => escolherSabor(item.nome));
      card.querySelector('.card-footer').appendChild(botao);
    }

    return card;
  }

  /** `animar` só é true ao trocar de aba, para os cards não "piscarem" a cada escolha. */
  function renderCardapio({ animar = false } = {}) {
    const podeEscolher = CATEGORIAS_PIZZA.includes(categoriaAtual);
    const resumo = resumirPedido();

    renderAbas();
    gridEl.replaceChildren(
      ...CARDAPIO[categoriaAtual].map((item) => criarCard(item, { podeEscolher, animar, resumo }))
    );
    notaEl.hidden = !podeEscolher;
  }

  // ---------------------------------------------------------------------------
  // Montador do pedido
  // ---------------------------------------------------------------------------
  const COR_MOLHO = '#C7361D';
  const COR_VAZIA = '#F1E2CC';

  function renderPedido() {
    const resumo = resumirPedido();

    [1, 2].forEach((n) => {
      const nome = pedido[`metade${n}`];
      const vaga = $(`slot-${n}`);
      vaga.classList.toggle('is-active', pedido.metadeAtiva === n);
      vaga.classList.toggle('is-filled', Boolean(nome));
      $(`slot-${n}-name`).textContent = nome || (n === 1 ? 'Escolha no cardápio' : 'Opcional');
    });

    // Ilustração: vazia, inteira (sem divisão) ou meio a meio
    const cor = resumo ? COR_MOLHO : COR_VAZIA;
    $('order-pizza-left').setAttribute('fill', cor);
    $('order-pizza-right').setAttribute('fill', cor);
    $('order-pizza-divider').style.display = resumo && resumo.inteira ? 'none' : '';
    $('order-pizza-cheese').style.opacity = resumo ? '0.85' : '0';
    $('order-pizza').setAttribute('aria-label', resumo ? `Sua pizza: ${resumo.descricao}` : 'Pizza ainda sem sabor');

    const enviar = $('order-send');
    $('order-clear').hidden = !resumo;

    if (!resumo) {
      $('order-kind').textContent = 'Nenhum sabor escolhido';
      $('order-price').textContent = formatarPreco(0);
      enviar.href = '#cardapio';
      enviar.removeAttribute('target');
      enviar.classList.add('is-disabled');
      enviar.setAttribute('aria-disabled', 'true');
      return;
    }

    $('order-kind').textContent = `${resumo.inteira ? 'Pizza inteira' : 'Meio a meio'} · ${resumo.descricao}`;
    $('order-price').textContent = formatarPreco(resumo.total);
    enviar.href = linkWhatsApp(resumo.mensagem);
    enviar.target = '_blank';
    enviar.rel = 'noopener';
    enviar.classList.remove('is-disabled');
    enviar.removeAttribute('aria-disabled');
  }

  // ---------------------------------------------------------------------------
  // Barra fixa com o resumo (some quando a seção do pedido está na tela)
  // ---------------------------------------------------------------------------
  const barraEl = $('order-bar');
  let secaoPedidoVisivel = false;

  function renderBarra() {
    const resumo = resumirPedido();
    barraEl.hidden = !resumo || secaoPedidoVisivel;
    if (resumo) {
      const tipo = resumo.inteira ? `${resumo.descricao} (inteira)` : resumo.descricao;
      $('order-bar-text').textContent = `Sua pizza: ${tipo} · ${formatarPreco(resumo.total)}`;
    }
  }

  new IntersectionObserver(
    ([entrada]) => {
      secaoPedidoVisivel = entrada.isIntersecting;
      renderBarra();
    },
    { threshold: 0.3 }
  ).observe($('pedido'));

  // ---------------------------------------------------------------------------
  // Pix (o código não muda, então o QR Code é desenhado uma única vez)
  // ---------------------------------------------------------------------------
  function iniciarPix() {
    const qrEl = $('pix-qr');

    if (!Pix.estaConfigurado(PIX)) {
      $('pix-key').textContent = 'ainda não configurada';
      qrEl.innerHTML = '<p class="pix-qr-empty">Configure a chave Pix em js/config.js</p>';
      $('pix-copy-code').disabled = true;
      $('pix-copy-key').hidden = true;
      return;
    }

    const codigo = Pix.gerarCodigo(PIX);
    $('pix-key').textContent = PIX.chave;

    if (typeof qrcode === 'function') {
      const qr = qrcode(0, 'M');
      qr.addData(codigo);
      qr.make();
      qrEl.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } else {
      // Sem internet a biblioteca do QR não carrega; o "copia e cola" continua funcionando
      qrEl.innerHTML = '<p class="pix-qr-empty">Use o botão “Copiar código Pix”</p>';
    }

    let timerAviso;
    const avisar = (texto) => {
      const aviso = $('pix-feedback');
      aviso.textContent = texto;
      clearTimeout(timerAviso);
      timerAviso = setTimeout(() => (aviso.textContent = ''), 4000);
    };

    const aoCopiar = async (texto, aviso) => {
      await copiarTexto(texto);
      pedido.vaiPagarNoPix = true;
      renderPedido(); // a mensagem do WhatsApp passa a avisar o pagamento por Pix
      avisar(aviso);
    };

    $('pix-copy-code').addEventListener('click', () =>
      aoCopiar(codigo, '✓ Código copiado! Abra o app do banco → Pix → Pix copia e cola e digite o valor do pedido.')
    );
    $('pix-copy-key').addEventListener('click', () =>
      aoCopiar(PIX.chave, '✓ Chave copiada! Cole no app do banco e digite o valor do pedido.')
    );
  }

  // ---------------------------------------------------------------------------
  // Eventos e inicialização
  // ---------------------------------------------------------------------------
  function render({ animar = false } = {}) {
    renderCardapio({ animar });
    renderPedido();
    renderBarra();
  }

  function iniciar() {
    // Links genéricos de WhatsApp
    document.querySelectorAll('[data-whatsapp]').forEach((link) => {
      link.href = linkWhatsApp('Olá! Gostaria de fazer um pedido para retirada.');
      link.target = '_blank';
      link.rel = 'noopener';
    });

    // Textos que vêm da configuração
    document.querySelectorAll('[data-tamanho]').forEach((el) => {
      el.textContent = `${TAMANHO.nome} (${TAMANHO.fatias} fatias)`;
    });
    document.querySelectorAll('[data-preco-pizza]').forEach((el) => {
      el.textContent = formatarPreco(PRECO_PIZZA);
    });
    $('current-year').textContent = new Date().getFullYear();

    // Clicar numa vaga: ela vira a ativa e o cliente vai ao cardápio escolher
    [1, 2].forEach((n) => {
      $(`slot-${n}`).addEventListener('click', () => {
        pedido.metadeAtiva = n;
        if (!CATEGORIAS_PIZZA.includes(categoriaAtual)) categoriaAtual = CATEGORIAS_PIZZA[0];
        render({ animar: true });
        $('cardapio').scrollIntoView({ behavior: 'smooth' });
      });
    });
    $('order-clear').addEventListener('click', limparPedido);

    iniciarPix();
    render({ animar: true });
  }

  iniciar();
})();
