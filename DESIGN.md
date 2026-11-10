# Direção visual — Gabriel Carvalho

## Conceito
Uma superfície de campo: linhas de perspectiva muito finas e uma luz verde ácida lenta dão profundidade à abertura. O resto da página trata os trabalhos como peças editoriais, com respiro, escala variável e informação objetiva. Modo da superfície: Experience.

## Tokens
- Grafite `#101310`; superfície `#171b16`; branco suave `#eff2e9`; texto secundário `#abb5a5`; verde ácido `#b9f248`; linha `#3b4536`.
- Tipografia: Anton no display e IBM Plex Sans no texto, ambas distribuídas localmente pelo build com licença aberta. Fallbacks de sistema apenas quando a fonte não carregar.
- Layout: largura máxima 1440 px, margens fluidas de 20–72 px, ritmo vertical de 72–160 px.
- Motion: resposta de controles 160 ms e transição da mídia 550 ms; easing `cubic-bezier(.22,1,.36,1)`. Não há entradas automáticas de conteúdo. O fundo responde ao scroll com até 90 px de deslocamento, usando transform e opacity sem estado React por pixel.
- O campo usa animações ambiente de 9 s (luz) e 16 s (linhas); em telas pequenas, linhas 2D em 18 s. Pausa manual, aba oculta, área fora da janela e preferência por movimento reduzido interrompem o movimento contínuo.

## Composição
Abertura tipográfica assimétrica; PeladaPro ocupa o maior espaço visual. Os outros trabalhos alternam imagem e texto, sem grade de cartões idênticos. Linha editorial fina organiza metadados. Contato fecha com escala grande e links diretos.

As imagens de projetos são capturas reais das páginas iniciais públicas, feitas em 10/11/2026. Há capturas desktop (1440 × 900 px) e mobile (390 × 620 px). JPEGs otimizados mantêm dimensões reservadas; o mobile usa sua própria captura para preservar o enquadramento legível. Links textuais ficam junto a cada projeto, deixando as capturas livres de controles sobrepostos.

## Acessibilidade e desempenho
Rolagem nativa. Camada decorativa inacessível e sem eventos de ponteiro. `prefers-reduced-motion` remove movimento; controle persistente pausa animação ambiente. Aba oculta pausa via Page Visibility API. Em telas pequenas, o campo é simplificado. Dimensões de mídia reservadas.
