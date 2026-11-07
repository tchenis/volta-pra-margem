/**
 * Volta pra Margem - JavaScript Principal
 * Sem dependências externas, leve, modular e acessível
 */

// ==========================================================================
// CONFIGURAÇÕES GLOBAIS
// ==========================================================================
const CONFIG = {
  // Link oficial de checkout da Cakto
  linkCheckout: "https://pay.cakto.com.br/3dviaos_1294380",
  pixelMetaId: "515619077217163"
};

// ==========================================================================
// 1. GERENCIAMENTO DE LINKS DE CHECKOUT E PARÂMETROS UTM
// ==========================================================================
function inicializarLinksCheckout() {
  const paramsAtuais = new URLSearchParams(window.location.search);
  const botoesCheckout = document.querySelectorAll('.btn-checkout');

  botoesCheckout.forEach(botao => {
    // Permite configurar via CONFIG.linkCheckout ou via atributo data-checkout
    const baseCheckout = botao.getAttribute('data-checkout') || CONFIG.linkCheckout;
    const isPlaceholder = !baseCheckout || baseCheckout.includes('[') || baseCheckout.includes(']');

    if (isPlaceholder) {
      botao.setAttribute('href', '#oferta');
      botao.addEventListener('click', (e) => {
        // Dispara o evento InitiateCheckout do Meta Pixel
        dispararEventoPixel('InitiateCheckout', {
          content_name: 'Volta pra Margem - Kit de Bordo',
          value: 14.90,
          currency: 'BRL'
        });

        console.info('[Volta pra Margem] O link de checkout ainda está como marcador:', baseCheckout);
      });
      return;
    }

    try {
      // Constrói URL mesclando parâmetros existentes da URL base com os da página atual
      const urlDestino = new URL(baseCheckout, window.location.origin);
      
      // Anexa todos os parâmetros da URL atual (utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, src, sck, etc.)
      paramsAtuais.forEach((valor, chave) => {
        urlDestino.searchParams.set(chave, valor);
      });

      botao.setAttribute('href', urlDestino.toString());
    } catch (err) {
      // Fallback para URLs relativas ou formatos especiais
      const separador = baseCheckout.includes('?') ? '&' : '?';
      const searchString = window.location.search.replace(/^\?/, '');
      if (searchString) {
        botao.setAttribute('href', `${baseCheckout}${separador}${searchString}`);
      } else {
        botao.setAttribute('href', baseCheckout);
      }
    }

    // Listener para o evento InitiateCheckout do Meta Pixel
    botao.addEventListener('click', () => {
      dispararEventoPixel('InitiateCheckout', {
        content_name: 'Volta pra Margem - Kit de Bordo',
        value: 14.90,
        currency: 'BRL'
      });
    });
  });
}

// Disparador seguro do Meta Pixel
function dispararEventoPixel(evento, dados = {}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', evento, dados);
  }
}

// ==========================================================================
// 2. META PIXEL: VIEW CONTENT NA SEÇÃO OFERTA (IntersectionObserver)
// ==========================================================================
function inicializarObserverOferta() {
  const secaoOferta = document.getElementById('oferta');
  if (!secaoOferta) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dispararEventoPixel('ViewContent', {
          content_name: 'Volta pra Margem - Oferta Kit de Bordo',
          value: 14.90,
          currency: 'BRL'
        });
        // Dispara apenas uma única vez
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.25 // Dispara quando 25% da oferta estiver visível na tela
  });

  observer.observe(secaoOferta);
}

// ==========================================================================
// 3. BARRA FIXA MOBILE (Aparece após rolar além do hero)
// ==========================================================================
function inicializarBarraMobile() {
  const hero = document.getElementById('hero');
  const barraMobile = document.getElementById('barraMobile');

  if (!hero || !barraMobile) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Se o hero NÃO está visível (o usuário já rolou para baixo), mostra a barra
      if (!entry.isIntersecting) {
        barraMobile.classList.add('visivel');
        barraMobile.setAttribute('aria-hidden', 'false');
      } else {
        barraMobile.classList.remove('visivel');
        barraMobile.setAttribute('aria-hidden', 'true');
      }
    });
  }, {
    threshold: 0.1
  });

  observer.observe(hero);
}

// ==========================================================================
// 4. TESTE RÁPIDO INTERATIVO (JavaScript Puro)
// ==========================================================================
const PERGUNTAS_TESTE = [
  {
    pergunta: "Você puxou a corda várias vezes, sente cheiro forte de gasolina e o motor não pega. O que é mais provável?",
    opcoes: [
      { texto: "Falta de gasolina", correta: false },
      { texto: "Motor afogado", correta: true },
      { texto: "Hélice presa", correta: false },
      { texto: "Bateria fraca", correta: false }
    ],
    explicacao: "Cheiro forte de gasolina depois de várias tentativas é sinal típico de motor afogado. Continuar puxando com o afogador acionado só piora."
  },
  {
    pergunta: "O motor está ligado, mas o jato de água que sai dele parou. O que fazer primeiro?",
    opcoes: [
      { texto: "Acelerar mais", correta: false },
      { texto: "Desligar o motor e verificar a entrada de água e o jato", correta: true },
      { texto: "Seguir navegando até a margem", correta: false },
      { texto: "Trocar a vela", correta: false }
    ],
    explicacao: "O jato mostra que a água está refrigerando o motor. Sem ele, o motor pode superaquecer. Primeiro desliga, depois investiga."
  },
  {
    pergunta: "Você vira a chave ou puxa a corda e o motor não dá nenhum sinal de vida. Qual o primeiro item do passo zero?",
    opcoes: [
      { texto: "Abrir o carburador", correta: false },
      { texto: "Trocar o óleo da rabeta", correta: false },
      { texto: "Conferir se o cordão de emergência está encaixado", correta: true },
      { texto: "Chamar o mecânico", correta: false }
    ],
    explicacao: "Com o cordão de emergência solto, o motor não liga. Parece pane, mas é só o cordão."
  }
];

