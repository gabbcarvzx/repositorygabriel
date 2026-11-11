# Fluxo de entrega

## Destinos e configuração confirmados

- Repositório: `https://github.com/gabbcarvzx/repositorygabriel`; branch de produção: `main`.
- Projeto Vercel: `gabbcarvzxs-projects/repositorygabriel`; domínio público: `https://repositorygabriel.vercel.app`.
- Integração GitHub → Vercel: `main` gera produção; branches e PRs geram previews. Este é o único caminho de publicação. O workflow manual `release.yml` foi retirado para evitar deploy duplicado.
- Vite na raiz do repositório, instalação `npm ci` pelo lockfile, build `npm run build` e saída `dist`. `vercel.json` mantém os rewrites de `/pt/projects/:id` e `/en/projects/:id` para os respectivos documentos de entrada.
- O marcador `meta[name="portfolio-version"]` usa `VITE_VERCEL_GIT_COMMIT_SHA` no build da Vercel; `VITE_BUILD_SHA` continua disponível para o CI. Não fixar um SHA no código.

## De branch a produção

1. Trabalhar em branch própria, preservar o trabalho local e manter o PR como unidade de revisão. Não usar force-push para substituir histórico aprovado.
2. Revisar funcionalidade, fatos, idiomas, responsividade, teclado, motion e capturas. `verify.yml` executa `npm ci`, tipos, lint, build e `scripts/verify_delivery.py`, que produz capturas e um relatório por SHA. Checks automáticos não substituem avaliação visual nem teste em celular físico.
3. Corrigir achados e repetir os checks afetados. Limitar a duas tentativas automáticas para a mesma falha; se persistir, registrar causa e interromper o ciclo.
4. Apresentar o SHA completo, relatório e preview para aprovação explícita de Gabriel. A aprovação deve anteceder o merge. Qualquer novo commit exige nova verificação e aprovação do novo SHA. Aprovação no chat ou texto do PR é procedimento humano; só regras efetivamente configuradas no GitHub impedem um merge direto.
5. Integrar por PR em `main` após checks e aprovação. A integração Git da Vercel inicia um único deployment de produção. Não iniciar `vercel deploy --prod` nem outro workflow de publicação para o mesmo commit.
6. Acompanhar o deployment até `READY`. Verificar o domínio público, marcador de versão, `/`, `/pt`, `/en`, as oito rotas de projeto, imagens, fontes, favicon, links, console, pausa e movimento reduzido. Executar `scripts/verify_production.py` com a URL pública e o SHA de `main`.

## Proteção e limites

- A configuração de branch protection e as regras de aprovação devem ser inspecionadas no GitHub. Não afirmar que a aprovação humana é tecnicamente obrigatória se não houver regra de revisão aplicável. Para um PR criado pela própria conta de Gabriel, uma aprovação exigida de outra identidade pode bloquear um mantenedor único; decidir isso antes de ativar tal regra.
- `verify.yml` não usa credenciais de publicação. O projeto Vercel usa sua integração Git existente; não há necessidade de `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` ou `PRODUCTION_GATE_READY` no GitHub Actions para este caminho.
- Se um deploy falhar, consultar logs da Vercel, corrigir a causa na branch de revisão, repetir checks e integrar a correção. Não alterar a identidade do commit aprovado silenciosamente.

## Retorno à versão anterior

Usar o rollback do deployment de produção anterior na Vercel, conferir o domínio e o marcador novamente e corrigir o código por novo PR. O rollback pode suspender a atribuição automática do domínio a novos deployments; confirmar e restaurar essa atribuição pela promoção do deployment correto antes de voltar ao fluxo de merges.

## Referências

- [Vercel Git deployments](https://vercel.com/docs/git)
- [Vercel git.deploymentEnabled](https://vercel.com/docs/project-configuration/git-configuration)
- [Vercel Vite e variáveis de framework](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Vercel rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
- [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
