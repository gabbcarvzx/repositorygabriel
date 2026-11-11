# Direção visual e motion — Gabriel Carvalho

## Conceito

Um campo de linhas curvas de luz atravessa a página. A luz e os contornos mudam de posição e escala conforme o visitante passa da assinatura tipográfica ao PeladaPro, aos demais projetos e ao contato. O conteúdo permanece imóvel em relação à rolagem nativa; a profundidade existe nas camadas decorativas e nas capturas recortadas. O verde ácido marca direção e ações, sem virar uma camada sobre o texto.

## Sistema visual

- Grafite `#101310`, superfície `#171b16`, branco suave `#eff2e9`, texto secundário `#abb5a5`, verde `#b9f248`, linha `#3b4536`.
- Anton no display e IBM Plex Sans no texto, servidas localmente. Hierarquia e composição editorial existentes permanecem.
- Conteúdo com largura máxima de 1440 px, margens fluidas e seções com respiro. Capturas reais dos projetos, sem iframes nem conteúdo inventado.
- WhatsApp é uma ação explícita na navegação mobile, no contato e nas páginas de projeto; nunca um botão flutuante.

## Tese do movimento

- **Momento focal:** a abertura move contornos curvos e uma superfície de luz em profundidades diferentes. Durante o scroll, as linhas passam pela imagem do PeladaPro e continuam mais quietas nas áreas de leitura.
- **Continuidade:** o fundo fixo usa a altura da janela para o deslocamento mais expressivo entre abertura e PeladaPro e o progresso da página para continuar mudando nas seções seguintes. As camadas têm velocidades e direções diferentes. A interpolação não move o texto. As imagens recebem parallax pequeno dentro de recortes com margem de escala.
- **Feedback:** ponteiro preciso desloca suavemente a luz da abertura e o centro de duas ações. A área clicável não se move. Imagens podem inclinar discretamente dentro do recorte. Saída do ponteiro retorna ao repouso.
- **Ritmo:** uma entrada curta da abertura; PeladaPro ganha presença pela transição de escala entre título e captura; os outros projetos entram uma vez, com amplitudes alternadas e contidas. Contato fecha com a luz mais concentrada.

## Tokens e implementação

- Resposta de controle: 140–200 ms. Entrada da abertura: até 650 ms. Entrada de projeto: 420–520 ms. Retorno do ponteiro: aproximadamente 300 ms.
- Curva de chegada: `cubic-bezier(.16,1,.3,1)`; feedback imediato: `cubic-bezier(.22,1,.36,1)`. Sem bounce ou overshoot de texto.
- Profundidade do fundo: nos primeiros 900 px de rolagem desktop, as linhas avançam mais de 100 px na horizontal e a luz avança menos de 50 px, criando deslocamento relativo visível. A composição continua evoluindo pelo progresso total da página; escala limitada a 1.18. Imagem até 3% de deslocamento vertical e 1° de inclinação. No celular, a terceira camada fica oculta.
- Um controlador `requestAnimationFrame` calcula scroll, ponteiro e tempo ambiente fora do render React. Alvos de scroll e ponteiro são interpolados com suavização exponencial independente da taxa de quadros; não há biblioteca de animação, WebGL nem scroll hijacking.
- O controlador JavaScript é o único responsável pelo `transform` do centro magnético; CSS controla apenas cor e superfície. Coordenadas decorativas mantêm precisão subpixel, evitando degraus de 1 px.
- Medidas geométricas são tomadas na montagem e no resize. Durante os frames, escrever apenas transforms/opacity em elementos decorativos. Listeners, observers e frames são limpos ao desmontar.

## Acessibilidade e limites

- A camada decorativa usa `aria-hidden` e `pointer-events:none`. Texto, links e foco não se deslocam.
- O controle de pausa persiste e interrompe loop ambiente, parallax de scroll, resposta do ponteiro e movimentos decorativos de imagens; também existe nas páginas de projeto.
- Aba oculta suspende o frame. `prefers-reduced-motion` fixa a composição, remove parallax/magnetismo e mantém os controles utilizáveis. Dispositivos sem ponteiro preciso não recebem interações de mouse.
- Conteúdo está visível antes de qualquer JavaScript de entrada. A rolagem continua nativa. Screenshots não comprovam fluidez; observar scroll lento, rápido, reverso, pausa e retorno do ponteiro em navegador real.
