# Plano de implementação

1. Descoberta: inspecionar workspace, skills, fontes e limites de acesso.
2. Fundação: Vite, React, TypeScript, Tailwind, conteúdo PT/EN e rotas equivalentes.
3. Página principal: navegação, abertura, fundo animado, projetos, sobre e contato.
4. Verificação: build, tipos, lint, larguras 360/768/1440, teclado, idioma, motion e links.
5. Depois: obter capturas reais, confirmar participação e tecnologias dos projetos, criar páginas internas completas e incluir currículo quando o arquivo existir.

Critério desta entrega: página principal executável, conteúdo factual, links funcionais e limitações documentadas.

## Resultado desta sessão

- Página principal, rotas PT/EN, metadados estáticos por idioma, campo animado e quatro capturas reais implementados.
- `npm run typecheck`, `npm run lint` e `npm run build` passaram em 10/11/2026.
- Chrome headless verificou 360, 768 e 1440 px: sem overflow horizontal nem erros JavaScript; menu mobile, troca de idioma, persistência da pausa, foco inicial por teclado e `prefers-reduced-motion` conferidos.
- Capturas locais da verificação ficam em `docs/screenshots/` (ignoradas pelo Git). Ainda faltam auditoria detalhada de acessibilidade e desempenho, além de páginas internas completas.
