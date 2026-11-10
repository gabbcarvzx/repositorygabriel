# Revisão da página principal — 10/11/2026

## Problemas observados e correções

| Evidência inicial | Correção |
|---|---|
| A abertura exibia o nome com força, mas descrevia a atuação de forma vaga e usava apenas uma seta como CTA visível. | Texto factual sobre UNINASSAU e projetos web; ação “Explorar projetos” visível em PT e EN. |
| Em 768 px, as mídias de Expansão Giraffas e FE Prime ultrapassavam a largura disponível e eram cortadas pelo link que as continha. | Projetos empilhados no tablet, com mídia em largura integral. |
| Em 360 px, capturas desktop reduzidas tornavam o conteúdo dos sites ilegível. | Capturas mobile reais em `<picture>`, com dimensões reservadas. FE Prime ganhou enquadramento mais alto para mostrar o título inteiro. |
| Círculos verdes repetidos sobre as capturas competiam com os próprios controles visíveis nos sites. | Removidos os círculos; links de demonstração e código continuam explícitos junto ao texto. |
| A pausa manual podia ser desfeita ao voltar para uma aba visível. | Estado da pausa composto com a visibilidade da aba e a interseção do fundo. O fundo também para fora da área visível. |
| Uma requisição de favicon ausente produzia 404 no console. | Favicon local adicionado às três entradas HTML. |

## Evidência visual

Capturas finais: [PT 360](final/pt-360.png), [PT 768](final/pt-768.png), [PT 1440](final/pt-1440.png), [EN 360](final/en-360.png), [EN 768](final/en-768.png), [EN 1440](final/en-1440.png). O [relatório medido](final/report.json) registra dimensões, fontes de mídia, erros e estados de motion. As capturas dos projetos em `public/projects/` vêm dos sites publicados; não são capas gráficas criadas para simular telas.

Em todas as seis combinações, quatro imagens carregaram e o navegador não registrou erros no console. Os únicos elementos cuja caixa geométrica ultrapassou a largura da janela foram `field__halo` e `field__lines`, ambos filhos da camada decorativa `field` com `overflow:hidden`, `pointer-events:none` e `aria-hidden`. Nenhum título, imagem de projeto ou controle ficou fora da janela no relatório final.

## Motion observado

Em repouso por 1,1 s, a transformação do halo e das linhas mudou enquanto a posição do título ficou estável. Quatro passos de roda de 160 px geraram deslocamentos do campo de −8, −16, −24 e −32 px; a opacidade caiu gradualmente de 0,62 para cerca de 0,46. No celular emulado, as linhas usam translação 2D. A pausa manual congelou ambas as animações; o estado continuou pausado após eventos simulados de ocultar e mostrar a aba. Quando o campo saiu da área visível, `IntersectionObserver` também o pausou. Em `prefers-reduced-motion`, as transformações permaneceram estáticas nas amostras separadas por 500 ms.

Essas medições foram feitas em Chrome headless no computador, com viewport mobile emulado. Não medem fluidez em hardware de celular nem confirmam o evento de visibilidade disparado por uma aba real do usuário; nesse caso o handler foi exercitado com eventos simulados.

## Dependências

`npm audit` relatou sete avisos moderados ligados à mesma cadeia de desenvolvimento: `typescript-eslint@8.72.2` usa `@typescript-eslint/typescript-estree`, que depende de `minimatch@10.2.6`. O aviso [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) descreve possível negação de serviço com padrões glob amplificados. O lint deste projeto usa padrões definidos no próprio repositório e não recebe padrões de visitantes. `npm audit --omit=dev` relatou zero vulnerabilidades nas dependências de produção. A correção sugerida pelo npm envolve mudança incompatível; nenhuma atualização forçada foi feita.

## Pendências

Faltam detalhes confirmados da participação de Gabriel em cada projeto e um endereço de código acessível para Expansão Giraffas. A tentativa de consulta ao endereço fornecido está registrada em `docs/project-content.md`; o resultado não prova a inexistência do repositório. Uma avaliação em dispositivos físicos e uma auditoria aprofundada de acessibilidade e desempenho ainda não foram realizadas.
