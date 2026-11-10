# Instruções do projeto

Este repositório contém o portfólio bilíngue de Gabriel Carvalho para recrutadores e clientes. Antes de alterar interfaces, consulte as skills pertinentes disponíveis na sessão e leia `PRODUCT.md`, `DESIGN.md` e `docs/project-content.md`. Não invente fatos, participação, tecnologias, métricas ou capturas.

Validação: `npm run typecheck`, `npm run lint`, `npm run build` e `npm run dev` (confirmar após instalar dependências). Verifique o resultado renderizado em celular, tablet e desktop, incluindo teclado, idioma e movimento reduzido. Registre qualquer ferramenta indisponível.

Entrega: seguir `docs/delivery-workflow.md`. Trabalhar em branch própria, executar checks e capturas com `python scripts/verify_delivery.py`, produzir relatório com SHA completo e pedir aprovação explícita de Gabriel para esse SHA antes de merge e produção. Alterações posteriores invalidam a aprovação. Não fazer push, criar preview ou publicar sem autorização para destino e efeito específicos. `verify.yml` não usa credenciais; o job de deploy usa ambiente `production` protegido. Nunca ativar `PRODUCTION_GATE_READY` antes de confirmar as regras do ambiente e o caminho único de produção na Vercel.