let indicePerguntaAtual = 0;
let respondido = false;

function renderizarPergunta() {
  const containerPergunta = document.getElementById('testePerguntaContainer');
  const containerConclusao = document.getElementById('testeConclusaoContainer');
  const progressoTexto = document.getElementById('testeProgressoTexto');
  const perguntaTexto = document.getElementById('testePerguntaTexto');
  const opcoesContainer = document.getElementById('testeOpcoesContainer');
  const explicacaoBox = document.getElementById('testeExplicacaoBox');
  const explicacaoTexto = document.getElementById('testeExplicacaoTexto');
  const explicacaoTitulo = document.getElementById('testeExplicacaoTitulo');
  const btnProxima = document.getElementById('btnProximaPergunta');

  if (!containerPergunta || !containerConclusao) return;

  if (indicePerguntaAtual >= PERGUNTAS_TESTE.length) {
    containerPergunta.style.display = 'none';
    containerConclusao.classList.add('visivel');
    return;
  }

  const dados = PERGUNTAS_TESTE[indicePerguntaAtual];
  respondido = false;

  progressoTexto.textContent = `Pergunta ${indicePerguntaAtual + 1} de ${PERGUNTAS_TESTE.length}`;
  perguntaTexto.textContent = dados.pergunta;
  opcoesContainer.innerHTML = '';
  explicacaoBox.classList.remove('visivel');
  btnProxima.classList.remove('visivel');

  const letras = ['a', 'b', 'c', 'd'];

  dados.opcoes.forEach((opcao, idx) => {
    const botao = document.createElement('button');
    botao.className = 'opcao-btn';
    botao.setAttribute('type', 'button');
    botao.innerHTML = `
      <span class="opcao-letra">${letras[idx]})</span>
      <span class="opcao-texto">${opcao.texto}</span>
    `;

    botao.addEventListener('click', () => {
      if (respondido) return;
      respondido = true;

      // Desabilita todos os botões e marca visualmente
      const botoes = opcoesContainer.querySelectorAll('.opcao-btn');
      botoes.forEach((b, i) => {
        b.setAttribute('disabled', 'true');
        if (dados.opcoes[i].correta) {
          b.classList.add('correta');
        } else if (i === idx) {
          b.classList.add('incorreta');
        }
      });

      // Exibe explicação
      if (opcao.correta) {
        explicacaoTitulo.innerHTML = '✔ Correto!';
        explicacaoTitulo.style.color = 'var(--verde-agua)';
      } else {
        explicacaoTitulo.innerHTML = '✖ Resposta incorreta';
        explicacaoTitulo.style.color = 'var(--vermelho-semaforo)';
      }
      explicacaoTexto.textContent = dados.explicacao;
      explicacaoBox.classList.add('visivel');

      // Botão próxima
      btnProxima.classList.add('visivel');
      btnProxima.textContent = (indicePerguntaAtual === PERGUNTAS_TESTE.length - 1)
        ? 'Ver Resultado'
        : 'Próxima Pergunta →';
    });

    opcoesContainer.appendChild(botao);
  });
}

function inicializarQuiz() {
  const btnProxima = document.getElementById('btnProximaPergunta');
  if (btnProxima) {
    btnProxima.addEventListener('click', () => {
      indicePerguntaAtual++;
      renderizarPergunta();
    });
  }
  renderizarPergunta();
}

// ==========================================================================
// 5. ACORDEÃO DE PERGUNTAS FREQUENTES (FAQ)
// ==========================================================================
function inicializarFaq() {
  const itensFaq = document.querySelectorAll('.faq-item');

  itensFaq.forEach(item => {
    const botao = item.querySelector('.faq-pergunta-btn');
    if (!botao) return;

    botao.addEventListener('click', () => {
      const estaAberto = item.classList.contains('aberto');

      // Fecha todos os outros itens para manter limpo
      itensFaq.forEach(outroItem => {
        outroItem.classList.remove('aberto');
        const outroBotao = outroItem.querySelector('.faq-pergunta-btn');
        if (outroBotao) outroBotao.setAttribute('aria-expanded', 'false');
      });

      // Alterna o item atual
      if (!estaAberto) {
        item.classList.add('aberto');
        botao.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('aberto');
        botao.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// ==========================================================================
// INICIALIZAÇÃO AO CARREGAR O DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  inicializarLinksCheckout();
  inicializarObserverOferta();
  inicializarBarraMobile();
  inicializarQuiz();
  inicializarFaq();
});
