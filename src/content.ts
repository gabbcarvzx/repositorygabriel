export type Language = 'pt' | 'en';
export type Project = { id: string; name: string; category: string; summary: string; details: string; live: string; code?: string; stack?: string; visual: string };

const urls = {
  pelada: { live: 'https://peladaprohub.vercel.app/', code: 'https://github.com/gabbcarvzx/PeladaPro' },
  giraffas: { live: 'https://expansao-giraffas.vercel.app/' },
  exclusiva: { live: 'https://exclusivamodas.vercel.app/', code: 'https://github.com/gabbcarvzx/exclusivamodas' },
  prime: { live: 'https://juniormodelo.vercel.app/', code: 'https://github.com/gabbcarvzx/juniormodelo' }
};

export const content = {
  pt: {
    nav: { projects: 'Projetos', about: 'Sobre', contact: 'Contato', menu: 'Abrir menu', close: 'Fechar menu' },
    hero: { lead: 'Estudante de Sistemas de Informação na UNINASSAU. Desenvolvo projetos web.', line: 'Sites e aplicações pensados para quem vai usar.', action: 'Explorar projetos', scroll: 'Role para descobrir' },
    labels: { selected: 'Trabalho em destaque', more: 'Outros projetos', live: 'Ver projeto', code: 'Ver código', process: 'Processo', pause: 'Pausar animação', play: 'Retomar animação' },
    featured: { title: 'Uma pelada mais organizada, dentro e fora de campo.', body: 'O PeladaPro reúne cadastro de jogadores, ordem de chegada, sorteio de confrontos e registros de gols e assistências em uma aplicação.', process: 'Desenvolvido com TypeScript e Tailwind CSS, com apoio do Codex.' },
    projects: [
      { id: 'pelada', name: 'PeladaPro', category: 'Aplicação web', summary: 'Organização de peladas', details: 'Jogadores, confrontos e registros da partida em um só lugar.', visual: 'JOGO / EM ORDEM', stack: 'TypeScript · Tailwind CSS', ...urls.pelada },
      { id: 'giraffas', name: 'Expansão Giraffas', category: 'Site de apresentação', summary: 'Expansão comercial', details: 'Site criado para Gessé Lira, consultor comercial de expansão da rede Giraffas.', visual: 'EXPANSÃO', ...urls.giraffas },
      { id: 'exclusiva', name: 'Exclusiva Modas', category: 'Catálogo digital', summary: 'Moda feminina', details: 'Apresentação de roupas e contato direto pelo WhatsApp.', visual: 'EXCLUSIVA', ...urls.exclusiva },
      { id: 'prime', name: 'FE Prime', category: 'Site de apresentação', summary: 'Serviços e experiências', details: 'Perfumaria, cosméticos, viagens, beleza, coworking e soluções com atendimento personalizado.', visual: 'FE PRIME', ...urls.prime }
    ] satisfies Project[],
    about: { title: 'Sobre mim', first: 'Sou Gabriel Carvalho, estudante de Sistemas de Informação na UNINASSAU. Minha prática em projetos web combina construção, experimentação e atenção à experiência de uso.', second: 'Tenho inglês C2 e vivência acadêmica em Vancouver. No desenvolvimento, uso Codex e vibecoding como parte do processo: avalio, ajusto e assumo as decisões do que entrego.' },
    contact: { title: 'Vamos conversar?', body: 'Se um projeto despertou seu interesse, entre em contato ou conheça mais do meu trabalho.', linkedin: 'Conversar no LinkedIn', github: 'Explorar GitHub' },
    footer: 'Feito com atenção aos detalhes.', metaTitle: 'Gabriel Carvalho — Projetos web', metaDescription: 'Portfólio de Gabriel Carvalho. Projetos web, processo de desenvolvimento e contato.', portfolio: 'PORTFÓLIO / 2026', englishLevel: 'INGLÊS C2'
  },
  en: {
    nav: { projects: 'Projects', about: 'About', contact: 'Contact', menu: 'Open menu', close: 'Close menu' },
    hero: { lead: 'Information Systems student at UNINASSAU. I build web projects.', line: 'Sites and applications shaped around the people using them.', action: 'Explore projects', scroll: 'Scroll to explore' },
    labels: { selected: 'Featured work', more: 'More projects', live: 'View live site', code: 'View code', process: 'Process', pause: 'Pause animation', play: 'Resume animation' },
    featured: { title: 'A better organized pickup game, on and off the pitch.', body: 'PeladaPro brings player registration, arrival order, matchup draws, and goal and assist records together in one application.', process: 'Built with TypeScript and Tailwind CSS, with support from Codex.' },
    projects: [
      { id: 'pelada', name: 'PeladaPro', category: 'Web application', summary: 'Pickup football, organized', details: 'Players, matchups and game records in one place.', visual: 'GAME / IN ORDER', stack: 'TypeScript · Tailwind CSS', ...urls.pelada },
      { id: 'giraffas', name: 'Expansão Giraffas', category: 'Presentation site', summary: 'Commercial expansion', details: 'A site created for Gessé Lira, a commercial consultant for Giraffas network expansion.', visual: 'EXPANSION', ...urls.giraffas },
      { id: 'exclusiva', name: 'Exclusiva Modas', category: 'Digital catalogue', summary: 'Women’s fashion', details: 'A clothing catalogue with direct contact through WhatsApp.', visual: 'EXCLUSIVA', ...urls.exclusiva },
      { id: 'prime', name: 'FE Prime', category: 'Presentation site', summary: 'Services and experiences', details: 'Perfumery, cosmetics, travel, beauty, coworking and personalized services.', visual: 'FE PRIME', ...urls.prime }
    ] satisfies Project[],
    about: { title: 'About me', first: 'I’m Gabriel Carvalho, an Information Systems student at UNINASSAU. My hands-on web projects combine building, experimentation and attention to the user experience.', second: 'I have C2 English proficiency and an academic experience in Vancouver. I use Codex and vibe coding in my development process, reviewing, refining and taking responsibility for the decisions behind what I ship.' },
    contact: { title: 'Let’s talk.', body: 'If a project caught your attention, get in touch or explore more of my work.', linkedin: 'Connect on LinkedIn', github: 'Explore GitHub' },
    footer: 'Made with attention to detail.', metaTitle: 'Gabriel Carvalho — Web projects', metaDescription: 'Gabriel Carvalho’s portfolio. Web projects, development process and contact.', portfolio: 'PORTFOLIO / 2026', englishLevel: 'ENGLISH C2'
  }
} as const;
