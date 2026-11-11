# Fluxo de entrega

## Estado em 11/11/2026

O remoto `origin` é `https://github.com/gabbcarvzx/repositorygabriel.git` (repositório público). `main` é a branch padrão e permanece no baseline `06d07fefc547870858e0511ce7902c21d7c4a888`. A entrega está na branch `fix/motion-parallax`, com [PR #1 em rascunho](https://github.com/gabbcarvzx/repositorygabriel/pull/1) para revisão. O primeiro push para o repositório vazio tornou temporariamente essa branch a padrão; `main` foi criada no baseline e restaurada como padrão antes do PR. Nenhum merge ou deploy foi feito. O CI do PR executa tipos, lint, build e capturas; `verify.yml` foi fixado em `ubuntu-24.04` porque o Playwright 1.58.0 não instala Chromium no runner Ubuntu 26.04. Não foi confirmado vínculo com Vercel ou autenticação da conta Vercel. Nenhum token foi registrado no repositório.

## Caminho preparado

1. **Código:** trabalhar em branch própria. Preservar alterações locais; não usar reset forçado. Ao fim, registrar SHA completo.
2. **Revisão:** analisar conteúdo e fatos confirmados, fluxos, responsividade, acessibilidade, idiomas e motion. Os checks de CI são automáticos; julgamento visual é humano e deve usar capturas. Uma repetição da própria conclusão não é revisão independente.
3. **Correções:** corrigir achados e repetir os checks afetados. Limite operacional: duas tentativas automáticas para a mesma falha; se persistir, parar o ciclo e relatar causa e evidência.
4. **Verificações:** `verify.yml` executa `npm ci`, tipos, lint, build e `scripts/verify_delivery.py`. Este testa seis combinações PT/EN × 360/768/1440, rotas dos quatro projetos, imagens, troca de idioma no mesmo projeto, menu mobile, console, overflow, pausa, persistência, aba oculta simulada e movimento reduzido. Gera capturas e `checks.json`/relatório curto como artefato por SHA. Não mede fluidez em dispositivo físico nem substitui inspeção visual.
5. **Relatório/preview:** anexar mudanças, achados e correções, checks, capturas, limitações, SHA completo e URL de preview se houver. Com Git integrado à Vercel, push da branch cria preview antes da aprovação final; isso já é publicação externa e exige autorização nesta sessão. Não há preview enquanto remoto e Vercel não forem conectados.
6. **Aprovação:** Gabriel aprova explicitamente o SHA e a entrega apresentados. Qualquer alteração posterior exige novos checks, relatório e aprovação. O merge só ocorre depois dessa aprovação. Regras de branch podem exigir status checks e revisão por identidade distinta, se o plano permitir.
7. **Merge:** mesclar a branch em `main` após aprovação. `release.yml` requer o SHA aprovado, comprova que é ancestral de `main` e que a árvore de arquivos em `main` é **idêntica** à árvore aprovada. Assim, um merge commit não invalida a comparação de conteúdo; outra alteração a invalida.
8. **Produção:** `release.yml` inicia apenas manualmente em `main`, falha até `PRODUCTION_GATE_READY=true` e separa `validate`/`preflight` sem credenciais do job `production` com ambiente GitHub protegido. O job de produção só recebe os segredos depois da aprovação exigida pelo ambiente. Ele faz build/deploy pelo Vercel CLI. `vercel.json` desativa o deploy Git automático de `main` para evitar dois caminhos de produção; outras branches continuam elegíveis a preview pela integração Git. Não configurar outro gatilho de produção.
9. **Pós-deploy:** job sem credenciais abre a URL produzida, confere o marcador de SHA, rotas PT/EN e imagens principais. Falha deve ser investigada antes de anunciar conclusão. Para voltar, usar rollback de produção na Vercel para o deployment anterior e depois corrigir o código; conferir a URL e o marcador novamente.

## Ativação que depende de Gabriel

- A branch de revisão já foi enviada ao repositório público com autorização posterior de Gabriel. Avaliar o PR e aprovar explicitamente o SHA exato antes de qualquer merge. Novos commits invalidam aprovações anteriores.
- Indicar ou criar, com autorização separada, o **projeto Vercel de destino** e vinculá-lo ao mesmo repositório para previews. Confirmar a branch de produção `main` e que `git.deploymentEnabled.main=false` será aplicado. O preview será publicamente acessível conforme as configurações da conta.
- Configurar no GitHub o ambiente `production` com **required reviewer** de Gabriel, restringir a `main` e impedir bypass quando disponível. Se o próprio Gabriel iniciar o workflow e a opção de impedir self-review estiver ativa, será necessária outra pessoa revisora; ajustar o desenho ao controle desejado. Verificar disponibilidade no plano: em GitHub Free/Pro/Team, required reviewers para environments estão disponíveis somente em repositórios públicos. Se o destino privado/plano não suportar o gate, não ativar `PRODUCTION_GATE_READY`; alternativa: fazer deploy manual por Gabriel após aprovação explícita do SHA e checks, sem afirmar que há gate automático.
- Configurar `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` como secrets **somente** do ambiente protegido `production`. Não colocar em variáveis do job de checks. Testar a integração com um release autorizado antes de chamar o fluxo operacional.
- Ativar `PRODUCTION_GATE_READY=true` só depois de verificar a proteção do ambiente, o destino e o caminho único de deploy. Exigir checks de `verify.yml` na regra de branch; revisar se o plano permite aprovação de PR por identidade distinta e descarte de aprovações obsoletas.

O arquivo de workflow prepara o mecanismo; sem remoto, projeto Vercel, segredos e regra de ambiente verificada, o gate **não está operacional**. Não usar a documentação como substituto da configuração técnica.

## Fontes oficiais consultadas

- [GitHub Environments e required reviewers](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Vercel Git deployments](https://vercel.com/docs/git)
- [Vercel git.deploymentEnabled](https://vercel.com/docs/project-configuration/git-configuration)
- [Vercel CLI deploy](https://vercel.com/docs/cli/deploy)
- [Vercel rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
