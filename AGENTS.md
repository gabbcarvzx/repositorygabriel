# Instruções do projeto

Este repositório contém o portfólio bilíngue de Gabriel Carvalho para recrutadores e clientes. Antes de alterar interfaces, consulte as skills pertinentes disponíveis na sessão e leia `PRODUCT.md`, `DESIGN.md` e `docs/project-content.md`. Não invente fatos, participação, tecnologias, métricas ou capturas.

Validação: `npm run typecheck`, `npm run lint`, `npm run build` e `npm run dev` (confirmar após instalar dependências). Verifique o resultado renderizado em celular, tablet e desktop, incluindo teclado, idioma e movimento reduzido. Registre qualquer ferramenta indisponível.

Entrega: seguir `docs/delivery-workflow.md`. Trabalhar em branch própria, executar checks e capturas com `python scripts/verify_delivery.py`, produzir relatório com SHA completo e pedir aprovação explícita de Gabriel para esse SHA antes do merge em `main`. Alterações posteriores invalidam a aprovação. Push, preview e publicação exigem autorização para destino e efeito específicos. A integração Git do projeto `gabbcarvzxs-projects/repositorygabriel` na Vercel publica `main`; não adicionar outro caminho de deploy. `verify.yml` não usa credenciais de publicação. Após o merge, verificar o domínio público e o SHA publicado com `scripts/verify_production.py`. Distinguir regras de proteção configuradas de aprovação apenas documentada.
